package com.smartcampus.hub.controller;

import com.smartcampus.hub.auth.User;
import com.smartcampus.hub.auth.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/all-users")
    public ResponseEntity<Map<String, Object>> getAllAppUsers() {
        try {
            // Debug logging
            System.out.println("AUTH: " + SecurityContextHolder.getContext().getAuthentication());
            System.out
                    .println("AUTHORITIES: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());

            List<User> allUsers = userRepository.findAll();

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("users", allUsers);
            response.put("totalUsers", allUsers.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Failed to load all users: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
