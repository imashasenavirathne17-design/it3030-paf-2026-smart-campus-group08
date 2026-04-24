package com.smartcampus.hub.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    private String name;
    private ResourceType type;
    private int capacity;
    private String location;
    private String building;
    private String floor;
    private String description;
    private String imageUrl;

    @Builder.Default
    private ResourceStatus status = ResourceStatus.AVAILABLE;

    private boolean available;
    private String amenities;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum ResourceType {
        LECTURE_HALL, LAB, CONFERENCE_ROOM, SPORTS_FACILITY,
        STUDY_ROOM, AUDITORIUM, EQUIPMENT, OTHER
    }

    public enum ResourceStatus {
        AVAILABLE, UNAVAILABLE, MAINTENANCE, RESERVED
    }
}
