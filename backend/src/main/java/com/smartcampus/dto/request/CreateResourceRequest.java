package com.smartcampus.dto.request;

import com.smartcampus.model.ResourceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateResourceRequest {
    @NotBlank private String name;
    @NotBlank private String type;
    @NotBlank private String location;
    @NotNull  private Integer capacity;
    private String description;
    private String availabilityWindows;
    private ResourceStatus status = ResourceStatus.ACTIVE;
}
