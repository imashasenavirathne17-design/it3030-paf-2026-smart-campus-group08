package com.smartcampus.model;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Comment {
    @Builder.Default private String id = UUID.randomUUID().toString();
    private String userId;
    private String userName;
    private String content;
    @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
}
