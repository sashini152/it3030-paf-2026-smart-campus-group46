package com.smartcampus.hub.auth;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AuthRepository extends MongoRepository<AppUser, String> {
    Optional<AppUser> findByEmail(String email);

    boolean existsByEmail(String email);
}