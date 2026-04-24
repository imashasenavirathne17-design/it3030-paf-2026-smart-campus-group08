package com.smartcampus.hub.dto;

import com.smartcampus.hub.model.Booking;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class BookingDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Resource ID is required")
        private String resourceId;

        @NotBlank(message = "Purpose is required")
        private String purpose;

        @Min(value = 1, message = "Attendee count must be at least 1")
        private int attendeeCount;

        @NotNull(message = "Start time is required")
        @Future(message = "Start time must be in the future")
        private LocalDateTime startTime;

        @NotNull(message = "End time is required")
        @Future(message = "End time must be in the future")
        private LocalDateTime endTime;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ApprovalRequest {
        @NotNull(message = "Status is required")
        private Booking.BookingStatus status;
        private String adminNote;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private String id;
        private String resourceId;
        private String resourceName;
        private String userId;
        private String userName;
        private String userEmail;
        private String purpose;
        private int attendeeCount;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Booking.BookingStatus status;
        private String adminNote;
        private String approvedBy;
        private LocalDateTime approvedAt;
        private String qrCode;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
