package com.smartcampus.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class GoogleAuthRequest {
    @NotBlank private String token;
}
