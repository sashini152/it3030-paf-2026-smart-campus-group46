package com.smartcampus.hub.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.ServletException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import java.io.IOException;
import java.time.LocalDateTime;

import lombok.RequiredArgsConstructor;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException {

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String picture = oauth2User.getAttribute("picture");

        System.out.println("=== OAuth2 Login Attempt ===");
        System.out.println("Email: " + email);
        System.out.println("Name: " + name);
        System.out.println("Picture: " + picture);

        // Find or create user
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    System.out.println("Creating new user for email: " + email);
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setPicture(picture);
                    newUser.setRole(User.UserRole.USER); // Default role for new users
                    newUser.setCreatedAt(LocalDateTime.now());
                    return newUser;
                });

        // Update user info
        user.setName(name);
        user.setPicture(picture);
        user.setLastLoginAt(LocalDateTime.now());
        user.setEnabled(true);

        try {
            userRepository.save(user);
            System.out.println("✅ User saved successfully to MongoDB: " + user.getEmail());
            System.out.println("User Role: " + user.getRole());
            System.out.println("User ID: " + user.getId());
        } catch (Exception e) {
            System.err.println("❌ Error saving user to MongoDB: " + e.getMessage());
            e.printStackTrace();
        }

        // Generate JWT token
        String token = jwtService.generateToken(user);
        System.out.println("✅ JWT Token generated successfully");

        // Redirect to frontend with token
        String redirectUrl = String.format(
                "http://localhost:5173/login?token=%s&role=%s&name=%s&email=%s",
                URLEncoder.encode(token, StandardCharsets.UTF_8),
                URLEncoder.encode(user.getRole().name(), StandardCharsets.UTF_8),
                URLEncoder.encode(user.getName(), StandardCharsets.UTF_8),
                URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8));
        System.out.println("🔄 Redirecting to: " + redirectUrl);

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
