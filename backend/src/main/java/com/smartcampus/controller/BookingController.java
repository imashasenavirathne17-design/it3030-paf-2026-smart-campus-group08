package com.smartcampus.controller;

import com.smartcampus.dto.request.CreateBookingRequest;
import com.smartcampus.model.Booking;
import com.smartcampus.security.UserPrincipal;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<List<Booking>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(bookingService.getAllBookings(principal));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getById(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PostMapping
    public ResponseEntity<Booking> create(@Valid @RequestBody CreateBookingRequest request,
                                          @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(request, principal));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> approve(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> reject(@PathVariable String id, @RequestParam(required = false) String rejectReason) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, rejectReason));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancel(@PathVariable String id,
                                         @RequestBody java.util.Map<String, String> body,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        if (body == null || !body.containsKey("reason")) {
            throw new RuntimeException("Cancellation reason is required in the request body");
        }
        String reason = body.get("reason");
        return ResponseEntity.ok(bookingService.cancelBooking(id, reason, principal));
    }

    @PutMapping("/{id}/cancel/accept")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> acceptCancel(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.acceptCancellation(id));
    }

    @PutMapping("/{id}/cancel/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> rejectCancel(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.rejectCancellation(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        bookingService.deleteBooking(id, principal);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> update(@PathVariable String id,
                                          @Valid @RequestBody CreateBookingRequest request,
                                          @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(bookingService.updateBooking(id, request, principal));
    }

    @PutMapping("/{id}/checkin")
    public ResponseEntity<Booking> checkIn(@PathVariable String id,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(bookingService.checkInBooking(id, principal));
    }
    @PutMapping("/{id}/collect")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> collect(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.collectBooking(id));
    }

    @PutMapping("/{id}/return")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> returnEquipment(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.returnBooking(id));
    }
}
