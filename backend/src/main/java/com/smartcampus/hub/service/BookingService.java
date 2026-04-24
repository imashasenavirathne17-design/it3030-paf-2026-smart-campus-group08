package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.BookingDto;
import com.smartcampus.hub.exception.BookingConflictException;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.exception.UnauthorizedException;
import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.Notification;
import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final QrCodeService qrCodeService;

    public BookingDto.Response createBooking(String userId, BookingDto.Request request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource", request.getResourceId()));

        if (!resource.isAvailable()) {
            throw new BookingConflictException("Resource is not available for booking");
        }

        // Check for conflicts
        List<Booking> conflicts = bookingRepository
                .findByResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                        request.getResourceId(),
                        List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED),
                        request.getEndTime(),
                        request.getStartTime()
                );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("Resource is already booked during the requested time slot");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Booking booking = Booking.builder()
                .resourceId(resource.getId())
                .resourceName(resource.getName())
                .userId(userId)
                .userName(user.getName())
                .userEmail(user.getEmail())
                .purpose(request.getPurpose())
                .attendeeCount(request.getAttendeeCount())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(Booking.BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);

        notificationService.createNotification(userId, "Booking Submitted",
                "Your booking for " + resource.getName() + " is pending approval.",
                Notification.NotificationType.BOOKING_APPROVED, saved.getId(), "BOOKING");

        return toResponse(saved);
    }

    public List<BookingDto.Response> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<BookingDto.Response> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public BookingDto.Response getById(String id) {
        return toResponse(bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id)));
    }

    public BookingDto.Response approveOrReject(String id, String adminId, BookingDto.ApprovalRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be approved or rejected");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));

        booking.setStatus(request.getStatus());
        booking.setAdminNote(request.getAdminNote());
        booking.setApprovedBy(admin.getName());
        booking.setApprovedAt(LocalDateTime.now());

        if (request.getStatus() == Booking.BookingStatus.APPROVED) {
            String qr = qrCodeService.generateQrCode(booking.getId());
            booking.setQrCode(qr);
            notificationService.createNotification(booking.getUserId(), "Booking Approved! ✅",
                    "Your booking for " + booking.getResourceName() + " has been approved.",
                    Notification.NotificationType.BOOKING_APPROVED, id, "BOOKING");
        } else if (request.getStatus() == Booking.BookingStatus.REJECTED) {
            notificationService.createNotification(booking.getUserId(), "Booking Rejected ❌",
                    "Your booking for " + booking.getResourceName() + " was rejected. Reason: " + request.getAdminNote(),
                    Notification.NotificationType.BOOKING_REJECTED, id, "BOOKING");
        }

        return toResponse(bookingRepository.save(booking));
    }

    public BookingDto.Response cancelBooking(String id, String userId, Set<User.Role> roles) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        boolean isOwner = booking.getUserId().equals(userId);
        boolean isAdmin = roles.contains(User.Role.ADMIN);

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        notificationService.createNotification(booking.getUserId(), "Booking Cancelled",
                "Your booking for " + booking.getResourceName() + " has been cancelled.",
                Notification.NotificationType.BOOKING_CANCELLED, id, "BOOKING");

        return toResponse(bookingRepository.save(booking));
    }

    public BookingDto.Response toResponse(Booking b) {
        return BookingDto.Response.builder()
                .id(b.getId())
                .resourceId(b.getResourceId())
                .resourceName(b.getResourceName())
                .userId(b.getUserId())
                .userName(b.getUserName())
                .userEmail(b.getUserEmail())
                .purpose(b.getPurpose())
                .attendeeCount(b.getAttendeeCount())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .status(b.getStatus())
                .adminNote(b.getAdminNote())
                .approvedBy(b.getApprovedBy())
                .approvedAt(b.getApprovedAt())
                .qrCode(b.getQrCode())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
