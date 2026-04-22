package com.smartcampus.hub.controller;

import com.smartcampus.hub.auth.User;
import com.smartcampus.hub.auth.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/user-count")
    public ResponseEntity<String> getUserCount() {
        long count = userRepository.count();
        return ResponseEntity.ok("Total users: " + count);
    }

    @GetMapping("/current-user")
    public ResponseEntity<String> getCurrentUserEmail() {
        // This will help verify authentication is working
        return ResponseEntity.ok("Test endpoint working");
    }

    @GetMapping("/check-user/{email}")
    public ResponseEntity<String> checkUser(@PathVariable String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            User u = user.get();
            return ResponseEntity.ok("User found: " + u.getEmail() + ", Role: " + u.getRole() + ", ID: " + u.getId());
        } else {
            return ResponseEntity.ok("User not found: " + email);
        }
    }

    @GetMapping("/all-users-simple")
    public ResponseEntity<String> getAllUsersSimple() {
        List<User> users = userRepository.findAll();
        StringBuilder result = new StringBuilder("Users in database:\n");
        for (User user : users) {
            result.append("- ").append(user.getEmail())
                   .append(" (Role: ").append(user.getRole())
                   .append(", ID: ").append(user.getId()).append(")\n");
        }
        return ResponseEntity.ok(result.toString());
    }
}
