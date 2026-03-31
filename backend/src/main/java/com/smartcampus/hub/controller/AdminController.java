package com.smartcampus.hub.controller;

import com.smartcampus.hub.auth.User;
import com.smartcampus.hub.auth.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/create-admin")
    public ResponseEntity<Map<String, Object>> createAdmin(@RequestBody Map<String, String> adminData) {
        try {
            String email = adminData.get("email");
            String name = adminData.get("name");
            
            Optional<User> existingUser = userRepository.findByEmail(email);
            User adminUser;
            
            if (existingUser.isPresent()) {
                adminUser = existingUser.get();
                adminUser.setRole(User.UserRole.ADMIN);
            } else {
                adminUser = new User();
                adminUser.setEmail(email);
                adminUser.setName(name);
                adminUser.setRole(User.UserRole.ADMIN);
                adminUser.setEnabled(true);
            }
            
            userRepository.save(adminUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Admin user created successfully");
            response.put("email", email);
            response.put("role", "ADMIN");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Failed to create admin: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/check-admin/{email}")
    public ResponseEntity<Map<String, Object>> checkAdmin(@PathVariable String email) {
        try {
            Optional<User> user = userRepository.findByEmail(email);
            Map<String, Object> response = new HashMap<>();
            
            if (user.isPresent() && user.get().getRole() == User.UserRole.ADMIN) {
                response.put("status", "success");
                response.put("isAdmin", true);
                response.put("email", email);
            } else {
                response.put("status", "success");
                response.put("isAdmin", false);
                response.put("email", email);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Failed to check admin: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
