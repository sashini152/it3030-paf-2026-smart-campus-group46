package com.smartcampus.hub.notification;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;

import com.smartcampus.hub.common.NotFoundException;

@Service
public class NotificationService {

	private final NotificationRepository notificationRepository;

	public NotificationService(NotificationRepository notificationRepository) {
		this.notificationRepository = notificationRepository;
	}

	public List<Notification> list(NotificationType type, Boolean onlyUnread, String targetUserId) {
		Stream<Notification> stream = notificationRepository.findAll().stream();
		if (type != null) {
			stream = stream.filter(item -> item.getType() == type);
		}
		if (Boolean.TRUE.equals(onlyUnread)) {
			stream = stream.filter(item -> !item.isRead());
		}
		if (targetUserId != null && !targetUserId.isBlank()) {
			String key = targetUserId.trim();
			stream = stream.filter(item -> key.equals(item.getTargetUserId()));
		}
		List<Notification> items = stream
				.sorted(Comparator.comparing(Notification::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
						.reversed())
				.toList();
		return new ArrayList<>(items);
	}

	public Notification create(CreateAdminNotificationRequest request) {
		return createInternal(
				request.getTitle(),
				request.getMessage(),
				request.getType(),
				request.getTargetUserId(),
				request.getReferenceType(),
				request.getReferenceId());
	}

	public Notification publish(
			NotificationType type,
			String title,
			String message,
			String targetUserId,
			String referenceType,
			String referenceId) {
		return createInternal(title, message, type, targetUserId, referenceType, referenceId);
	}

	public Notification setReadState(String id, boolean read) {
		Notification item = getById(id);
		item.setRead(read);
		item.setUpdatedAt(Instant.now());
		return notificationRepository.save(item);
	}

	public int markAllRead(String targetUserId) {
		List<Notification> items = notificationRepository.findAll();
		Instant now = Instant.now();
		int count = 0;
		for (Notification item : items) {
			boolean targetMatches = targetUserId == null || targetUserId.isBlank()
					|| targetUserId.trim().equals(item.getTargetUserId());
			if (targetMatches && !item.isRead()) {
				item.setRead(true);
				item.setUpdatedAt(now);
				count += 1;
			}
		}
		if (count > 0) {
			notificationRepository.saveAll(items);
		}
		return count;
	}

	public void delete(String id) {
		if (!notificationRepository.existsById(id)) {
			throw new NotFoundException("Notification not found");
		}
		notificationRepository.deleteById(id);
	}

	private Notification createInternal(
			String title,
			String message,
			NotificationType type,
			String targetUserId,
			String referenceType,
			String referenceId) {
		Notification item = new Notification();
		Instant now = Instant.now();
		item.setTitle(clean(title));
		item.setMessage(clean(message));
		item.setType(type);
		item.setTargetUserId(cleanOptional(targetUserId));
		item.setReferenceType(cleanOptional(referenceType));
		item.setReferenceId(cleanOptional(referenceId));
		item.setRead(false);
		item.setCreatedAt(now);
		item.setUpdatedAt(now);
		return notificationRepository.save(item);
	}

	private Notification getById(String id) {
		return notificationRepository.findById(id).orElseThrow(() -> new NotFoundException("Notification not found"));
	}

	private static String clean(String value) {
		if (value == null || value.isBlank()) {
			throw new IllegalArgumentException("Notification title and message are required");
		}
		return value.trim();
	}

	private static String cleanOptional(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		return value.trim();
	}
}

