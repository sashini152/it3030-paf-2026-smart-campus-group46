package com.smartcampus.hub.incidentticket.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TicketChatMessageDto {

    private String id;

    @NotBlank(message = "Ticket ID is required")
    private String ticketId;

    @NotBlank(message = "Author ID is required")
    private String authorId;

    @NotBlank(message = "Author name is required")
    private String authorName;

    @NotBlank(message = "Content is required")
    @Size(max = 500, message = "Message must not exceed 500 characters")
    private String content;

    private LocalDateTime createdAt;
}
