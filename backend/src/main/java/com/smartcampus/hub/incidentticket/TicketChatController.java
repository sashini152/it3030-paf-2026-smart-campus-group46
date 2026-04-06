package com.smartcampus.hub.incidentticket;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.hub.incidentticket.dto.TicketChatMessageDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tickets/{ticketId}/chat-messages")
public class TicketChatController {

    private final TicketChatService ticketChatService;
    private final TicketService ticketService;

    public TicketChatController(TicketChatService ticketChatService, TicketService ticketService) {
        this.ticketChatService = ticketChatService;
        this.ticketService = ticketService;
    }

    @GetMapping
    public List<TicketChatMessageDto> getMessages(@PathVariable String ticketId) {
        return ticketChatService.findByTicketId(ticketId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketChatMessageDto createMessage(@PathVariable String ticketId, @Valid @RequestBody CreateTicketChatMessageRequest body) {
        TicketChatMessageDto dto = new TicketChatMessageDto();
        dto.setTicketId(ticketId);
        dto.setAuthorId(body.getAuthorId());
        dto.setAuthorName(body.getAuthorName());
        dto.setContent(body.getContent());
        TicketChatMessageDto created = ticketChatService.create(dto);
        if (isSupportAuthor(body.getAuthorId()) || isSupportAuthor(body.getAuthorName())) {
            ticketService.markFirstResponseIfNeeded(ticketId);
        }
        return created;
    }

    private static boolean isSupportAuthor(String value) {
        if (value == null) return false;
        String normalized = value.trim().toLowerCase();
        return normalized.contains("admin") || normalized.contains("support");
    }
}
