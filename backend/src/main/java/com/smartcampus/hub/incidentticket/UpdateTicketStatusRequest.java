package com.smartcampus.hub.incidentticket;

import jakarta.validation.constraints.NotBlank;

public class UpdateTicketStatusRequest {

	@NotBlank(message = "Status is required")
	private String status;

	private String rejectionReason;

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getRejectionReason() {
		return rejectionReason;
	}

	public void setRejectionReason(String rejectionReason) {
		this.rejectionReason = rejectionReason;
	}
}
