package com.smartcampus.hub.notification;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<Notification> getUnreadNotifications(String email) {
        return notificationRepository.findByEmailAndReadFalseOrderByCreatedAtDesc(email);
    }

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createNotification(String email, String message, NotificationType type) {
        Notification notification = new Notification();
        notification.setEmail(email);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());

        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsByEmail(String email) {
        return notificationRepository.findByEmailOrderByCreatedAtDesc(email);
    }

    public Notification markAsRead(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}