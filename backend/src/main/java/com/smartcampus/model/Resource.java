package com.smartcampus.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "resources")
public class Resource {
    @Id private String id;
    @Indexed(unique = true) private String name;
    private String type;
    private String location;
    private Integer capacity;
    private String description;
    private String availabilityWindows;
    @Builder.Default private ResourceStatus status = ResourceStatus.ACTIVE;
    @Builder.Default private java.util.List<String> images = new java.util.ArrayList<>();
    @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
}
