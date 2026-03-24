package com.smartcampus.hub.booking;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "bookings")
public class Booking {

	@Id
	private String id;
	private String resourceId;
	private String requestedByUserId;
	private Instant startDateTime;
	private Instant endDateTime;
	private String purpose;
	private int expectedAttendees;
	private BookingStatus status;
	private String adminReason;
	private Instant createdAt;
	private Instant updatedAt;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getResourceId() {
		return resourceId;
	}

	public void setResourceId(String resourceId) {
		this.resourceId = resourceId;
	}

	public String getRequestedByUserId() {
		return requestedByUserId;
	}

	public void setRequestedByUserId(String requestedByUserId) {
		this.requestedByUserId = requestedByUserId;
	}

	public Instant getStartDateTime() {
		return startDateTime;
	}

	public void setStartDateTime(Instant startDateTime) {
		this.startDateTime = startDateTime;
	}

	public Instant getEndDateTime() {
		return endDateTime;
	}

	public void setEndDateTime(Instant endDateTime) {
		this.endDateTime = endDateTime;
	}

	public String getPurpose() {
		return purpose;
	}

	public void setPurpose(String purpose) {
		this.purpose = purpose;
	}

	public int getExpectedAttendees() {
		return expectedAttendees;
	}

	public void setExpectedAttendees(int expectedAttendees) {
		this.expectedAttendees = expectedAttendees;
	}

	public BookingStatus getStatus() {
		return status;
	}

	public void setStatus(BookingStatus status) {
		this.status = status;
	}

	public String getAdminReason() {
		return adminReason;
	}

	public void setAdminReason(String adminReason) {
		this.adminReason = adminReason;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Instant createdAt) {
		this.createdAt = createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(Instant updatedAt) {
		this.updatedAt = updatedAt;
	}
}
