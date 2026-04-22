package com.smartcampus.incidentticket.controller;

import com.smartcampus.incidentticket.config.AppProperties;
import com.smartcampus.incidentticket.config.SecurityConfiguration;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class OAuthFallbackController {

    private final AppProperties appProperties;

    public OAuthFallbackController(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    @GetMapping("/oauth2/authorization/google")
    public String redirectWhenOauthIsUnavailable() {
        if (appProperties.getOauth().getGoogle().isConfigured()) {
            return "redirect:/api/auth/google/start?mode=login";
        }

        return "redirect:" + SecurityConfiguration.buildFrontendUrl(
            appProperties,
            "/login",
            "oauth_not_configured"
        );
    }
}
