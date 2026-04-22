package com.smartcampus.hub.incidentticket;

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

    private String assignedTechnician;

    private String resolutionNotes;

    private String rejectionReason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime firstResponseAt;

    private LocalDateTime resolvedAt;
}
