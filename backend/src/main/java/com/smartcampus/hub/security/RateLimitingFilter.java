package com.smartcampus.hub.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    // In-memory store for rate limiting
    private final ConcurrentHashMap<String, Integer> requestCounts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> lastRequestTime = new ConcurrentHashMap<>();

    private static final int MAX_REQUESTS_PER_MINUTE = 60;
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final Duration LOGIN_BLOCK_DURATION = Duration.ofMinutes(15);

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        String clientIp = getClientIp(request);
        String endpoint = request.getRequestURI();
        
        // Skip rate limiting for health checks and static resources
        if (endpoint.startsWith("/health") || endpoint.startsWith("/static") || endpoint.startsWith("/css") || endpoint.startsWith("/js")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Special rate limiting for login endpoints
        if (endpoint.contains("/login") || endpoint.contains("/oauth2")) {
            if (isLoginRateLimited(clientIp)) {
                sendRateLimitResponse(response, "Too many login attempts. Please try again later.");
                return;
            }
        }

        // General rate limiting
        if (isRateLimited(clientIp)) {
            sendRateLimitResponse(response, "Rate limit exceeded. Please try again later.");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    private boolean isRateLimited(String clientIp) {
        String key = "rate_limit:" + clientIp;
        return isRateLimitedInMemory(key);
    }

    private boolean isLoginRateLimited(String clientIp) {
        String key = "login_limit:" + clientIp;
        return isLoginRateLimitedInMemory(key);
    }

    private boolean isRateLimitedInMemory(String key) {
        long currentTime = System.currentTimeMillis();
        long lastTime = lastRequestTime.getOrDefault(key, 0L);
        
        // Reset counter if more than a minute has passed
        if (currentTime - lastTime > 60000) {
            requestCounts.put(key, 1);
            lastRequestTime.put(key, currentTime);
            return false;
        }
        
        int currentCount = requestCounts.getOrDefault(key, 0);
        if (currentCount >= MAX_REQUESTS_PER_MINUTE) {
            return true;
        }
        
        requestCounts.put(key, currentCount + 1);
        return false;
    }

    private boolean isLoginRateLimitedInMemory(String key) {
        long currentTime = System.currentTimeMillis();
        long lastTime = lastRequestTime.getOrDefault(key, 0L);
        
        // Reset counter if block duration has passed
        if (currentTime - lastTime > LOGIN_BLOCK_DURATION.toMillis()) {
            requestCounts.put(key, 1);
            lastRequestTime.put(key, currentTime);
            return false;
        }
        
        int currentCount = requestCounts.getOrDefault(key, 0);
        if (currentCount >= MAX_LOGIN_ATTEMPTS) {
            return true;
        }
        
        requestCounts.put(key, currentCount + 1);
        return false;
    }

    private void sendRateLimitResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(429); // HTTP 429 Too Many Requests
        response.setContentType("application/json");
        response.getWriter().write(String.format(
            "{\"timestamp\":\"%s\",\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"%s\"}",
            java.time.LocalDateTime.now(),
            message
        ));
    }
}
