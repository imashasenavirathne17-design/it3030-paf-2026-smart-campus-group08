package com.smartcampus.service.impl;

import com.smartcampus.model.Notification;
import com.smartcampus.model.NotificationType;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

import com.smartcampus.repository.UserRepository;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    @Override
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndRead(userId, false);
    }

    @Override
    public Notification markAsRead(String notificationId, String userId) {
        Notification n = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getUserId().equals(userId)) throw new RuntimeException("Not authorized");
        n.setRead(true);
        return notificationRepository.save(n);
    }

    @Override
    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndRead(userId, false);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    public void createNotification(String userId, NotificationType type, String message, String referenceId) {
        com.smartcampus.model.User user = userRepository.findById(userId).orElse(null);
        if (user != null && user.getNotificationPreferences() != null) {
            String category = type.name().split("_")[0]; // e.g., BOOKING, TICKET, COMMENT
            if (Boolean.FALSE.equals(user.getNotificationPreferences().getOrDefault(category, true))) {
                return; // User opted out of this category of notifications
            }
        }

        Notification n = Notification.builder()
            .userId(userId).type(type).message(message).referenceId(referenceId).build();
        n = notificationRepository.save(n);
        
        // Push real-time notification
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", n);
    }

    @Override
    public void deleteNotification(String notificationId, String userId) {
        Notification n = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getUserId().equals(userId)) throw new RuntimeException("Not authorized");
        notificationRepository.delete(n);
    }

    @Override
    public void deleteAllNotifications(String userId) {
        notificationRepository.deleteByUserId(userId);
    }

    @Override
    public void createBroadcastNotification(String message, boolean isCritical) {
        List<com.smartcampus.model.User> allUsers = userRepository.findAll();
        NotificationType type = isCritical ? NotificationType.CRITICAL_ANNOUNCEMENT : NotificationType.SYSTEM_ALERT;
        String broadcastId = UUID.randomUUID().toString();
        for (com.smartcampus.model.User user : allUsers) {
            Notification n = Notification.builder()
                .userId(user.getId())
                .type(type)
                .message(message)
                .broadcastId(broadcastId)
                .build();
            n = notificationRepository.save(n);
            
            // Push real-time notification
            messagingTemplate.convertAndSendToUser(user.getId(), "/queue/notifications", n);
        }
    }

    @Override
    public void updateBroadcastNotification(String broadcastId, String newMessage) {
        List<Notification> notifications = notificationRepository.findByBroadcastId(broadcastId);
        if (notifications.isEmpty()) {
            // Fallback: Try to find a single notification by ID (for legacy broadcasts)
            notificationRepository.findById(broadcastId).ifPresent(n -> {
                n.setMessage(newMessage);
                notificationRepository.save(n);
                messagingTemplate.convertAndSendToUser(n.getUserId(), "/queue/notifications", n);
            });
            return;
        }
        for (Notification n : notifications) {
            n.setMessage(newMessage);
            notificationRepository.save(n);
            // Optionally push update via websocket too
            messagingTemplate.convertAndSendToUser(n.getUserId(), "/queue/notifications", n);
        }
    }
}
