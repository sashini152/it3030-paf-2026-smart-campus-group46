package com.smartcampus.hub.resource;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResourceRepository extends MongoRepository<Resource, String> {
}
