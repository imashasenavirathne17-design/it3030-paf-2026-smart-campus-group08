package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceId(String resourceId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByUserIdAndStatus(String userId, BookingStatus status);
    List<Booking> findByResourceIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
        String resourceId, BookingStatus status, LocalDateTime end, LocalDateTime start);
    List<Booking> findByResourceIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
        String resourceId, BookingStatus status, LocalDateTime end, LocalDateTime start, String id);
    long countByStatus(BookingStatus status);
}
