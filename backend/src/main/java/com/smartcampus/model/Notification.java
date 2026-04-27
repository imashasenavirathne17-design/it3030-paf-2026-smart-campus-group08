package com.smartcampus.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "notifications")
public class Notification {
    @Id private String id;
    private String userId;
    private NotificationType type;
    private String message;
    private String referenceId;
 feature/bookings
    private String broadcastId;

 HEAD

    private String broadcastId;
 feature/bookings
 main
    @Builder.Default private boolean read = false;
    @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
}
