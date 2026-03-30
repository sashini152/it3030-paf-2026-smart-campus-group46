package com.smartcampus.incidentticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class IncidentTicketDto {

    private String id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "CreatedBy is required")
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
