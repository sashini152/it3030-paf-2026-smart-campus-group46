package com.smartcampus.hub.booking;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;

import com.smartcampus.hub.common.ConflictException;
import com.smartcampus.hub.common.NotFoundException;
import com.smartcampus.hub.resource.ResourceService;
import com.smartcampus.hub.resource.ResourceStatus;

@Service
public class BookingService {

	private final BookingRepository bookingRepository;
	private final ResourceService resourceService;

	public BookingService(BookingRepository bookingRepository, ResourceService resourceService) {
		this.bookingRepository = bookingRepository;
		this.resourceService = resourceService;
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
		return bookingRepository.save(b);
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
		b.setUpdatedAt(Instant.now());
		return bookingRepository.save(b);
	}

	public Booking reject(String id, RejectBookingRequest req) {
		Booking b = getById(id);
		if (b.getStatus() != BookingStatus.PENDING) {
			throw new IllegalStateException("Only PENDING bookings can be rejected");
		}
		b.setStatus(BookingStatus.REJECTED);
		b.setAdminReason(req.getReason().trim());
		b.setUpdatedAt(Instant.now());
		return bookingRepository.save(b);
	}

	public Booking cancel(String id) {
		Booking b = getById(id);
		if (b.getStatus() != BookingStatus.APPROVED && b.getStatus() != BookingStatus.PENDING) {
			throw new IllegalStateException("Only APPROVED or PENDING bookings can be cancelled");
		}
		b.setStatus(BookingStatus.CANCELLED);
		b.setUpdatedAt(Instant.now());
		return bookingRepository.save(b);
	}

	public void delete(String id) {
		if (!bookingRepository.existsById(id)) {
			throw new NotFoundException("Booking not found");
		}
		bookingRepository.deleteById(id);
	}

	private static void validateRange(Instant start, Instant end) {
		if (!end.isAfter(start)) {
			throw new IllegalArgumentException("endDateTime must be after startDateTime");
		}
	}
}
