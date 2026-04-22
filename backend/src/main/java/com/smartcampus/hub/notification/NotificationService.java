package com.smartcampus.hub.notification;

import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void createNotification(String email, String message, NotificationType type) {
        Notification notification = new Notification();
        notification.setEmail(email);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());

        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(String email) {
        return notificationRepository.findByEmailOrderByCreatedAtDesc(email);
    }

    public void markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public void publish(NotificationType type, String title, String message, String targetUserId, String referenceType,
            String referenceId) {
        createNotification(targetUserId, message, type);
    }
}
