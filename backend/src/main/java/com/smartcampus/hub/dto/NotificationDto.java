package com.smartcampus.hub.dto;

import com.smartcampus.hub.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class NotificationDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private String id;
        private String userId;
        private String title;
        private String message;
        private Notification.NotificationType type;
        private String referenceId;
        private String referenceType;
        private boolean read;
        private LocalDateTime createdAt;
    }
}
