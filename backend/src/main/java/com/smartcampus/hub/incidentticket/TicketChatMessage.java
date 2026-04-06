package com.smartcampus.hub.incidentticket;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "ticket_chat_messages")
public class TicketChatMessage {

    @Id
    private String id;

    private String ticketId;

    private String authorId;

    private String authorName;

    private String content;

    private LocalDateTime createdAt;
}
