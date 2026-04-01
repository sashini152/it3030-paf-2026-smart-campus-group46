package com.smartcampus.hub.incidentticket.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Data
public class CommentDto {

    private String id;

    @NotBlank(message = "Content is required")
    @Size(max = 500, message = "Comment must not exceed 500 characters")
    private String content;

    @NotBlank(message = "Ticket ID is required")
    private String ticketId;

    @NotBlank(message = "Created by is required")
    private String createdBy;

    private LocalDateTime createdAt;
}
