package com.smartcampus.service.impl;

import com.smartcampus.dto.request.AddCommentRequest;
import com.smartcampus.dto.request.CreateTicketRequest;
import com.smartcampus.dto.request.UpdateTicketRequest;
import com.smartcampus.model.*;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.UserPrincipal;
import com.smartcampus.service.NotificationService;
import com.smartcampus.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    public List<Ticket> getAllTickets(UserPrincipal principal) {
        if (principal.getRole().equalsIgnoreCase("ADMIN") || principal.getRole().equalsIgnoreCase("TECHNICIAN")) {
            return ticketRepository.findAll();
        }
        return ticketRepository.findBySubmittedById(principal.getId());
    }

    @Override
    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Ticket not found: " + id));
    }

    @Override
    public Ticket createTicket(CreateTicketRequest req, UserPrincipal principal) {
        List<String> images = req.getImages() != null
            ? req.getImages().stream().limit(3).toList() : List.of();

        LocalDateTime slaDeadline;
        switch (req.getPriority()) {
            case CRITICAL: slaDeadline = LocalDateTime.now().plusHours(2); break;
            case HIGH: slaDeadline = LocalDateTime.now().plusHours(24); break;
            case MEDIUM: slaDeadline = LocalDateTime.now().plusDays(3); break;
            case LOW: default: slaDeadline = LocalDateTime.now().plusDays(7); break;
        }

        Ticket ticket = Ticket.builder()
            .title(req.getTitle()).description(req.getDescription())
            .category(req.getCategory()).priority(req.getPriority())
            .location(req.getLocation()).preferredContactDetails(req.getPreferredContactDetails())
            .images(images)
            .slaDeadline(slaDeadline)
            .submittedById(principal.getId()).submittedByName(principal.getName())
            .build();
        return ticketRepository.save(ticket);
    }

    @Override
    public Ticket updateTicket(String id, UpdateTicketRequest req, UserPrincipal principal) {
        Ticket ticket = getTicketById(id);
        boolean isAdminOrTech = principal.getRole().equals("ADMIN") || principal.getRole().equals("TECHNICIAN");
        boolean isOwner = ticket.getSubmittedById().equals(principal.getId());

        if (!isAdminOrTech && !isOwner) {
            throw new RuntimeException("Access denied: You are not the owner of this ticket");
        }

        // Students can only edit if status is OPEN
        if (!isAdminOrTech && ticket.getStatus() != TicketStatus.OPEN) {
            throw new RuntimeException("Cannot edit ticket: Work has already started or it is resolved");
        }

        // Update fields (Only if provided)
        if (req.getTitle() != null) ticket.setTitle(req.getTitle());
        if (req.getDescription() != null) ticket.setDescription(req.getDescription());
        if (req.getCategory() != null) ticket.setCategory(req.getCategory());
        if (req.getPriority() != null) ticket.setPriority(req.getPriority());
        if (req.getLocation() != null) ticket.setLocation(req.getLocation());
        if (req.getImages() != null) ticket.setImages(req.getImages());

        // Status and Assignment (Admin/Tech only)
        if (isAdminOrTech) {
            if (req.getStatus() != null && req.getStatus() != ticket.getStatus()) {
                TicketStatus oldStatus = ticket.getStatus();
                ticket.setStatus(req.getStatus());
                
                // Notify Submitter
                if (!ticket.getSubmittedById().equals(principal.getId())) {
                    notificationService.createNotification(ticket.getSubmittedById(),
                        NotificationType.TICKET_UPDATED,
                        "Your ticket '" + ticket.getTitle() + "' status changed from " + oldStatus + " to " + req.getStatus(), 
                        id);
                }

                if (req.getStatus() == TicketStatus.RESOLVED) {
                    notificationService.createNotification(ticket.getSubmittedById(),
                        NotificationType.TICKET_RESOLVED,
                        "Your ticket '" + ticket.getTitle() + "' has been resolved", id);
                }
            }

            if (req.getAssignedToId() != null) {
                User tech = userRepository.findById(req.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("Technician not found"));
                ticket.setAssignedToId(tech.getId());
                ticket.setAssignedToName(tech.getName());
                if (ticket.getStatus() == TicketStatus.OPEN) ticket.setStatus(TicketStatus.IN_PROGRESS);
                notificationService.createNotification(req.getAssignedToId(),
                    NotificationType.TICKET_ASSIGNED,
                    "You have been assigned ticket: " + ticket.getTitle(), id);
            }

            if (req.getRejectionReason() != null) ticket.setRejectionReason(req.getRejectionReason());
            if (req.getResolutionNotes() != null) ticket.setResolutionNotes(req.getResolutionNotes());
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    @Override
    public Ticket addComment(String id, AddCommentRequest req, UserPrincipal principal) {
        Ticket ticket = getTicketById(id);
        Comment comment = Comment.builder()
            .userId(principal.getId()).userName(principal.getName())
            .content(req.getContent()).build();
        ticket.getComments().add(comment);
        ticket.setUpdatedAt(LocalDateTime.now());

        // Notify submitter if commenter is not submitter
        if (!ticket.getSubmittedById().equals(principal.getId())) {
            notificationService.createNotification(ticket.getSubmittedById(),
                NotificationType.COMMENT_ADDED,
                principal.getName() + " commented on your ticket: " + ticket.getTitle(), id);
        }
        
        // Notify technician if commenter is not the technician
        if (ticket.getAssignedToId() != null && !ticket.getAssignedToId().equals(principal.getId())) {
            notificationService.createNotification(ticket.getAssignedToId(),
                NotificationType.COMMENT_ADDED,
                principal.getName() + " commented on ticket assigned to you: " + ticket.getTitle(), id);
        }

        return ticketRepository.save(ticket);
    }

    @Override
    public Ticket updateComment(String ticketId, String commentId, AddCommentRequest req, UserPrincipal principal) {
        Ticket ticket = getTicketById(ticketId);
        Comment comment = ticket.getComments().stream()
            .filter(c -> c.getId().equals(commentId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserId().equals(principal.getId())) {
            throw new RuntimeException("Not authorized to edit this comment");
        }

        comment.setContent(req.getContent());
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    @Override
    public void deleteComment(String ticketId, String commentId, UserPrincipal principal) {
        Ticket ticket = getTicketById(ticketId);
        Comment comment = ticket.getComments().stream()
            .filter(c -> c.getId().equals(commentId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Comment not found"));

        boolean isAdmin = principal.getRole().equalsIgnoreCase("ADMIN");
        boolean isOwner = comment.getUserId().equals(principal.getId());

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("Not authorized to delete this comment");
        }

        ticket.getComments().remove(comment);
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
    }

    @Override
    public void deleteTicket(String id, UserPrincipal principal) {
        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        boolean isAdmin = principal.getRole().equals("ADMIN");
        boolean isOwner = ticket.getSubmittedById().equals(principal.getId());

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("Access denied: You cannot delete this ticket");
        }

        ticketRepository.deleteById(id);
    }
}
