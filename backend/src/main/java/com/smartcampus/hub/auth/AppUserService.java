package com.smartcampus.hub.auth;

import org.springframework.stereotype.Service;

import com.smartcampus.hub.common.NotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppUserService {

    private final AppUserRepository repository;

    public AppUser ensureUser(String email, String name, String role) {
        String normalizedEmail = normalizeEmail(email);

        AppUser user = repository.findByEmailIgnoreCase(normalizedEmail).orElseGet(() -> {
            AppUser created = new AppUser();
            created.setEmail(normalizedEmail);
            return created;
        });

        user.setName(name);
        user.setRole(AppRole.valueOf(role));

        return repository.save(user);
    }

    public AppUser findByEmail(String email) {
        return repository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new NotFoundException("User not found for email " + email));
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
