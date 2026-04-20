package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndRead(String userId, boolean read);
    long countByUserIdAndRead(String userId, boolean read);
    void deleteByUserId(String userId);
}
