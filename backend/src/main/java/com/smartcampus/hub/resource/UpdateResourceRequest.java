package com.smartcampus.hub.resource;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UpdateResourceRequest {

	@NotBlank(message = "Name is required")
	private String name;

	@NotNull(message = "Type is required")
	private String type;

	@NotNull(message = "Capacity is required")
	private Integer capacity;

	@NotBlank(message = "Location is required")
	private String location;

	private String availabilityWindows;

	@NotNull(message = "Status is required")
	private String status;

	private String description;

	// Getters and Setters
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public Integer getCapacity() {
		return capacity;
	}

	public void setCapacity(Integer capacity) {
		this.capacity = capacity;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public String getAvailabilityWindows() {
		return availabilityWindows;
	}

	public void setAvailabilityWindows(String availabilityWindows) {
		this.availabilityWindows = availabilityWindows;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
}
