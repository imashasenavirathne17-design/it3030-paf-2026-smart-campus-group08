package com.smartcampus.hub.dto;

import com.smartcampus.hub.model.Ticket;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class TicketDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Description is required")
        private String description;

        @NotNull(message = "Category is required")
        private Ticket.TicketCategory category;

        @NotNull(message = "Priority is required")
        private Ticket.TicketPriority priority;

        private String location;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class StatusUpdate {
        @NotNull(message = "Status is required")
        private Ticket.TicketStatus status;
        private String resolutionNote;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AssignRequest {
        @NotBlank(message = "Technician ID is required")
        private String technicianId;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private String id;
        private String title;
        private String description;
        private Ticket.TicketCategory category;
        private Ticket.TicketPriority priority;
        private Ticket.TicketStatus status;
        private String reportedById;
        private String reportedByName;
        private String reportedByEmail;
        private String assignedToId;
        private String assignedToName;
        private String location;
        private List<String> imageUrls;
        private String resolutionNote;
        private LocalDateTime resolvedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
