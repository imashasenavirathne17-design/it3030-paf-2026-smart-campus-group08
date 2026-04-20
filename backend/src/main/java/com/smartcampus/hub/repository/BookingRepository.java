package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceId(String resourceId);
    List<Booking> findByStatus(Booking.BookingStatus status);
    List<Booking> findByUserIdAndStatus(String userId, Booking.BookingStatus status);

    @Query("{ 'resourceId': ?0, 'status': { $in: ['PENDING', 'APPROVED'] }, " +
           "$or: [ { 'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 } } ] }")
    List<Booking> findConflictingBookings(String resourceId, LocalDateTime startTime, LocalDateTime endTime);

    List<Booking> findByResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            String resourceId,
            List<Booking.BookingStatus> statuses,
            LocalDateTime endTime,
            LocalDateTime startTime
    );

    long countByStatus(Booking.BookingStatus status);
    long countByUserId(String userId);
}
