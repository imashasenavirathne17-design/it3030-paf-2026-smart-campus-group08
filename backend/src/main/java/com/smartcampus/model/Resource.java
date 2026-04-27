package com.smartcampus.model;

import lombok.*;
import org.springframework.data.annotation.Id;
<<<<<<< HEAD
=======
import org.springframework.data.mongodb.core.index.Indexed;
>>>>>>> feature/bookings
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "resources")
public class Resource {
    @Id private String id;
<<<<<<< HEAD
    private String name;
=======
    @Indexed(unique = true) private String name;
>>>>>>> feature/bookings
    private String type;
    private String location;
    private Integer capacity;
    private String description;
    private String availabilityWindows;
    @Builder.Default private ResourceStatus status = ResourceStatus.ACTIVE;
<<<<<<< HEAD
=======
    @Builder.Default private java.util.List<String> images = new java.util.ArrayList<>();
>>>>>>> feature/bookings
    @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
}
