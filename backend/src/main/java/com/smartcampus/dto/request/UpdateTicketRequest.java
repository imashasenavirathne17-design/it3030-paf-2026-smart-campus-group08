package com.smartcampus.dto.request;

import com.smartcampus.model.TicketCategory;
import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.TicketStatus;
import lombok.Data;

import java.util.List;

@Data
public class UpdateTicketRequest {
    private String title;
    private String description;
    private TicketCategory category;
    private TicketPriority priority;
    private String location;
    private TicketStatus status;
    private String assignedToId;
    private String rejectionReason;
    private String resolutionNotes;
    private List<String> images;
}
