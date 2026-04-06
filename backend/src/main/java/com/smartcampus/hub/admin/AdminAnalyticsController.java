package com.smartcampus.hub.admin;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/analytics")
public class AdminAnalyticsController {

	private final AdminAnalyticsService analyticsService;

	public AdminAnalyticsController(AdminAnalyticsService analyticsService) {
		this.analyticsService = analyticsService;
	}

	@GetMapping("/usage")
	public UsageAnalyticsDto getUsageAnalytics() {
		return analyticsService.getUsageAnalytics();
	}
}
