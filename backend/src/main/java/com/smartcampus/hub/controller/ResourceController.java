package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.ResourceDto;
import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@Tag(name = "Resources", description = "Facilities and asset management")
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    @Operation(summary = "Get all resources")
    public ResponseEntity<List<ResourceDto.Response>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Resource.ResourceType type,
            @RequestParam(required = false) Resource.ResourceStatus status,
            @RequestParam(required = false) Boolean available) {

        if (search != null && !search.isEmpty()) return ResponseEntity.ok(resourceService.search(search));
        if (type != null && status != null) return ResponseEntity.ok(resourceService.filterByType(type));
        if (type != null) return ResponseEntity.ok(resourceService.filterByType(type));
        if (status != null) return ResponseEntity.ok(resourceService.filterByStatus(status));
        if (Boolean.TRUE.equals(available)) return ResponseEntity.ok(resourceService.getAvailable());
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resource by ID")
    public ResponseEntity<ResourceDto.Response> getById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create resource (Admin only)")
    public ResponseEntity<ResourceDto.Response> create(@Valid @RequestBody ResourceDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update resource (Admin only)")
    public ResponseEntity<ResourceDto.Response> update(
            @PathVariable String id,
            @Valid @RequestBody ResourceDto.Request request) {
        return ResponseEntity.ok(resourceService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update resource status (Admin only)")
    public ResponseEntity<ResourceDto.Response> updateStatus(
            @PathVariable String id,
            @RequestParam Resource.ResourceStatus status) {
        return ResponseEntity.ok(resourceService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete resource (Admin only)")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
