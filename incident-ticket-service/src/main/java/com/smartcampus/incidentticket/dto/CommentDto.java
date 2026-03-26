package com.smartcampus.incidentticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentDto {

    private String id;
    private String ticketId;
    private String userId;

    @NotBlank(message = "Content is required")
    private String content;

    private LocalDateTime createdAt;
}

@Data
public class CreateCommentRequest {

    @NotBlank(message = "Content is required")
    private String content;
}