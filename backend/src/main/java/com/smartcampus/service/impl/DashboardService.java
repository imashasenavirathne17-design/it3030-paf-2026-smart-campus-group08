package com.smartcampus.service.impl;

import com.smartcampus.dto.response.DashboardStatsResponse;
import com.smartcampus.model.*;
import com.smartcampus.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;

    public DashboardStatsResponse getStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();
        stats.setTotalResources(resourceRepository.count());
        stats.setActiveResources(resourceRepository.findByStatus(ResourceStatus.ACTIVE).size());
        stats.setTotalBookings(bookingRepository.count());
        stats.setPendingBookings(bookingRepository.countByStatus(BookingStatus.PENDING));
        stats.setApprovedBookings(bookingRepository.countByStatus(BookingStatus.APPROVED));
        stats.setTotalTickets(ticketRepository.count());
        stats.setOpenTickets(ticketRepository.countByStatus(TicketStatus.OPEN));
        stats.setInProgressTickets(ticketRepository.countByStatus(TicketStatus.IN_PROGRESS));
        stats.setResolvedTickets(ticketRepository.countByStatus(TicketStatus.RESOLVED));
        stats.setBookingsByStatus(Map.of(
            "PENDING", bookingRepository.countByStatus(BookingStatus.PENDING),
            "APPROVED", bookingRepository.countByStatus(BookingStatus.APPROVED),
            "REJECTED", bookingRepository.countByStatus(BookingStatus.REJECTED),
            "CANCELLED", bookingRepository.countByStatus(BookingStatus.CANCELLED)
        ));
        stats.setTicketsByStatus(Map.of(
            "OPEN", ticketRepository.countByStatus(TicketStatus.OPEN),
            "IN_PROGRESS", ticketRepository.countByStatus(TicketStatus.IN_PROGRESS),
            "RESOLVED", ticketRepository.countByStatus(TicketStatus.RESOLVED),
            "CLOSED", ticketRepository.countByStatus(TicketStatus.CLOSED)
        ));
        return stats;
    }
}
