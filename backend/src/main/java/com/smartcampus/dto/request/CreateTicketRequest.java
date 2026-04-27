package com.smartcampus.dto.request;

import com.smartcampus.model.TicketCategory;
import com.smartcampus.model.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CreateTicketRequest {
    @NotBlank  private String title;
    @NotBlank  private String description;
    @NotNull   private TicketCategory category;
    @NotNull   private TicketPriority priority;
    private String location;
    private String preferredContactDetails;
    private List<String> images; // base64
}
