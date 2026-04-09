package com.smartcampus.hub.notification;

<<<<<<< HEAD
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

	private final NotificationService notificationService;

	public NotificationController(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@GetMapping
	public List<Notification> list(
			@RequestParam(required = false) NotificationType type,
			@RequestParam(required = false) Boolean onlyUnread,
			@RequestParam(required = false) String targetUserId) {
		return notificationService.list(type, onlyUnread, targetUserId);
	}

	@PatchMapping("/{id}/read")
	public Notification setReadState(@PathVariable String id, @RequestBody(required = false) NotificationReadRequest body) {
		boolean nextState = body == null || body.isRead();
		return notificationService.setReadState(id, nextState);
	}

	@PatchMapping("/read-all")
	public Map<String, Object> markAllRead(@RequestParam(required = false) String targetUserId) {
		int updated = notificationService.markAllRead(targetUserId);
		return Map.of("updated", updated);
	}
}
=======
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
>>>>>>> 4b40911d003429830a1ef19786124d62873a6777
