package com.smartcampus.hub.auth;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.smartcampus.hub.common.NotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppUserService {

    private final AppUserRepository repository;

    public AppUser ensureUser(String email, String name, String role) {
        String normalizedEmail = normalizeEmail(email);
        LocalDateTime now = LocalDateTime.now();

        AppUser user = repository.findByEmailIgnoreCase(normalizedEmail).orElseGet(() -> {
            AppUser created = new AppUser();
            created.setEmail(normalizedEmail);
            created.setCreatedAt(now);
            return created;
        });

        user.setName(name);
        user.setRole(role);
        user.setUpdatedAt(now);

        if (!"ADMIN".equalsIgnoreCase(role) && (user.getStudentId() == null || user.getStudentId().isBlank())) {
            user.setStudentId(nextStudentId());
        }

        return repository.save(user);
    }

    public AppUser findByEmail(String email) {
        return repository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new NotFoundException("User not found for email " + email));
    }

    private String nextStudentId() {
        long nextSequence = repository.countByRole("USER") + 1;
        String candidate = formatStudentId(nextSequence);

        while (studentIdExists(candidate)) {
            nextSequence += 1;
            candidate = formatStudentId(nextSequence);
        }

        return candidate;
    }

    private static String formatStudentId(long sequence) {
        return String.format("SID_%03d", sequence);
    }

    private boolean studentIdExists(String studentId) {
        return repository.findAll().stream().anyMatch(user -> studentId.equals(user.getStudentId()));
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
