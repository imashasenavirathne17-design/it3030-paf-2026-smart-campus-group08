package com.smartcampus.hub.service;

import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.Ticket;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.TicketRepository;
import com.smartcampus.hub.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public AnalyticsResponse getDashboardAnalytics() {
        Map<String, Long> bookingStats = new HashMap<>();
        for (Booking.BookingStatus status : Booking.BookingStatus.values()) {
            bookingStats.put(status.name(), bookingRepository.countByStatus(status));
        }

        Map<String, Long> ticketStats = new HashMap<>();
        for (Ticket.TicketStatus status : Ticket.TicketStatus.values()) {
            ticketStats.put(status.name(), ticketRepository.countByStatus(status));
        }

        return AnalyticsResponse.builder()
                .totalUsers(userRepository.count())
                .totalResources(resourceRepository.count())
                .totalBookings(bookingRepository.count())
                .totalTickets(ticketRepository.count())
                .bookingsByStatus(bookingStats)
                .ticketsByStatus(ticketStats)
                .availableResources(resourceRepository.findByAvailableTrue().size())
                .build();
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AnalyticsResponse {
        private long totalUsers;
        private long totalResources;
        private long totalBookings;
        private long totalTickets;
        private long availableResources;
        private Map<String, Long> bookingsByStatus;
        private Map<String, Long> ticketsByStatus;
    }
}
