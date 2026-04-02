package com.smartcampus.hub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class IncidentTicketDto {

    private String id;

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 80, message = "Title must be between 5 and 80 characters")
    @Pattern(regexp = "^[A-Za-z ]+$", message = "Title can contain letters and spaces only")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 20, max = 300, message = "Description must be between 20 and 300 characters")
    private String description;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "CreatedBy is required")
    @Size(min = 3, max = 60, message = "CreatedBy must be between 3 and 60 characters")
    @Pattern(regexp = "^[A-Za-z ]+$", message = "CreatedBy can contain letters and spaces only")
    private String createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime firstResponseAt;

    private LocalDateTime resolvedAt;

    public long getFirstResponseTimeMinutes() {
        if (createdAt == null || firstResponseAt == null) return -1;
        return java.time.temporal.ChronoUnit.MINUTES.between(createdAt, firstResponseAt);
    }

    public long getResolutionTimeMinutes() {
        if (createdAt == null || resolvedAt == null) return -1;
        return java.time.temporal.ChronoUnit.MINUTES.between(createdAt, resolvedAt);
    }
}

