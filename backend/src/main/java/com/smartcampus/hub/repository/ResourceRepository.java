package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    
    List<Resource> findByType(String type);
    
    List<Resource> findByLocation(String location);
    
    List<Resource> findByStatus(String status);
    
    List<Resource> findByTypeAndStatus(String type, String status);
    
    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    List<Resource> findByNameContainingIgnoreCase(String name);
    
    @Query("{ 'capacity': { $gte: ?0 } }")
    List<Resource> findByCapacityGreaterThanEqual(int capacity);
    
    @Query("{ 'type': ?0, 'status': 'ACTIVE' }")
    List<Resource> findActiveResourcesByType(String type);
    
    @Query("{ 'status': 'ACTIVE' }")
    List<Resource> findAllActiveResources();
}
