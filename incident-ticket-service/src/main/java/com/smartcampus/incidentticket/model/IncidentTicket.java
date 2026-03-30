package com.smartcampus.incidentticket.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "incident_tickets")
public class IncidentTicket {

    @Id
    private String id;

    private String title;

    private String description;

    private String status;

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
