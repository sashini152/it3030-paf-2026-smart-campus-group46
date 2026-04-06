package com.smartcampus.hub.admin;

import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.smartcampus.hub.booking.Booking;
import com.smartcampus.hub.booking.BookingRepository;
import com.smartcampus.hub.booking.BookingStatus;
import com.smartcampus.hub.resource.Resource;
import com.smartcampus.hub.resource.ResourceRepository;

@Service
public class AdminAnalyticsService {

	private final BookingRepository bookingRepository;
	private final ResourceRepository resourceRepository;

	public AdminAnalyticsService(BookingRepository bookingRepository, ResourceRepository resourceRepository) {
		this.bookingRepository = bookingRepository;
		this.resourceRepository = resourceRepository;
	}

	public UsageAnalyticsDto getUsageAnalytics() {
		List<Booking> approvedBookings = bookingRepository.findAll().stream()
				.filter(booking -> booking.getStatus() == BookingStatus.APPROVED)
				.toList();
		Map<String, Resource> resourcesById = resourceRepository.findAll().stream()
				.collect(Collectors.toMap(Resource::getId, resource -> resource));

		List<UsageAnalyticsDto.ResourceUsageDto> topResources = approvedBookings.stream()
				.collect(Collectors.groupingBy(Booking::getResourceId, Collectors.counting()))
				.entrySet().stream()
				.sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
				.limit(5)
				.map(entry -> {
					UsageAnalyticsDto.ResourceUsageDto dto = new UsageAnalyticsDto.ResourceUsageDto();
					dto.setResourceId(entry.getKey());
					dto.setBookingCount(entry.getValue());
					Resource resource = resourcesById.get(entry.getKey());
					dto.setResourceName(resource == null ? entry.getKey() : resource.getName());
					return dto;
				})
				.toList();

		List<UsageAnalyticsDto.BookingHourDto> peakBookingHours = approvedBookings.stream()
				.filter(booking -> booking.getStartDateTime() != null)
				.collect(Collectors.groupingBy(
						booking -> booking.getStartDateTime().atZone(ZoneId.systemDefault()).getHour(),
						Collectors.counting()))
				.entrySet().stream()
				.sorted(Map.Entry.<Integer, Long>comparingByValue(Comparator.reverseOrder()))
				.limit(6)
				.map(entry -> {
					UsageAnalyticsDto.BookingHourDto dto = new UsageAnalyticsDto.BookingHourDto();
					dto.setHour(entry.getKey());
					dto.setLabel(String.format("%02d:00 - %02d:59", entry.getKey(), entry.getKey()));
					dto.setBookingCount(entry.getValue());
					return dto;
				})
				.toList();

		UsageAnalyticsDto dto = new UsageAnalyticsDto();
		dto.setTopResources(topResources);
		dto.setPeakBookingHours(peakBookingHours);
		return dto;
	}
}
