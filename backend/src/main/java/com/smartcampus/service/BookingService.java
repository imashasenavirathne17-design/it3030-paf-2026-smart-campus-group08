package com.smartcampus.service;

import com.smartcampus.dto.request.CreateBookingRequest;
import com.smartcampus.model.Booking;
import com.smartcampus.security.UserPrincipal;
import java.util.List;

public interface BookingService {
    List<Booking> getAllBookings(UserPrincipal principal);
    Booking getBookingById(String id);
    Booking createBooking(CreateBookingRequest request, UserPrincipal principal);
    Booking approveBooking(String id);
    Booking rejectBooking(String id, String reason);
    Booking cancelBooking(String id, String reason, UserPrincipal principal);
    Booking acceptCancellation(String id);
    Booking rejectCancellation(String id);
    void deleteBooking(String id, UserPrincipal principal);
    Booking updateBooking(String id, com.smartcampus.dto.request.CreateBookingRequest request, UserPrincipal principal);
    Booking checkInBooking(String id, UserPrincipal principal);
    Booking collectBooking(String id);
    Booking returnBooking(String id);
}
