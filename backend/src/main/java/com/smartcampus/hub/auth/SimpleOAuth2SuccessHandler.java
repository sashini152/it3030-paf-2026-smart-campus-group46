package com.smartcampus.hub.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class SimpleOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException {

        System.out.println("=== SIMPLE OAuth2 Success Handler Called ===");

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        System.out.println("Email: " + email);
        System.out.println("Name: " + name);

        // Assign role based on email domain
        String role = "USER"; // Default role
        boolean isAdmin = false;

        if (email != null) {
            if (email.endsWith("@admin.com")) {
                isAdmin = true;
                System.out.println("Admin match: @admin.com domain");
            } else if (email.endsWith("@slit.lk")) {
                isAdmin = true;
                System.out.println("Admin match: @slit.lk domain");
            } else if (email.equals("sashini.unilocatelk@gmail.com")) {
                isAdmin = true;
                System.out.println("Admin match: sashini.unilocatelk@gmail.com exact match");
            }
        }

        if (isAdmin) {
            role = "ADMIN";
        }

        System.out.println("Assigned Role: " + role);

        // Generate a simple token for testing
        String token = "test-token-" + System.currentTimeMillis();

        // Redirect to frontend with user data
        String redirectUrl = String.format(
                "http://localhost:5173/login?token=%s&role=%s&name=%s&email=%s",
                URLEncoder.encode(token, StandardCharsets.UTF_8),
                URLEncoder.encode(role, StandardCharsets.UTF_8),
                URLEncoder.encode(name != null ? name : "Unknown", StandardCharsets.UTF_8),
                URLEncoder.encode(email != null ? email : "unknown@example.com", StandardCharsets.UTF_8));
        System.out.println(" Redirecting to: " + redirectUrl);
        response.sendRedirect(redirectUrl);
    }
}
