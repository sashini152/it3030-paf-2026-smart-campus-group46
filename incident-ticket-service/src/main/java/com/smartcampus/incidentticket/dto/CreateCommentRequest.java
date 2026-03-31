package com.smartcampus.incidentticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCommentRequest {

    @NotBlank(message = "Author is required")
    @Size(max = 60, message = "Author must be 60 characters or less")
    private String author;

    @NotBlank(message = "Content is required")
    @Size(min = 2, max = 500, message = "Content must be between 2 and 500 characters")
    private String content;
}
