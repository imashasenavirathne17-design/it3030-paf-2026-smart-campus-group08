package com.smartcampus.service;

import com.smartcampus.dto.request.AddCommentRequest;
import com.smartcampus.dto.request.CreateTicketRequest;
import com.smartcampus.dto.request.UpdateTicketRequest;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.security.UserPrincipal;
import java.util.List;

public interface TicketService {
    List<Ticket> getAllTickets(UserPrincipal principal);
    Ticket getTicketById(String id);
    Ticket createTicket(CreateTicketRequest request, UserPrincipal principal);
    Ticket updateTicket(String id, UpdateTicketRequest request, UserPrincipal principal);
    Ticket addComment(String id, AddCommentRequest request, UserPrincipal principal);
    Ticket updateComment(String ticketId, String commentId, AddCommentRequest request, UserPrincipal principal);
    void deleteComment(String ticketId, String commentId, UserPrincipal principal);
    void deleteTicket(String id, UserPrincipal principal);
    Ticket submitFeedback(String ticketId, Integer rating, String feedback);
    void bulkDelete(List<String> ticketIds);
    void bulkUpdateStatus(List<String> ticketIds, TicketStatus status);
}
