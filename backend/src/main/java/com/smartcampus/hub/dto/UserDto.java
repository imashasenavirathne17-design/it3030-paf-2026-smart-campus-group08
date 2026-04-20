package com.smartcampus.hub.dto;

import com.smartcampus.hub.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

public class UserDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private String id;
        private String email;
        private String name;
        private String picture;
        private Set<User.Role> roles;
        private boolean active;
        private boolean notificationsEnabled;
        private boolean emailNotifications;
        private LocalDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UpdateRequest {
        private boolean notificationsEnabled;
        private boolean emailNotifications;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RoleUpdate {
        private Set<User.Role> roles;
    }
}
