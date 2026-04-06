package com.smartcampus.hub.auth;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "app_users")
public class AppUser {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String name;

    private String role;

    @Indexed(unique = true, sparse = true)
    private String studentId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
