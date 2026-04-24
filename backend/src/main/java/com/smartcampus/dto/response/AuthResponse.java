package com.smartcampus.dto.response;

import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private String id;
    private String name;
    private String email;
    private String picture;
    private String role;
    private boolean isNewUser;

    public AuthResponse(String token, String id, String name, String email,
                        String picture, String role, boolean isNewUser) {
        this.token = token; this.id = id; this.name = name;
        this.email = email; this.picture = picture; this.role = role;
        this.isNewUser = isNewUser;
    }
}
