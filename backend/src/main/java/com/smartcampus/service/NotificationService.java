package com.smartcampus.service;

import com.smartcampus.model.Notification;
import com.smartcampus.model.NotificationType;
import java.util.List;

public interface NotificationService {
    List<Notification> getUserNotifications(String userId);
    long getUnreadCount(String userId);
    Notification markAsRead(String notificationId, String userId);
    void markAllAsRead(String userId);
    void createNotification(String userId, NotificationType type, String message, String referenceId);
    void deleteNotification(String notificationId, String userId);
    void deleteAllNotifications(String userId);
    void createBroadcastNotification(String message, boolean isCritical);
    void updateBroadcastNotification(String broadcastId, String newMessage);
}
