package com.smartcampus.hub.admin;

import java.util.List;

public class UsageAnalyticsDto {

	private List<ResourceUsageDto> topResources;
	private List<BookingHourDto> peakBookingHours;

	public List<ResourceUsageDto> getTopResources() {
		return topResources;
	}

	public void setTopResources(List<ResourceUsageDto> topResources) {
		this.topResources = topResources;
	}

	public List<BookingHourDto> getPeakBookingHours() {
		return peakBookingHours;
	}

	public void setPeakBookingHours(List<BookingHourDto> peakBookingHours) {
		this.peakBookingHours = peakBookingHours;
	}

	public static class ResourceUsageDto {
		private String resourceId;
		private String resourceName;
		private long bookingCount;

		public String getResourceId() {
			return resourceId;
		}

		public void setResourceId(String resourceId) {
			this.resourceId = resourceId;
		}

		public String getResourceName() {
			return resourceName;
		}

		public void setResourceName(String resourceName) {
			this.resourceName = resourceName;
		}

		public long getBookingCount() {
			return bookingCount;
		}

		public void setBookingCount(long bookingCount) {
			this.bookingCount = bookingCount;
		}
	}

	public static class BookingHourDto {
		private String label;
		private int hour;
		private long bookingCount;

		public String getLabel() {
			return label;
		}

		public void setLabel(String label) {
			this.label = label;
		}

		public int getHour() {
			return hour;
		}

		public void setHour(int hour) {
			this.hour = hour;
		}

		public long getBookingCount() {
			return bookingCount;
		}

		public void setBookingCount(long bookingCount) {
			this.bookingCount = bookingCount;
		}
	}
}
