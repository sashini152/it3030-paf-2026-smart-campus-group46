package com.smartcampus.hub.notification;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/notifications")
public class AdminNotificationController {

	private final NotificationService notificationService;

	public AdminNotificationController(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@GetMapping
	public List<Notification> list(
			@RequestParam(required = false) NotificationType type,
			@RequestParam(required = false) Boolean onlyUnread,
			@RequestParam(required = false) String targetUserId) {
		return notificationService.list(type, onlyUnread, targetUserId);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Notification create(@Valid @RequestBody CreateAdminNotificationRequest body) {
		return notificationService.create(body);
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

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable String id) {
		notificationService.delete(id);
	}
}

