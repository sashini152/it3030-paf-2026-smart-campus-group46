package com.smartcampus.hub.resource;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.smartcampus.hub.common.NotFoundException;

@Service
public class ResourceService {

	private final ResourceRepository resourceRepository;
	private final MongoTemplate mongoTemplate;

	public ResourceService(ResourceRepository resourceRepository, MongoTemplate mongoTemplate) {
		this.resourceRepository = resourceRepository;
		this.mongoTemplate = mongoTemplate;
	}

	public List<Resource> search(ResourceType type, String location, Integer minCapacity, String q) {
		List<Criteria> parts = new ArrayList<>();
		if (type != null) {
			parts.add(Criteria.where("type").is(type));
		}
		if (location != null && !location.isBlank()) {
			parts.add(Criteria.where("location").regex(location.trim(), "i"));
		}
		if (minCapacity != null) {
			parts.add(Criteria.where("capacity").gte(minCapacity));
		}
		if (q != null && !q.isBlank()) {
			String pattern = q.trim();
			parts.add(new Criteria().orOperator(
					Criteria.where("name").regex(pattern, "i"),
					Criteria.where("location").regex(pattern, "i")));
		}
		if (parts.isEmpty()) {
			return resourceRepository.findAll();
		}
		Criteria combined = parts.size() == 1
				? parts.get(0)
				: new Criteria().andOperator(parts.toArray(Criteria[]::new));
		return mongoTemplate.find(new Query(combined), Resource.class);
	}

	public Resource getById(String id) {
		return resourceRepository.findById(id).orElseThrow(() -> new NotFoundException("Resource not found"));
	}

	public Resource create(CreateResourceRequest req) {
		Instant now = Instant.now();
		Resource r = new Resource();
		r.setType(req.getType());
		r.setName(req.getName().trim());
		r.setCapacity(req.getCapacity());
		r.setLocation(req.getLocation().trim());
		r.setAvailabilityWindows(req.getAvailabilityWindows() == null ? null : req.getAvailabilityWindows().trim());
		r.setStatus(req.getStatus());
		r.setCreatedAt(now);
		r.setUpdatedAt(now);
		return resourceRepository.save(r);
	}

	public Resource update(String id, UpdateResourceRequest req) {
		Resource r = getById(id);
		r.setType(req.getType());
		r.setName(req.getName().trim());
		r.setCapacity(req.getCapacity());
		r.setLocation(req.getLocation().trim());
		r.setAvailabilityWindows(req.getAvailabilityWindows() == null ? null : req.getAvailabilityWindows().trim());
		r.setStatus(req.getStatus());
		r.setUpdatedAt(Instant.now());
		return resourceRepository.save(r);
	}

	public void delete(String id) {
		if (!resourceRepository.existsById(id)) {
			throw new NotFoundException("Resource not found");
		}
		resourceRepository.deleteById(id);
	}
}
