package com.smartcampus.incidentticket.controller;

import com.smartcampus.incidentticket.config.AppProperties;
import com.smartcampus.incidentticket.config.SecurityConfiguration;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class OAuthLoginController {

    private final AppProperties appProperties;

    public OAuthLoginController(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    @GetMapping("/api/auth/google/start")
    public String startGoogleLogin(@RequestParam(name = "mode", defaultValue = "login") String mode) {
        if (!appProperties.getOauth().getGoogle().isConfigured()) {
            return "redirect:" + SecurityConfiguration.buildFrontendUrl(
                appProperties,
                resolveFrontendPath(mode),
                "oauth_not_configured"
            );
        }

        return "redirect:/oauth2/authorization/google";
    }

    private String resolveFrontendPath(String mode) {
        return "signup".equalsIgnoreCase(mode) ? "/signup" : "/login";
    }
}
