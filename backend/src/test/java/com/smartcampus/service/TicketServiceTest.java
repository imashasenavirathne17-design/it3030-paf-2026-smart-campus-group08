package com.smartcampus.service;

import com.smartcampus.dto.request.CreateTicketRequest;
import com.smartcampus.dto.request.UpdateTicketRequest;
import com.smartcampus.model.*;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.UserPrincipal;
import com.smartcampus.service.impl.TicketServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TicketServiceImpl ticketService;

    private UserPrincipal studentPrincipal;
    private UserPrincipal adminPrincipal;
    private Ticket ticket;

    @BeforeEach
    void setUp() {
        studentPrincipal = UserPrincipal.builder()
            .id("student-1").name("Student").role("STUDENT").build();
        
        adminPrincipal = UserPrincipal.builder()
            .id("admin-1").name("Admin").role("ADMIN").build();

        ticket = Ticket.builder()
            .id("ticket-1")
            .title("Broken Chair")
            .status(TicketStatus.OPEN)
            .submittedById("student-1")
            .build();
    }

    @Test
    void createTicket_Success() {
        CreateTicketRequest req = new CreateTicketRequest();
        req.setTitle("AC Leak");
        req.setCategory(TicketCategory.HVAC);
        req.setPriority(TicketPriority.HIGH);

        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));

        Ticket result = ticketService.createTicket(req, studentPrincipal);

        assertNotNull(result);
        assertEquals("AC Leak", result.getTitle());
        assertEquals("student-1", result.getSubmittedById());
    }

    @Test
    void updateTicket_StatusChange_NotifySubmitter() {
        UpdateTicketRequest req = new UpdateTicketRequest();
        req.setStatus(TicketStatus.IN_PROGRESS);

        when(ticketRepository.findById("ticket-1")).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(ticket);

        Ticket result = ticketService.updateTicket("ticket-1", req, adminPrincipal);

        assertEquals(TicketStatus.IN_PROGRESS, result.getStatus());
        verify(notificationService).createNotification(eq("student-1"), eq(NotificationType.TICKET_UPDATED), anyString(), eq("ticket-1"));
    }

    @Test
    void assignTicket_Success() {
        UpdateTicketRequest req = new UpdateTicketRequest();
        req.setAssignedToId("tech-1");

        User tech = User.builder().id("tech-1").name("Technician").build();

        when(ticketRepository.findById("ticket-1")).thenReturn(Optional.of(ticket));
        when(userRepository.findById("tech-1")).thenReturn(Optional.of(tech));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(ticket);

        ticketService.updateTicket("ticket-1", req, adminPrincipal);

        assertEquals("tech-1", ticket.getAssignedToId());
        assertEquals(TicketStatus.IN_PROGRESS, ticket.getStatus());
        verify(notificationService).createNotification(eq("tech-1"), eq(NotificationType.TICKET_ASSIGNED), anyString(), eq("ticket-1"));
    }
}
