package com.smartcampus.hub.booking;

import jakarta.validation.constraints.NotBlank;

public class BookingCheckInRequest {

	@NotBlank
	private String token;
	private String verifiedBy;

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public String getVerifiedBy() {
		return verifiedBy;
	}

	public void setVerifiedBy(String verifiedBy) {
		this.verifiedBy = verifiedBy;
	}
}
