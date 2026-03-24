package com.smartcampus.hub.booking;

import jakarta.validation.constraints.NotBlank;

public class RejectBookingRequest {

	@NotBlank
	private String reason;

	public String getReason() {
		return reason;
	}

	public void setReason(String reason) {
		this.reason = reason;
	}
}
