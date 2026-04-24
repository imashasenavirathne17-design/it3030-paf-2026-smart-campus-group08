package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findBySubmittedById(String userId);
    List<Ticket> findByAssignedToId(String technicianId);
    List<Ticket> findByStatus(TicketStatus status);
    long countByStatus(TicketStatus status);
    
    @org.springframework.data.mongodb.repository.Query(
        "{ 'slaDeadline': { $lt: ?0 }, 'status': { $in: ['OPEN', 'IN_PROGRESS'] }, 'slaBreachNotified': { $ne: true } }"
    )
    List<Ticket> findBreachedTicketsNotNotified(java.time.LocalDateTime now);
}
