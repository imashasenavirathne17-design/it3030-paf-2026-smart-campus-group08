package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.UserDto;
import com.smartcampus.hub.security.UserPrincipal;
import com.smartcampus.hub.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user")
    public ResponseEntity<UserDto.Response> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.getCurrentUser(principal.getId()));
    }

    @PutMapping("/me/preferences")
    @Operation(summary = "Update notification preferences")
    public ResponseEntity<UserDto.Response> updatePreferences(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UserDto.UpdateRequest request) {
        return ResponseEntity.ok(userService.updatePreferences(principal.getId(), request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users (Admin only)")
    public ResponseEntity<List<UserDto.Response>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user roles (Admin only)")
    public ResponseEntity<UserDto.Response> updateRoles(
            @PathVariable String id,
            @RequestBody UserDto.RoleUpdate request) {
        return ResponseEntity.ok(userService.updateRoles(id, request));
    }
}
