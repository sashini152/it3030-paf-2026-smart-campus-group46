package com.smartcampus.hub.controller;

import com.smartcampus.hub.auth.User;
import com.smartcampus.hub.auth.UserRepository;
import com.smartcampus.hub.notification.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
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
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> createAdmin(@RequestBody Map<String, String> adminData) {
        try {
            String email = adminData.get("email");
            String name = adminData.get("name");

            if (email == null || email.trim().isEmpty()) {
                return badRequest("Email is required");
            }

            if (name == null || name.trim().isEmpty()) {
                name = "Admin User";
            }

            email = email.trim().toLowerCase();
            name = name.trim();

            Optional<User> existingUser = userRepository.findByEmail(email);
            User adminUser;

            if (existingUser.isPresent()) {
                adminUser = existingUser.get();
                adminUser.setRole(User.UserRole.ADMIN);
                if (adminUser.getName() == null || adminUser.getName().trim().isEmpty()) {
                    adminUser.setName(name);
                }
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
            return serverError("Failed to create admin: " + e.getMessage());
        }
    }

    @GetMapping("/check-admin/{email}")
    public ResponseEntity<Map<String, Object>> checkAdmin(@PathVariable String email) {
        try {
            String decodedEmail = decodeEmail(email).toLowerCase();
            Optional<User> user = userRepository.findByEmail(decodedEmail);

            boolean isAdmin = user.isPresent() && (
                    user.get().getRole() == User.UserRole.ADMIN ||
                    user.get().getRole() == User.UserRole.SUPER_ADMIN
            );

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("isAdmin", isAdmin);
            response.put("email", decodedEmail);

            if (user.isPresent()) {
                response.put("role", user.get().getRole().toString());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return serverError("Failed to check admin: " + e.getMessage());
        }
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getAdminNotifications() {
        try {
            return ResponseEntity.ok(notificationService.getAllNotifications());
        } catch (Exception e) {
            return serverError("Failed to load notifications: " + e.getMessage());
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();

            users.sort(
                    Comparator.comparing(
                            user -> user.getName() == null ? "" : user.getName().toLowerCase()
                    )
            );

            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return serverError("Failed to load users: " + e.getMessage());
        }
    }

    @PatchMapping("/users/{email}/role")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @PathVariable String email,
            @RequestBody Map<String, String> roleData) {
        try {
            String decodedEmail = decodeEmail(email).toLowerCase();
            String newRole = roleData.get("role");

            if (newRole == null || newRole.trim().isEmpty()) {
                return badRequest("Role is required");
            }

            newRole = newRole.trim().toUpperCase();

            Optional<User> userOpt = userRepository.findByEmail(decodedEmail);
            if (userOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "User not found: " + decodedEmail);
                return ResponseEntity.status(404).body(error);
            }

            User user = userOpt.get();

            switch (newRole) {
                case "SUPER_ADMIN":
                    user.setRole(User.UserRole.SUPER_ADMIN);
                    break;
                case "ADMIN":
                    user.setRole(User.UserRole.ADMIN);
                    break;
                case "USER":
                    user.setRole(User.UserRole.USER);
                    break;
                case "TECHNICIAN":
                    user.setRole(User.UserRole.TECHNICIAN);
                    break;
                case "MANAGER":
                    user.setRole(User.UserRole.MANAGER);
                    break;
                default:
                    return badRequest("Invalid role: " + newRole);
            }

            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "User role updated successfully");
            response.put("email", decodedEmail);
            response.put("role", user.getRole().toString());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return serverError("Failed to update user role: " + e.getMessage());
        }
    }

    private String decodeEmail(String email) {
        return URLDecoder.decode(email, StandardCharsets.UTF_8);
    }

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("status", "error");
        error.put("message", message);
        return ResponseEntity.badRequest().body(error);
    }

    private ResponseEntity<Map<String, Object>> serverError(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("status", "error");
        error.put("message", message);
        return ResponseEntity.status(500).body(error);
    }
}