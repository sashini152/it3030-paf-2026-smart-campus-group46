package com.smartcampus.incidentticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IncidentTicketDto {

    private String id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "CreatedBy is required")
    private String createdBy;
}
