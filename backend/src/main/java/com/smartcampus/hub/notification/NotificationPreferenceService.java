package com.smartcampus.hub.notification;

import java.time.Instant;

import org.springframework.stereotype.Service;

@Service
public class NotificationPreferenceService {

	private final NotificationPreferenceRepository repository;

	public NotificationPreferenceService(NotificationPreferenceRepository repository) {
		this.repository = repository;
	}

	public NotificationPreference get(String userId) {
		validateUserId(userId);
		return repository.findById(userId.trim()).orElseGet(() -> createDefault(userId.trim()));
	}

	public NotificationPreference update(String userId, NotificationPreferenceRequest request) {
		NotificationPreference preference = get(userId);
		preference.setBookingEnabled(request.isBookingEnabled());
		preference.setTicketEnabled(request.isTicketEnabled());
		preference.setCommentEnabled(request.isCommentEnabled());
		preference.setSystemEnabled(request.isSystemEnabled());
		preference.setUpdatedAt(Instant.now());
		return repository.save(preference);
	}

	public boolean isEnabled(String userId, NotificationType type) {
		if (userId == null || userId.isBlank() || type == null) {
			return true;
		}
		NotificationPreference preference = get(userId);
		return switch (type) {
			case BOOKING, BOOKING_CREATED, BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_CANCELLED, BOOKING_CHECKED_IN ->
				preference.isBookingEnabled();
			case TICKET -> preference.isTicketEnabled();
			case COMMENT -> preference.isCommentEnabled();
			case SYSTEM -> preference.isSystemEnabled();
		};
	}

	private NotificationPreference createDefault(String userId) {
		NotificationPreference preference = new NotificationPreference();
		Instant now = Instant.now();
		preference.setUserId(userId);
		preference.setCreatedAt(now);
		preference.setUpdatedAt(now);
		return repository.save(preference);
	}

	private static void validateUserId(String userId) {
		if (userId == null || userId.isBlank()) {
			throw new IllegalArgumentException("User id is required");
		}
	}
}
