package com.smartcampus.hub.controller;

import com.smartcampus.hub.security.JwtService;
import com.smartcampus.hub.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "OAuth2 authentication endpoints")
public class AuthController {

    private final JwtService jwtService;

    @GetMapping("/login")
    @Operation(summary = "Initiate Google OAuth2 login")
    public ResponseEntity<Map<String, String>> login() {
        return ResponseEntity.ok(Map.of(
                "loginUrl", "/oauth2/authorization/google",
                "message", "Redirect to Google OAuth2 for authentication"
        ));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user token info")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal OAuth2User user) {
        if (user == null) {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }
        return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "email", user.getAttribute("email"),
                "name", user.getAttribute("name"),
                "picture", user.getAttribute("picture")
        ));
    }
}
