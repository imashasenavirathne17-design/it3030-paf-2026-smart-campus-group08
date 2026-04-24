package com.smartcampus.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "bookings")
public class Booking {
    @Id private String id;
    private String resourceId;
    private String resourceName;
    private String userId;
    private String userName;
    private String userEmail;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private Integer quantity;
    private String notes;
    private String rejectionReason;
    private String cancellationReason;
    private LocalDateTime cancelRequestedAt;
    @Builder.Default private BookingStatus status = BookingStatus.PENDING;
    @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
}
