package com.smartcampus.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {
    @Id private String id;
    private String title;
    private String description;
    private TicketCategory category;
    private TicketPriority priority;
    @Builder.Default private TicketStatus status = TicketStatus.OPEN;
    private String submittedById;
    private String submittedByName;
    private String assignedToId;
    private String assignedToName;
    private String location;
    private String preferredContactDetails;
    private String rejectionReason;
    private String resolutionNotes;
    @Builder.Default private List<String> images = new ArrayList<>();
    @Builder.Default private List<Comment> comments = new ArrayList<>();
    private LocalDateTime slaDeadline;
    @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
}
