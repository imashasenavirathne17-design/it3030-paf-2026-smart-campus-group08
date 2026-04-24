package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.CommentDto;
import com.smartcampus.hub.dto.TicketDto;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.exception.UnauthorizedException;
import com.smartcampus.hub.model.*;
import com.smartcampus.hub.repository.CommentRepository;
import com.smartcampus.hub.repository.TicketRepository;
import com.smartcampus.hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private static final String UPLOAD_DIR = "uploads/tickets/";
    private static final int MAX_IMAGES = 3;

    public TicketDto.Response createTicket(String userId, TicketDto.Request request, List<MultipartFile> images) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        List<String> imageUrls = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            if (images.size() > MAX_IMAGES) {
                throw new IllegalArgumentException("Maximum " + MAX_IMAGES + " images allowed");
            }
            imageUrls = saveImages(images);
        }

        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(Ticket.TicketStatus.OPEN)
                .reportedById(userId)
                .reportedByName(user.getName())
                .reportedByEmail(user.getEmail())
                .location(request.getLocation())
                .imageUrls(imageUrls)
                .build();

        return toResponse(ticketRepository.save(ticket));
    }

    public List<TicketDto.Response> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<TicketDto.Response> getUserTickets(String userId) {
        return ticketRepository.findByReportedById(userId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public TicketDto.Response getById(String id) {
        return toResponse(ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id)));
    }

    public TicketDto.Response updateStatus(String id, TicketDto.StatusUpdate request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));

        ticket.setStatus(request.getStatus());
        if (request.getResolutionNote() != null) {
            ticket.setResolutionNote(request.getResolutionNote());
        }
        if (request.getStatus() == Ticket.TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        Notification.NotificationType type = Notification.NotificationType.TICKET_UPDATED;
        String message = "Your ticket '" + ticket.getTitle() + "' status changed to " + request.getStatus();
        if (request.getStatus() == Ticket.TicketStatus.RESOLVED) {
            type = Notification.NotificationType.TICKET_RESOLVED;
            message = "Your ticket '" + ticket.getTitle() + "' has been resolved!";
        }

        notificationService.createNotification(ticket.getReportedById(), "Ticket Update", message, type, id, "TICKET");
        return toResponse(ticketRepository.save(ticket));
    }

    public TicketDto.Response assignTechnician(String id, TicketDto.AssignRequest request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));
        User technician = userRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getTechnicianId()));

        ticket.setAssignedToId(technician.getId());
        ticket.setAssignedToName(technician.getName());
        ticket.setStatus(Ticket.TicketStatus.IN_PROGRESS);

        notificationService.createNotification(ticket.getReportedById(), "Ticket Assigned",
                "Your ticket '" + ticket.getTitle() + "' has been assigned to " + technician.getName(),
                Notification.NotificationType.TICKET_ASSIGNED, id, "TICKET");

        return toResponse(ticketRepository.save(ticket));
    }

    public void deleteTicket(String id, String userId, Set<User.Role> roles) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));
        if (!ticket.getReportedById().equals(userId) && !roles.contains(User.Role.ADMIN)) {
            throw new UnauthorizedException("You cannot delete this ticket");
        }
        commentRepository.deleteByTicketId(id);
        ticketRepository.deleteById(id);
    }

    public CommentDto.Response addComment(String ticketId, String authorId, CommentDto.Request request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", authorId));

        Comment comment = Comment.builder()
                .ticketId(ticketId)
                .authorId(authorId)
                .authorName(author.getName())
                .authorEmail(author.getEmail())
                .content(request.getContent())
                .internal(request.isInternal())
                .build();
        Comment saved = commentRepository.save(comment);

        // notify ticket owner
        if (!ticket.getReportedById().equals(authorId)) {
            notificationService.createNotification(ticket.getReportedById(), "New Comment",
                    author.getName() + " commented on your ticket: '" + ticket.getTitle() + "'",
                    Notification.NotificationType.COMMENT_ADDED, ticketId, "TICKET");
        }
        return toCommentResponse(saved);
    }

    public List<CommentDto.Response> getComments(String ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(this::toCommentResponse).collect(Collectors.toList());
    }

    public void deleteComment(String commentId, String userId, Set<User.Role> roles) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));
        if (!comment.getAuthorId().equals(userId) && !roles.contains(User.Role.ADMIN)) {
            throw new UnauthorizedException("You cannot delete this comment");
        }
        commentRepository.deleteById(commentId);
    }

    private List<String> saveImages(List<MultipartFile> files) {
        List<String> urls = new ArrayList<>();
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            Files.createDirectories(uploadPath);
            for (MultipartFile file : files) {
                String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(filename);
                Files.write(filePath, file.getBytes());
                urls.add("/uploads/tickets/" + filename);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to save images", e);
        }
        return urls;
    }

    public TicketDto.Response toResponse(Ticket t) {
        return TicketDto.Response.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .category(t.getCategory())
                .priority(t.getPriority())
                .status(t.getStatus())
                .reportedById(t.getReportedById())
                .reportedByName(t.getReportedByName())
                .reportedByEmail(t.getReportedByEmail())
                .assignedToId(t.getAssignedToId())
                .assignedToName(t.getAssignedToName())
                .location(t.getLocation())
                .imageUrls(t.getImageUrls())
                .resolutionNote(t.getResolutionNote())
                .resolvedAt(t.getResolvedAt())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    private CommentDto.Response toCommentResponse(Comment c) {
        return CommentDto.Response.builder()
                .id(c.getId())
                .ticketId(c.getTicketId())
                .authorId(c.getAuthorId())
                .authorName(c.getAuthorName())
                .authorEmail(c.getAuthorEmail())
                .content(c.getContent())
                .internal(c.isInternal())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
