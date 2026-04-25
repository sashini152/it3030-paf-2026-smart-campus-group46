package com.smartcampus.hub.resource;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.smartcampus.hub.common.NotFoundException;
import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.repository.ResourceRepository;

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
            parts.add(Criteria.where("type").is(type.name()));
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
                    Criteria.where("location").regex(pattern, "i")
            ));
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
        return resourceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Resource not found"));
    }

    public Resource create(CreateResourceRequest req) {
        LocalDateTime now = LocalDateTime.now();

        Resource r = new Resource();
        r.setName(trimOrNull(req.getName()));
        r.setType(trimOrNull(req.getType()));
        r.setDescription(req.getDescription());
        r.setCapacity(req.getCapacity());
        r.setLocation(trimOrNull(req.getLocation()));
        r.setAvailabilityWindows(req.getAvailabilityWindows());
        r.setStatus(trimOrDefault(req.getStatus(), "ACTIVE"));
        r.setCreatedAt(now);
        r.setUpdatedAt(now);

        return resourceRepository.save(r);
    }

    public Resource update(String id, UpdateResourceRequest req) {
        Resource r = getById(id);

        r.setName(trimOrNull(req.getName()));
        r.setType(trimOrNull(req.getType()));
        r.setDescription(req.getDescription());
        r.setCapacity(req.getCapacity());
        r.setLocation(trimOrNull(req.getLocation()));
        r.setAvailabilityWindows(req.getAvailabilityWindows());
        r.setStatus(trimOrDefault(req.getStatus(), "ACTIVE"));
        r.setUpdatedAt(LocalDateTime.now());

        return resourceRepository.save(r);
    }

    public void delete(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new NotFoundException("Resource not found");
        }

        resourceRepository.deleteById(id);
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    private String trimOrNull(String value) {
        return value == null ? null : value.trim();
    }

    private String trimOrDefault(String value, String defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }

        return value.trim();
    }
}

