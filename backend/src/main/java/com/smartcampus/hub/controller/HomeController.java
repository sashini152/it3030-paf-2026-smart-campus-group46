package com.smartcampus.hub.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<String> home() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Smart Campus Hub API</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        h1 { color: #333; }
                        p { color: #666; }
                        a { color: #007bff; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <h1>Smart Campus Hub API</h1>
                    <p>The backend API is running successfully.</p>
                    <p>Access the frontend at <a href="http://localhost:3000">http://localhost:3000</a></p>
                    <p>API health check: <a href="/api/health">/api/health</a></p>
                </body>
                </html>
                """;
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
    }

    @GetMapping("/login")
    public ResponseEntity<String> login() {
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Login - Smart Campus Hub</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        h1 { color: #333; }
                        p { color: #666; }
                        a { color: #007bff; text-decoration: none; }
                    </style>
                    <meta http-equiv="refresh" content="0; url=http://localhost:3000">
                </head>
                <body>
                    <h1>Redirecting to Login...</h1>
                    <p>If you are not redirected, <a href="http://localhost:3000">click here</a>.</p>
                </body>
                </html>
                """;
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
    }
}