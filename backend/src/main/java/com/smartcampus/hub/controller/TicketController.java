package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.CommentDto;
import com.smartcampus.hub.dto.TicketDto;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.security.UserPrincipal;
import com.smartcampus.hub.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets", description = "Incident and ticket management")
public class TicketController {

    private final TicketService ticketService;
    private final UserRepository userRepository;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new ticket (with optional images)")
    public ResponseEntity<TicketDto.Response> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestPart("ticket") @Valid TicketDto.Request request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(principal.getId(), request, images));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    @Operation(summary = "Get all tickets (Admin/Technician)")
    public ResponseEntity<List<TicketDto.Response>> getAll() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's tickets")
    public ResponseEntity<List<TicketDto.Response>> getMyTickets(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ticketService.getUserTickets(principal.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ticket by ID")
    public ResponseEntity<TicketDto.Response> getById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    @Operation(summary = "Update ticket status")
    public ResponseEntity<TicketDto.Response> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody TicketDto.StatusUpdate request) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign ticket to technician (Admin only)")
    public ResponseEntity<TicketDto.Response> assign(
            @PathVariable String id,
            @Valid @RequestBody TicketDto.AssignRequest request) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete ticket")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId()).orElseThrow();
        ticketService.deleteTicket(id, principal.getId(), user.getRoles());
        return ResponseEntity.noContent().build();
    }

    // ---- Comments ----

    @PostMapping("/{id}/comments")
    @Operation(summary = "Add a comment to a ticket")
    public ResponseEntity<CommentDto.Response> addComment(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CommentDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.addComment(id, principal.getId(), request));
    }

    @GetMapping("/{id}/comments")
    @Operation(summary = "Get all comments on a ticket")
    public ResponseEntity<List<CommentDto.Response>> getComments(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getComments(id));
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(summary = "Delete a comment")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String commentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId()).orElseThrow();
        ticketService.deleteComment(commentId, principal.getId(), user.getRoles());
        return ResponseEntity.noContent().build();
    }
}
