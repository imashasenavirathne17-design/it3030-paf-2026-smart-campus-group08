package com.smartcampus.dto.response;

import lombok.Data;
import java.util.Map;

@Data
public class DashboardStatsResponse {
    private long totalResources;
    private long activeResources;
    private long totalBookings;
    private long pendingBookings;
    private long approvedBookings;
    private long totalTickets;
    private long openTickets;
    private long inProgressTickets;
    private long resolvedTickets;
    private Map<String, Long> bookingsByStatus;
    private Map<String, Long> ticketsByStatus;
    private Map<String, Long> ticketsByPriority;
}
