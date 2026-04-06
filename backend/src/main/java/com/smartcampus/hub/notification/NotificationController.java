package com.smartcampus.hub.notification;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public Notification createNotification(@RequestBody Notification notification) {
        return notificationService.createNotification(
                notification.getEmail(),
                notification.getMessage(),
                notification.getType());
    }

    @GetMapping
    public List<Notification> getNotifications(@RequestParam String email) {
        return notificationService.getNotificationsByEmail(email);
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable String id) {
        return notificationService.markAsRead(id);
    }

    @GetMapping("/unread")
    public List<Notification> getUnread(@RequestParam String email) {
        return notificationService.getUnreadNotifications(email);
    }
}