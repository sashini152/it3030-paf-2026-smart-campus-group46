package com.smartcampus.hub.notification;

public class NotificationPreferenceRequest {

	private boolean bookingEnabled = true;
	private boolean ticketEnabled = true;
	private boolean commentEnabled = true;
	private boolean systemEnabled = true;

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
}
