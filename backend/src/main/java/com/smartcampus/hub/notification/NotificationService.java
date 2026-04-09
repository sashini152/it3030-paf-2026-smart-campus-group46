package com.smartcampus.hub.notification;

<<<<<<< HEAD
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;

import com.smartcampus.hub.common.NotFoundException;
=======
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
>>>>>>> 4b40911d003429830a1ef19786124d62873a6777

@Service
public class NotificationService {

<<<<<<< HEAD
	private final NotificationRepository notificationRepository;
	private final NotificationPreferenceService preferenceService;

	public NotificationService(
			NotificationRepository notificationRepository,
			NotificationPreferenceService preferenceService) {
		this.notificationRepository = notificationRepository;
		this.preferenceService = preferenceService;
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
			stream = stream.filter(item -> item.getTargetUserId() == null || key.equals(item.getTargetUserId()));
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
		String cleanTarget = cleanOptional(targetUserId);
		if (cleanTarget != null && !preferenceService.isEnabled(cleanTarget, type)) {
			return null;
		}
		Notification item = new Notification();
		Instant now = Instant.now();
		item.setTitle(clean(title));
		item.setMessage(clean(message));
		item.setType(type);
		item.setTargetUserId(cleanTarget);
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
=======
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
>>>>>>> 4b40911d003429830a1ef19786124d62873a6777
