package com.smartcampus.hub.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 80, message = "Title must be between 5 and 80 characters")
    @Pattern(regexp = "^[A-Za-z ]+$", message = "Title can contain letters and spaces only")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 20, max = 300, message = "Description must be between 20 and 300 characters")
    private String description;

    private Category category;

    private Priority priority;

    private Status status;

    private String resourceId;

    @NotBlank(message = "CreatedBy is required")
    @Size(min = 3, max = 60, message = "CreatedBy must be between 3 and 60 characters")
    @Pattern(regexp = "^[A-Za-z ]+$", message = "CreatedBy can contain letters and spaces only")
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

