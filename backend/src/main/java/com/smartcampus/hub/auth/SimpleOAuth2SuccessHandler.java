package com.smartcampus.hub.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Set;

@Component
public class SimpleOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    // Add all approved admin emails here
    private static final Set<String> ADMIN_EMAILS = Set.of(
            "sashini.unilocatelk@gmail.com",
            "hafzanahamed99@gmail.com"
            
    );

    private final AppUserService appUserService;

    public SimpleOAuth2SuccessHandler(AppUserService appUserService) {
        this.appUserService = appUserService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        System.out.println("=== SIMPLE OAuth2 Success Handler Called ===");

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        System.out.println("Email: " + email);
        System.out.println("Name: " + name);

        // Default role
        String role = "USER";
        boolean isAdmin = false;

        if (email != null) {
            String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

            // Domain-based admin rules
            if (normalizedEmail.endsWith("@admin.com")) {
                isAdmin = true;
                System.out.println("Admin match: @admin.com domain");
            } else if (normalizedEmail.endsWith("@sliit.lk") || normalizedEmail.endsWith("@my.sliit.lk")) {
                isAdmin = true;
                System.out.println("Admin match: SLIIT domain");
            } else if (ADMIN_EMAILS.contains(normalizedEmail)) {
                isAdmin = true;
                System.out.println("Admin match: approved admin email");
            }
        }

        if (isAdmin) {
            role = "ADMIN";
        }

        // Ensure user exists in DB
        AppUser appUser = appUserService.ensureUser(
                email != null ? email : "unknown@example.com",
                name != null ? name : "Unknown",
                role);

        System.out.println("Assigned Role: " + role);

        // Generate a simple token for frontend (for testing)
        String token = "test-token-" + System.currentTimeMillis();

        // Redirect to frontend dashboard or login page
        String redirectUrl = String.format(
                "http://localhost:5173/login?token=%s&role=%s&name=%s&email=%s&studentId=%s",
                URLEncoder.encode(token, StandardCharsets.UTF_8),
                URLEncoder.encode(role, StandardCharsets.UTF_8),
                URLEncoder.encode(appUser.getName() != null ? appUser.getName() : "Unknown", StandardCharsets.UTF_8),
                URLEncoder.encode(appUser.getEmail() != null ? appUser.getEmail() : "unknown@example.com", StandardCharsets.UTF_8),
                URLEncoder.encode(appUser.getStudentId() != null ? appUser.getStudentId() : "", StandardCharsets.UTF_8)
        );

        System.out.println("Redirecting to: " + redirectUrl);
        response.sendRedirect(redirectUrl);
    }
}