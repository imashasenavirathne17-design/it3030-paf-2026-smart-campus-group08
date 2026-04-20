package com.smartcampus.hub.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    @Indexed
    private String resourceId;
    private String resourceName;

    @Indexed
    private String userId;
    private String userName;
    private String userEmail;

    private String purpose;
    private int attendeeCount;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    private String adminNote;
    private String approvedBy;
    private LocalDateTime approvedAt;

    private String qrCode;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum BookingStatus {
        PENDING, APPROVED, REJECTED, CANCELLED
    }
}
