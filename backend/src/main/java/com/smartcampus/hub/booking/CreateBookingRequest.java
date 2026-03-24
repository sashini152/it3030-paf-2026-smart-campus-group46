package com.smartcampus.hub.booking;

import java.time.Instant;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateBookingRequest {

	@NotBlank
	private String resourceId;
	@NotBlank
	private String requestedByUserId;
	@NotNull
	private Instant startDateTime;
	@NotNull
	private Instant endDateTime;
	@NotBlank
	private String purpose;
	@Min(1)
	private int expectedAttendees;

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
}
