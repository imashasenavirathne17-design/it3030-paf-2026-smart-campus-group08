package com.smartcampus.controller;

import com.smartcampus.model.Notification;
import com.smartcampus.security.UserPrincipal;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(notificationService.getUserNotifications(principal.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(principal.getId())));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markRead(@PathVariable String id,
                                                  @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(notificationService.markAsRead(id, principal.getId()));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        notificationService.deleteNotification(id, principal.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<Void> clearAll(@AuthenticationPrincipal UserPrincipal principal) {
        notificationService.deleteAllNotifications(principal.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> broadcast(@RequestBody Map<String, Object> request) {
        String message = (String) request.get("message");
        Boolean isCritical = (Boolean) request.getOrDefault("isCritical", false);
        if (message != null && !message.trim().isEmpty()) {
            notificationService.createBroadcastNotification(message, isCritical);
        }
        return ResponseEntity.ok().build();
    }
<<<<<<< HEAD
=======

    @PutMapping("/broadcast/{broadcastId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateBroadcast(@PathVariable String broadcastId, @RequestBody Map<String, Object> request) {
        String message = (String) request.get("message");
        if (message != null && !message.trim().isEmpty()) {
            notificationService.updateBroadcastNotification(broadcastId, message);
        }
        return ResponseEntity.ok().build();
    }
>>>>>>> feature/bookings
}
