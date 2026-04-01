package com.smartcampus.hub.booking;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

	private final BookingService bookingService;

	public BookingController(BookingService bookingService) {
		this.bookingService = bookingService;
	}

	@GetMapping
	public List<Booking> list(
			@RequestParam(required = false) BookingStatus status,
			@RequestParam(required = false) String userId,
			@RequestParam(required = false) String resourceId) {
		return bookingService.list(status, userId, resourceId);
	}

	@GetMapping("/{id}")
	public Booking get(@PathVariable String id) {
		return bookingService.getById(id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Booking create(@Valid @RequestBody CreateBookingRequest body) {
		return bookingService.create(body);
	}

	@PutMapping("/{id}/approve")
	public Booking approve(@PathVariable String id) {
		return bookingService.approve(id);
	}

	@PutMapping("/{id}/reject")
	public Booking reject(@PathVariable String id, @Valid @RequestBody RejectBookingRequest body) {
		return bookingService.reject(id, body);
	}

	@PutMapping("/{id}/cancel")
	public Booking cancel(@PathVariable String id) {
		return bookingService.cancel(id);
	}

	@GetMapping("/{id}/check-in")
	public Booking getCheckInDetails(@PathVariable String id) {
		return bookingService.getCheckInDetails(id);
	}

	@PatchMapping("/check-in/verify")
	public Booking verifyCheckIn(@Valid @RequestBody BookingCheckInRequest body) {
		return bookingService.verifyCheckIn(body.getToken(), body.getVerifiedBy());
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable String id) {
		bookingService.delete(id);
	}
}
