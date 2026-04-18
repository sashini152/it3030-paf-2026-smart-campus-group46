package com.smartcampus.hub.auth;

import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthRepository authRepository;

    public AuthService(AuthRepository authRepository) {
        this.authRepository = authRepository;
    }

    public AuthResponse register(RegisterRequest request) {
        if (authRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        AppRole role = AppRole.USER;
        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            role = AppRole.ADMIN;
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(User.UserRole.valueOf(role.name()));

        User saved = authRepository.save(user);

        return new AuthResponse(
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        User user = authRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPassword() == null || !user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name());
    }
}