package com.smartcampus.controller;

import com.smartcampus.dto.request.AddCommentRequest;
import com.smartcampus.dto.request.CreateTicketRequest;
import com.smartcampus.dto.request.UpdateTicketRequest;
import com.smartcampus.model.Ticket;
import com.smartcampus.security.UserPrincipal;
import com.smartcampus.service.TicketService;
import com.smartcampus.model.TicketStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<List<Ticket>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ticketService.getAllTickets(principal));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PostMapping
    public ResponseEntity<Ticket> create(@Valid @RequestBody CreateTicketRequest request,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(request, principal));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Ticket> update(@PathVariable String id,
                                         @RequestBody UpdateTicketRequest request,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request, principal));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Ticket> addComment(@PathVariable String id,
                                             @Valid @RequestBody AddCommentRequest request,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ticketService.addComment(id, request, principal));
    }

    @PutMapping("/{id}/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Ticket> updateComment(@PathVariable String id,
                                                @PathVariable String commentId,
                                                @Valid @RequestBody AddCommentRequest request,
                                                @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ticketService.updateComment(id, commentId, request, principal));
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteComment(@PathVariable String id,
                                              @PathVariable String commentId,
                                              @AuthenticationPrincipal UserPrincipal principal) {
        ticketService.deleteComment(id, commentId, principal);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(@PathVariable String id,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        ticketService.deleteTicket(id, principal);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/feedback")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Ticket> submitFeedback(@PathVariable String id,
                                                 @RequestBody Map<String, Object> payload) {
        Integer rating = (Integer) payload.get("rating");
        String feedback = (String) payload.get("feedback");
        return ResponseEntity.ok(ticketService.submitFeedback(id, rating, feedback));
    }

    @DeleteMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> bulkDelete(@RequestBody List<String> ids) {
        ticketService.bulkDelete(ids);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/bulk/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> bulkUpdateStatus(@RequestBody Map<String, Object> payload) {
        List<String> ids = (List<String>) payload.get("ids");
        TicketStatus status = TicketStatus.valueOf((String) payload.get("status"));
        ticketService.bulkUpdateStatus(ids, status);
        return ResponseEntity.noContent().build();
    }
}
