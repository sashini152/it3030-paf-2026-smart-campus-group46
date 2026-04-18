package com.smartcampus.hub.auth;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User implements UserDetails {

    @Id
    private String id;

    private String email;
    private String name;
    private String picture;
    private String studentId;
    private String password;
    private UserRole role;
    private boolean enabled = true;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;

    // =========================
    // Spring Security Roles
    // =========================
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Converts ADMIN → ROLE_ADMIN
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    // =========================
    // USER ROLE ENUM (FIXED)
    // =========================
    public enum UserRole {
        USER,
        ADMIN,
        SUPER_ADMIN,
        TECHNICIAN,
        MANAGER;
    }
}