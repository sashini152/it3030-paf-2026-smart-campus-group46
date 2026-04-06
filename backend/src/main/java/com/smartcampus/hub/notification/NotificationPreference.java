package com.smartcampus.hub.notification;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notification_preferences")
public class NotificationPreference {

	@Id
	private String userId;
	private boolean bookingEnabled = true;
	private boolean ticketEnabled = true;
	private boolean commentEnabled = true;
	private boolean systemEnabled = true;
	private Instant createdAt;
	private Instant updatedAt;

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public boolean isBookingEnabled() {
		return bookingEnabled;
	}

	public void setBookingEnabled(boolean bookingEnabled) {
		this.bookingEnabled = bookingEnabled;
	}

	public boolean isTicketEnabled() {
		return ticketEnabled;
	}

	public void setTicketEnabled(boolean ticketEnabled) {
		this.ticketEnabled = ticketEnabled;
	}

	public boolean isCommentEnabled() {
		return commentEnabled;
	}

	public void setCommentEnabled(boolean commentEnabled) {
		this.commentEnabled = commentEnabled;
	}

	public boolean isSystemEnabled() {
		return systemEnabled;
	}

	public void setSystemEnabled(boolean systemEnabled) {
		this.systemEnabled = systemEnabled;
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
