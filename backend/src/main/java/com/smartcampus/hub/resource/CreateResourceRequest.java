package com.smartcampus.hub.resource;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateResourceRequest {

	@NotNull
	private ResourceType type;
	@NotBlank
	private String name;
	@Min(0)
	private int capacity;
	@NotBlank
	private String location;
	private String availabilityWindows;
	@NotNull
	private ResourceStatus status;

	public ResourceType getType() {
		return type;
	}

	public void setType(ResourceType type) {
		this.type = type;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public int getCapacity() {
		return capacity;
	}

	public void setCapacity(int capacity) {
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

	public ResourceStatus getStatus() {
		return status;
	}

	public void setStatus(ResourceStatus status) {
		this.status = status;
	}
}
