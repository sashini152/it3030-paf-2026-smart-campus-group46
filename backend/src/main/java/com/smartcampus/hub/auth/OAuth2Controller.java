package com.smartcampus.hub.auth;

import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class OAuth2Controller {

    @GetMapping("/api/auth/me")
    public Map<String, Object> me(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return Map.of();
        }

        return Map.of(
                "name", principal.getAttribute("name"),
                "email", principal.getAttribute("email"),
                "picture", principal.getAttribute("picture"),
                "role", "USER"
        );
    }
}