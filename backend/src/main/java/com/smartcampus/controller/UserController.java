package com.smartcampus.controller;

import com.smartcampus.dto.request.UpdateRoleRequest;
import com.smartcampus.model.User;
import com.smartcampus.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<List<User>> getTechnicians() {
        return ResponseEntity.ok(userService.getTechnicians());
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserRole(@PathVariable String id, @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(userService.updateUserRole(id, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User userData) {
        return ResponseEntity.ok(userService.updateUser(id, userData));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/preferences")
    @PreAuthorize("isAuthenticated() and (hasRole('ADMIN') or #id == authentication.principal.id)")
    public ResponseEntity<User> updatePreferences(@PathVariable String id, @RequestBody java.util.Map<String, Boolean> preferences) {
        return ResponseEntity.ok(userService.updatePreferences(id, preferences));
    }
}
