package com.smartcampus.hub.incidentticket;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smartcampus.hub.common.NotFoundException;
import com.smartcampus.hub.incidentticket.dto.TicketChatMessageDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketChatService {

    private final TicketRepository ticketRepository;
    private final TicketChatMessageRepository repository;

    public List<TicketChatMessageDto> findByTicketId(String ticketId) {
        ensureTicketExists(ticketId);
        return repository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream().map(this::mapToDto).toList();
    }

    public TicketChatMessageDto create(TicketChatMessageDto dto) {
        ensureTicketExists(dto.getTicketId());
        TicketChatMessage entity = new TicketChatMessage();
        entity.setTicketId(dto.getTicketId());
        entity.setAuthorId(dto.getAuthorId());
        entity.setAuthorName(dto.getAuthorName());
        entity.setContent(dto.getContent());
        entity.setCreatedAt(LocalDateTime.now());
        return mapToDto(repository.save(entity));
    }

    private void ensureTicketExists(String ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new NotFoundException("Ticket not found with id " + ticketId);
        }
    }

    private TicketChatMessageDto mapToDto(TicketChatMessage entity) {
        TicketChatMessageDto dto = new TicketChatMessageDto();
        dto.setId(entity.getId());
        dto.setTicketId(entity.getTicketId());
        dto.setAuthorId(entity.getAuthorId());
        dto.setAuthorName(entity.getAuthorName());
        dto.setContent(entity.getContent());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
