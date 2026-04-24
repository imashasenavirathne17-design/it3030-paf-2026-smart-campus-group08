package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateBookingRequest {
    @NotBlank  private String resourceId;
    @NotNull   private LocalDateTime startTime;
    @NotNull   private LocalDateTime endTime;
    @NotBlank  private String purpose;
    private Integer expectedAttendees;
    private Integer quantity;
    private String notes;
}
