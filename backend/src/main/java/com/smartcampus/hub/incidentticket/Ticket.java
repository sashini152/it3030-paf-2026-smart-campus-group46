package com.smartcampus.hub.incidentticket;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    private String title;

    private String description;

    private String status;

    private String createdBy;

    private String category;

    private String priority;

    private String assignedTechnician;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime firstResponseAt;

    private LocalDateTime resolvedAt;

    private List<String> imageUrls;
}
