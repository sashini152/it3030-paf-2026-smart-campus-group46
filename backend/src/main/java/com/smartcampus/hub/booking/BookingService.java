package com.smartcampus.hub.booking;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;

import com.smartcampus.hub.common.ConflictException;
import com.smartcampus.hub.common.NotFoundException;
import com.smartcampus.hub.notification.NotificationService;
import com.smartcampus.hub.notification.NotificationType;
import com.smartcampus.hub.resource.ResourceService;
import com.smartcampus.hub.resource.ResourceStatus;

@Service
public class BookingService {

	private final BookingRepository bookingRepository;
	private final ResourceService resourceService;
	private final NotificationService notificationService;

	public BookingService(
			BookingRepository bookingRepository,
			ResourceService resourceService,
			NotificationService notificationService) {
		this.bookingRepository = bookingRepository;
		this.resourceService = resourceService;
		this.notificationService = notificationService;
	}

	public Booking create(CreateBookingRequest req) {
		validateRange(req.getStartDateTime(), req.getEndDateTime());
		var resource = resourceService.getById(req.getResourceId());
		if (resource.getStatus() != ResourceStatus.ACTIVE) {
			throw new IllegalStateException("Resource is not available for booking");
		}
		List<Booking> clashes = bookingRepository.findOverlappingPendingOrApproved(
				req.getResourceId(), req.getStartDateTime(), req.getEndDateTime());
		if (!clashes.isEmpty()) {
			throw new ConflictException("Time range overlaps an existing pending or approved booking");
		}
		Instant now = Instant.now();
		Booking b = new Booking();
		b.setResourceId(req.getResourceId().trim());
		b.setRequestedByUserId(req.getRequestedByUserId().trim());
		b.setStartDateTime(req.getStartDateTime());
		b.setEndDateTime(req.getEndDateTime());
		b.setPurpose(req.getPurpose().trim());
		b.setExpectedAttendees(req.getExpectedAttendees());
		b.setStatus(BookingStatus.PENDING);
		b.setAdminReason(null);
		b.setCreatedAt(now);
		b.setUpdatedAt(now);
		Booking saved = bookingRepository.save(b);
		notificationService.publish(
				NotificationType.BOOKING,
				"Booking request submitted",
				"Your booking request is pending admin review.",
				saved.getRequestedByUserId(),
				"BOOKING",
				saved.getId());
		return saved;
	}

	public List<Booking> list(BookingStatus status, String userId, String resourceId) {
		Stream<Booking> stream = bookingRepository.findAll().stream();
		if (status != null) {
			stream = stream.filter(b -> b.getStatus() == status);
		}
		if (userId != null && !userId.isBlank()) {
			String u = userId.trim();
			stream = stream.filter(b -> u.equals(b.getRequestedByUserId()));
		}
		if (resourceId != null && !resourceId.isBlank()) {
			String r = resourceId.trim();
			stream = stream.filter(b -> r.equals(b.getResourceId()));
		}
		List<Booking> list = stream.sorted(Comparator.comparing(Booking::getStartDateTime).reversed()).toList();
		return new ArrayList<>(list);
	}

	public Booking getById(String id) {
		return bookingRepository.findById(id).orElseThrow(() -> new NotFoundException("Booking not found"));
	}

	public Booking approve(String id) {
		Booking b = getById(id);
		if (b.getStatus() != BookingStatus.PENDING) {
			throw new IllegalStateException("Only PENDING bookings can be approved");
		}
		List<Booking> clashes = bookingRepository.findOverlappingApprovedExcluding(
				b.getResourceId(), b.getStartDateTime(), b.getEndDateTime(), b.getId());
		if (!clashes.isEmpty()) {
			throw new ConflictException("Another approved booking already occupies this time range");
		}
		b.setStatus(BookingStatus.APPROVED);
		b.setAdminReason(null);
		if (b.getCheckInToken() == null || b.getCheckInToken().isBlank()) {
			b.setCheckInToken(UUID.randomUUID().toString());
		}
		b.setUpdatedAt(Instant.now());
		Booking saved = bookingRepository.save(b);
		notificationService.publish(
				NotificationType.BOOKING,
				"Booking approved",
				"Your booking was approved by the admin team.",
				saved.getRequestedByUserId(),
				"BOOKING",
				saved.getId());
		return saved;
	}

	public Booking reject(String id, RejectBookingRequest req) {
		Booking b = getById(id);
		if (b.getStatus() != BookingStatus.PENDING) {
			throw new IllegalStateException("Only PENDING bookings can be rejected");
		}
		b.setStatus(BookingStatus.REJECTED);
		b.setAdminReason(req.getReason().trim());
		b.setUpdatedAt(Instant.now());
		Booking saved = bookingRepository.save(b);
		notificationService.publish(
				NotificationType.BOOKING,
				"Booking rejected",
				"Your booking was rejected. Reason: " + saved.getAdminReason(),
				saved.getRequestedByUserId(),
				"BOOKING",
				saved.getId());
		return saved;
	}

	public Booking cancel(String id) {
		Booking b = getById(id);
		if (b.getStatus() != BookingStatus.APPROVED && b.getStatus() != BookingStatus.PENDING) {
			throw new IllegalStateException("Only APPROVED or PENDING bookings can be cancelled");
		}
		b.setStatus(BookingStatus.CANCELLED);
		b.setCheckedInAt(null);
		b.setCheckedInBy(null);
		b.setUpdatedAt(Instant.now());
		Booking saved = bookingRepository.save(b);
		notificationService.publish(
				NotificationType.BOOKING,
				"Booking cancelled",
				"Your booking was cancelled.",
				saved.getRequestedByUserId(),
				"BOOKING",
				saved.getId());
		return saved;
	}

	public void delete(String id) {
		if (!bookingRepository.existsById(id)) {
			throw new NotFoundException("Booking not found");
		}
		bookingRepository.deleteById(id);
	}

	public Booking getCheckInDetails(String id) {
		Booking booking = getById(id);
		if (booking.getStatus() != BookingStatus.APPROVED) {
			throw new IllegalStateException("Only approved bookings can be checked in");
		}
		if (booking.getCheckInToken() == null || booking.getCheckInToken().isBlank()) {
			booking.setCheckInToken(UUID.randomUUID().toString());
			booking.setUpdatedAt(Instant.now());
			booking = bookingRepository.save(booking);
		}
		return booking;
	}

	public Booking verifyCheckIn(String token, String verifiedBy) {
		Booking booking = bookingRepository.findByCheckInToken(token == null ? null : token.trim());
		if (booking == null) {
			throw new NotFoundException("Booking check-in token not found");
		}
		if (booking.getStatus() != BookingStatus.APPROVED) {
			throw new IllegalStateException("Only approved bookings can be checked in");
		}
		if (booking.getCheckedInAt() == null) {
			booking.setCheckedInAt(Instant.now());
		}
		if (verifiedBy != null && !verifiedBy.isBlank()) {
			booking.setCheckedInBy(verifiedBy.trim());
		}
		booking.setUpdatedAt(Instant.now());
		Booking saved = bookingRepository.save(booking);
		notificationService.publish(
				NotificationType.BOOKING,
				"Booking checked in",
				"Your approved booking was verified at check-in.",
				saved.getRequestedByUserId(),
				"BOOKING",
				saved.getId());
		return saved;
	}

	private static void validateRange(Instant start, Instant end) {
		if (!end.isAfter(start)) {
			throw new IllegalArgumentException("endDateTime must be after startDateTime");
		}
	}
}
