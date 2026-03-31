package com.smartcampus.hub.auth;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("picture", user.getPicture());
        response.put("role", user.getRole().name());
        response.put("createdAt", user.getCreatedAt());
        response.put("lastLoginAt", user.getLastLoginAt());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refreshToken(@AuthenticationPrincipal UserDetails userDetails) {
        String newToken = jwtService.generateToken(userDetails);
        
        Map<String, String> response = new HashMap<>();
        response.put("token", newToken);
        response.put("expiresIn", String.valueOf(jwtService.getExpirationTime()));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        // In a real implementation, you might want to invalidate the token
        // For now, we'll just return a success response
        log.info("User logged out");
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        
        return ResponseEntity.ok(response);
    }
}
