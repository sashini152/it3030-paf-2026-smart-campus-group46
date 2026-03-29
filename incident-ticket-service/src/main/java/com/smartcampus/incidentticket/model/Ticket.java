package com.smartcampus.incidentticket.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    private String id;

    private String title;

    private String description;

    private Category category;

    private Priority priority;

    private Status status;

    private String resourceId;

    private String createdBy;

    private String assignedTo;

    private List<String> imageUrls;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Category {
        HARDWARE, SOFTWARE, NETWORK, OTHER
    }

    public enum Priority {
        LOW, MEDIUM, HIGH
    }

    public enum Status {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    }
}