package com.smartcampus.hub.auth;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Arrays;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        // Determine user role based on email
        String role = determineUserRole(email);

        // Build redirect URL with user data
        String redirectUrl = String.format("http://localhost:3000/oauth-success?email=%s&name=%s&role=%s&picture=%s",
                URLEncoder.encode(email, StandardCharsets.UTF_8),
                URLEncoder.encode(name, StandardCharsets.UTF_8),
                URLEncoder.encode(role, StandardCharsets.UTF_8),
                URLEncoder.encode(picture != null ? picture : "", StandardCharsets.UTF_8));

        response.sendRedirect(redirectUrl);
    }

    private String determineUserRole(String email) {
        if (email == null)
            return "USER";

        // Check for super admin emails
        if (email.toLowerCase().contains("admin") ||
                email.toLowerCase().contains("superadmin") ||
                email.equals("sashinigeshani1@gmail.com")) {
            return "SUPER_ADMIN";
        }

        // Check for admin emails
        if (email.toLowerCase().contains("faculty") ||
                email.toLowerCase().contains("staff") ||
                email.toLowerCase().endsWith(".edu")) {
            return "ADMIN";
        }

        return "USER";
    }
}
