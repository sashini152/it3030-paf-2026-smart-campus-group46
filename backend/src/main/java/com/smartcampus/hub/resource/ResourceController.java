package com.smartcampus.hub.resource;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

	private final ResourceService resourceService;

	public ResourceController(ResourceService resourceService) {
		this.resourceService = resourceService;
	}

	@GetMapping
	public List<Resource> list(
			@RequestParam(required = false) ResourceType type,
			@RequestParam(required = false) String location,
			@RequestParam(required = false) Integer minCapacity,
			@RequestParam(required = false) String q) {
		return resourceService.search(type, location, minCapacity, q);
	}

	@GetMapping("/{id}")
	public Resource get(@PathVariable String id) {
		return resourceService.getById(id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Resource create(@Valid @RequestBody CreateResourceRequest body) {
		return resourceService.create(body);
	}

	@PutMapping("/{id}")
	public Resource update(@PathVariable String id, @Valid @RequestBody UpdateResourceRequest body) {
		return resourceService.update(id, body);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable String id) {
		resourceService.delete(id);
	}
}
