package com.smartcampus.incidentticket.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Frontend frontend = new Frontend();
    private final Auth auth = new Auth();
    private final Oauth oauth = new Oauth();

    public Frontend getFrontend() {
        return frontend;
    }

    public Auth getAuth() {
        return auth;
    }

    public Oauth getOauth() {
        return oauth;
    }

    public static class Frontend {
        private String baseUrl = "http://localhost:5173";

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }
    }

    public static class Auth {
        private List<String> adminEmails = new ArrayList<>();

        public List<String> getAdminEmails() {
            return adminEmails;
        }

        public void setAdminEmails(List<String> adminEmails) {
            this.adminEmails = adminEmails;
        }
    }

    public static class Oauth {
        private final Google google = new Google();

        public Google getGoogle() {
            return google;
        }

        public static class Google {
            private String clientId;
            private String clientSecret;

            public String getClientId() {
                return clientId;
            }

            public void setClientId(String clientId) {
                this.clientId = clientId;
            }

            public String getClientSecret() {
                return clientSecret;
            }

            public void setClientSecret(String clientSecret) {
                this.clientSecret = clientSecret;
            }

            public boolean isConfigured() {
                return hasText(clientId) && hasText(clientSecret);
            }

            private boolean hasText(String value) {
                return value != null && !value.trim().isEmpty();
            }
        }
    }
}
