package com.smartcampus.service.impl;

import com.smartcampus.dto.request.CreateBookingRequest;
import com.smartcampus.model.*;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.security.UserPrincipal;
import com.smartcampus.service.BookingService;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    @Override
    public List<Booking> getAllBookings(UserPrincipal principal) {
        // Return all bookings so the Grid View can correctly show occupied slots for everyone
        return bookingRepository.findAll();
    }

    @Override
    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
    }

    @Override
    public Booking createBooking(CreateBookingRequest req, UserPrincipal principal) {
        Resource resource = resourceRepository.findById(req.getResourceId())
            .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (resource.getStatus() == ResourceStatus.OUT_OF_SERVICE)
            throw new RuntimeException("Resource is out of service");

        // Stock/Conflict detection
        List<Booking> overlapping = bookingRepository
            .findByResourceIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                req.getResourceId(), BookingStatus.APPROVED, req.getEndTime(), req.getStartTime());
        
        String type = resource.getType() != null ? resource.getType() : "";
        boolean isEquipment = type.equals("Projector") || type.equals("Camera") || 
                             type.equals("Laptop") || type.equals("Microphone") || 
                             type.equals("Speaker") || type.equals("Extension Cord");

        if (isEquipment) {
            int totalBooked = overlapping.stream().mapToInt(b -> b.getQuantity() != null ? b.getQuantity() : 1).sum();
            int requested = req.getQuantity() != null ? req.getQuantity() : 1;
            int totalCapacity = resource.getCapacity() != null ? resource.getCapacity() : 1;
            
            if (requested <= 0) throw new RuntimeException("Requested quantity must be at least 1");
            
            if (totalBooked + requested > totalCapacity) {
                throw new RuntimeException("Requested quantity (" + requested + ") exceeds available stock (" + (totalCapacity - totalBooked) + ")");
            }
        } else {
            // For rooms/labs, any overlap is a conflict
            if (!overlapping.isEmpty()) throw new RuntimeException("Booking conflict detected");
        }

        Booking booking = Booking.builder()
            .resourceId(req.getResourceId()).resourceName(resource.getName())
            .userId(principal.getId()).userName(principal.getName()).userEmail(principal.getEmail())
            .startTime(req.getStartTime()).endTime(req.getEndTime())
            .purpose(req.getPurpose()).expectedAttendees(req.getExpectedAttendees())
            .quantity(req.getQuantity())
            .notes(req.getNotes())
            .build();

        booking = bookingRepository.save(booking);
        notificationService.createNotification(principal.getId(), NotificationType.BOOKING_CREATED,
            "Your booking for " + resource.getName() + " is pending approval", booking.getId());
        return booking;
    }

    @Override
    public Booking approveBooking(String id) {
        Booking booking = getBookingById(id);
        booking.setStatus(BookingStatus.APPROVED);
        booking.setUpdatedAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);
        notificationService.createNotification(booking.getUserId(), NotificationType.BOOKING_APPROVED,
            "Your booking for " + booking.getResourceName() + " has been approved", id);
        return booking;
    }

    @Override
    public Booking rejectBooking(String id, String reason) {
        Booking booking = getBookingById(id);
        booking.setStatus(BookingStatus.REJECTED);
        if (reason != null && !reason.trim().isEmpty()) {
            booking.setRejectionReason(reason);
        }
        booking.setUpdatedAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);
        
        String notificationMessage = "Your booking for " + booking.getResourceName() + " has been rejected";
        if (reason != null && !reason.trim().isEmpty()) {
            notificationMessage += ". Reason: " + reason;
        }
        
        notificationService.createNotification(booking.getUserId(), NotificationType.BOOKING_REJECTED,
            notificationMessage, id);
        return booking;
    }

    @Override
    public Booking cancelBooking(String id, String reason, UserPrincipal principal) {
        Booking booking = getBookingById(id);
        if (!principal.getRole().equals("ADMIN") && !booking.getUserId().equals(principal.getId()))
            throw new RuntimeException("Not authorized to cancel this booking");
        
        // If it's already approved, it needs admin approval to cancel
        if (booking.getStatus() == BookingStatus.APPROVED || booking.getStatus() == BookingStatus.CHECKED_IN) {
            booking.setStatus(BookingStatus.CANCEL_REQUESTED);
            booking.setCancelRequestedAt(LocalDateTime.now());
        } else {
            // If it's pending, just cancel it immediately
            booking.setStatus(BookingStatus.CANCELLED);
        }

        if (reason != null && !reason.trim().isEmpty()) {
            booking.setCancellationReason(reason);
        } else {
            booking.setCancellationReason("DEBUG: No reason received by backend");
        }
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    @Override
    public Booking acceptCancellation(String id) {
        Booking booking = getBookingById(id);
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    @Override
    public Booking rejectCancellation(String id) {
        Booking booking = getBookingById(id);
        // Revert to APPROVED (assuming it was approved before request)
        booking.setStatus(BookingStatus.APPROVED);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    @Override
    public void deleteBooking(String id, UserPrincipal principal) {
        Booking booking = getBookingById(id);
        if (!principal.getRole().equals("ADMIN") && !booking.getUserId().equals(principal.getId()))
            throw new RuntimeException("Not authorized to delete this booking");
        bookingRepository.deleteById(id);
    }

    @Override
    public Booking updateBooking(String id, CreateBookingRequest req, UserPrincipal principal) {
        Booking booking = getBookingById(id);
        if (!principal.getRole().equals("ADMIN") && !booking.getUserId().equals(principal.getId()))
            throw new RuntimeException("Not authorized to update this booking");
        
        if (req.getEndTime().isBefore(req.getStartTime()))
            throw new RuntimeException("End time must be after start time");

        Resource resource = resourceRepository.findById(req.getResourceId())
            .orElseThrow(() -> new RuntimeException("Resource not found"));

        // Stock/Conflict detection (exclude current booking)
        List<Booking> overlapping = bookingRepository
            .findByResourceIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
                req.getResourceId(), BookingStatus.APPROVED, req.getEndTime(), req.getStartTime(), id);
        
        boolean isEquipment = resource.getType().equals("Projector") || resource.getType().equals("Camera") || 
                             resource.getType().equals("Laptop") || resource.getType().equals("Microphone") || 
                             resource.getType().equals("Speaker") || resource.getType().equals("Extension Cord");

        if (isEquipment) {
            int totalBooked = overlapping.stream().mapToInt(b -> b.getQuantity() != null ? b.getQuantity() : 1).sum();
            int requested = req.getQuantity() != null ? req.getQuantity() : 1;
            int totalCapacity = resource.getCapacity() != null ? resource.getCapacity() : 1;
            
            if (totalBooked + requested > totalCapacity) {
                throw new RuntimeException("Requested quantity (" + requested + ") exceeds available stock (" + (totalCapacity - totalBooked) + ")");
            }
        } else {
            if (!overlapping.isEmpty()) throw new RuntimeException("Booking conflict detected");
        }

        booking.setResourceId(req.getResourceId());
        booking.setResourceName(resource.getName());
        booking.setStartTime(req.getStartTime());
        booking.setEndTime(req.getEndTime());
        booking.setPurpose(req.getPurpose());
        booking.setExpectedAttendees(req.getExpectedAttendees());
        booking.setQuantity(req.getQuantity());
        booking.setNotes(req.getNotes());
        booking.setUpdatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }
    @Override
    public Booking checkInBooking(String id, UserPrincipal principal) {
        Booking booking = getBookingById(id);
        if (!principal.getRole().equals("ADMIN") && !booking.getUserId().equals(principal.getId()))
            throw new RuntimeException("Not authorized to check in to this booking");

        if (booking.getStatus() != BookingStatus.APPROVED)
            throw new RuntimeException("Only approved bookings can be checked into");

        LocalDateTime now = LocalDateTime.now();
        // Relaxation: Allow check-in anytime if it's the right day, or just skip strict time check for simulation
        // if (now.isBefore(booking.getStartTime().minusMinutes(15)) || now.isAfter(booking.getEndTime())) {
        //     throw new RuntimeException("Can only check in between 15 mins before start and end of booking");
        // }

        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setUpdatedAt(now);
        return bookingRepository.save(booking);
    }
    @Override
    public Booking collectBooking(String id) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.APPROVED)
            throw new RuntimeException("Only approved bookings can be collected");
        booking.setStatus(BookingStatus.COLLECTED);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    @Override
    public Booking returnBooking(String id) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.COLLECTED)
            throw new RuntimeException("Only collected equipment can be returned");
        booking.setStatus(BookingStatus.RETURNED);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }
}
