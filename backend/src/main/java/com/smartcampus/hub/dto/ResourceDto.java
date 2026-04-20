package com.smartcampus.hub.dto;

import com.smartcampus.hub.model.Resource;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class ResourceDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Name is required")
        private String name;

        @NotNull(message = "Type is required")
        private Resource.ResourceType type;

        @Min(value = 1, message = "Capacity must be at least 1")
        private int capacity;

        @NotBlank(message = "Location is required")
        private String location;

        private String building;
        private String floor;
        private String description;
        private String imageUrl;
        private String amenities;
        private boolean available;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private String id;
        private String name;
        private Resource.ResourceType type;
        private int capacity;
        private String location;
        private String building;
        private String floor;
        private String description;
        private String imageUrl;
        private String amenities;
        private boolean available;
        private Resource.ResourceStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
