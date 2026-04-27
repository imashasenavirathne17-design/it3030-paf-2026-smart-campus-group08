package com.smartcampus.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id private String id;
    private String name;
    @Indexed(unique = true) private String email;
    private String picture;
    private String password;
    private String provider;
    private String providerId;
    @Builder.Default private Role role = Role.STUDENT;
    @Builder.Default private java.util.Map<String, Boolean> notificationPreferences = new java.util.HashMap<>();
    @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    @Builder.Default private java.util.List<LoginEvent> loginHistory = new java.util.ArrayList<>();

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LoginEvent {
        private LocalDateTime timestamp;
        private String provider;
        private String status;
        private String ipAddress;
    }
}
