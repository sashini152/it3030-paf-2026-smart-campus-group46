package com.smartcampus.hub.controller;

import com.smartcampus.hub.auth.User;
import com.smartcampus.hub.auth.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Backend is working!");
    }

    @GetMapping("/user-count")
    public ResponseEntity<String> getUserCount() {
        try {
            long count = userRepository.count();
            return ResponseEntity.ok("MongoDB connected. Total users: " + count);
        } catch (Exception e) {
            return ResponseEntity.ok("MongoDB error: " + e.getMessage());
        }
    }

    @GetMapping("/check-user/{email}")
    public ResponseEntity<String> checkUser(@PathVariable String email) {
        try {
            var user = userRepository.findByEmail(email);
            if (user.isPresent()) {
                User u = user.get();
                return ResponseEntity.ok("✅ User found: " + u.getEmail() + 
                    "\nRole: " + u.getRole() + 
                    "\nID: " + u.getId() + 
                    "\nName: " + u.getName() +
                    "\nCreated: " + u.getCreatedAt());
            } else {
                return ResponseEntity.ok("❌ User not found: " + email);
            }
        } catch (Exception e) {
            return ResponseEntity.ok("Database error: " + e.getMessage());
        }
    }

    @GetMapping("/all-users")
    public ResponseEntity<String> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            if (users.isEmpty()) {
                return ResponseEntity.ok("No users found in database");
            }
            
            StringBuilder result = new StringBuilder("Users in database (" + users.size() + "):\n");
            for (User user : users) {
                result.append("👤 ").append(user.getEmail())
                       .append(" (").append(user.getRole()).append(")")
                       .append(" - ID: ").append(user.getId()).append("\n");
            }
            return ResponseEntity.ok(result.toString());
        } catch (Exception e) {
            return ResponseEntity.ok("Database error: " + e.getMessage());
        }
    }
}
