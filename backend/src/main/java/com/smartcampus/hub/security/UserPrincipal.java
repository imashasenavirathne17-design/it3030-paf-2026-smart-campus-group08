package com.smartcampus.hub.security;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

@Data
@AllArgsConstructor
public class UserPrincipal {
    private String id;
    private String email;
    private List<SimpleGrantedAuthority> authorities;
}
