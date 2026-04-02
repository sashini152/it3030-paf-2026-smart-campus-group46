package com.smartcampus.hub.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentDto {

    private String id;
    private String ticketId;
    private String author;
    private String content;
    private LocalDateTime createdAt;
}

