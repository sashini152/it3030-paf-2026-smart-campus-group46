package com.smartcampus.hub.controller;

import com.smartcampus.hub.auth.User;
import com.smartcampus.hub.auth.UserRepository;
import com.smartcampus.hub.notification.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

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

    @GetMapping("/notifications")
    public ResponseEntity<?> getAdminNotifications() {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("notifications", notificationService.getAllNotifications());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Failed to load notifications: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PatchMapping("/users/{email}/role")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @PathVariable String email,
            @RequestBody Map<String, String> roleData) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "User not found: " + email);
                return ResponseEntity.status(404).body(error);
            }

            User user = userOpt.get();
            String newRole = roleData.get("role");

            if ("SUPER_ADMIN".equalsIgnoreCase(newRole)) {
                user.setRole(User.UserRole.SUPER_ADMIN);
            } else if ("ADMIN".equalsIgnoreCase(newRole)) {
                user.setRole(User.UserRole.ADMIN);
            } else if ("USER".equalsIgnoreCase(newRole)) {
                user.setRole(User.UserRole.USER);
            } else if ("TECHNICIAN".equalsIgnoreCase(newRole)) {
                user.setRole(User.UserRole.TECHNICIAN);
            } else if ("MANAGER".equalsIgnoreCase(newRole)) {
                user.setRole(User.UserRole.MANAGER);
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "Invalid role: " + newRole);
                return ResponseEntity.status(400).body(error);
            }

            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "User role updated successfully");
            response.put("email", email);
            response.put("role", user.getRole().toString());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Failed to update user role: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
