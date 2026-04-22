package com.smartcampus.hub.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mongo")
public class MongoController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testConnection() {
        try {
            // Test database connection
            long userCount = mongoTemplate.getCollection("users").countDocuments();
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "connected");
            response.put("database", "smartcampus");
            response.put("collection", "users");
            response.put("userCount", userCount);
            response.put("message", "MongoDB connection successful");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "MongoDB connection failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        try {
            List<Map> users = mongoTemplate.findAll(Map.class, "users");
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("count", users.size());
            response.put("users", users);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Failed to fetch users: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
