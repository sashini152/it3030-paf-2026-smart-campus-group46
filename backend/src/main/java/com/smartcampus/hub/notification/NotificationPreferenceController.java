package com.smartcampus.hub.notification;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/notification-preferences")
public class NotificationPreferenceController {

	private final NotificationPreferenceService preferenceService;

	public NotificationPreferenceController(NotificationPreferenceService preferenceService) {
		this.preferenceService = preferenceService;
	}

	@GetMapping("/{userId}")
	public NotificationPreference get(@PathVariable String userId) {
		return preferenceService.get(userId);
	}

	@PutMapping("/{userId}")
	public NotificationPreference update(@PathVariable String userId, @Valid @RequestBody NotificationPreferenceRequest body) {
		return preferenceService.update(userId, body);
	}
}
