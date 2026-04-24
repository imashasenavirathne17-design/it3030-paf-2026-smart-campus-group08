package com.smartcampus.hub.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class CommentDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Content is required")
        private String content;
        private boolean internal;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private String id;
        private String ticketId;
        private String authorId;
        private String authorName;
        private String authorEmail;
        private String content;
        private boolean internal;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
