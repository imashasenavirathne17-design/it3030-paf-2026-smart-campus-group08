package com.smartcampus.dto.request;

import com.smartcampus.model.Role;
import lombok.Data;

@Data
public class UpdateRoleRequest {
    private Role role;
}
