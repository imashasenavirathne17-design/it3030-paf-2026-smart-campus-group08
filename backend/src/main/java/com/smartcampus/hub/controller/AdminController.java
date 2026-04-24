package com.smartcampus.hub.controller;

import com.smartcampus.hub.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Analytics", description = "Admin dashboard analytics")
public class AdminController {

    private final AnalyticsService analyticsService;

    @GetMapping("/analytics")
    @Operation(summary = "Get dashboard analytics (Admin only)")
    public ResponseEntity<AnalyticsService.AnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getDashboardAnalytics());
    }
}
