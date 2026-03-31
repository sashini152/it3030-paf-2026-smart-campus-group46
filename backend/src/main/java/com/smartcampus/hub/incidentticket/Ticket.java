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

    private LocalDateTime createdAt;

    private List<String> imageUrls;
}
