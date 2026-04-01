package com.smartcampus.hub.incidentticket;

import com.smartcampus.hub.incidentticket.dto.IncidentTicketDto;
import com.smartcampus.hub.common.NotFoundException;
import com.smartcampus.hub.notification.NotificationService;
import com.smartcampus.hub.notification.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentTicketService {

    private final IncidentTicketRepository repository;
    private final NotificationService notificationService;

    public IncidentTicketDto create(IncidentTicketDto dto) {
        IncidentTicket entity = mapToEntity(dto);
        LocalDateTime now = LocalDateTime.now();
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        IncidentTicket saved = repository.save(entity);
        notificationService.publish(
            NotificationType.TICKET,
            "New incident ticket submitted",
            "Ticket \"" + saved.getTitle() + "\" is now OPEN.",
            saved.getCreatedBy(),
            "TICKET",
            saved.getId()
        );
        return mapToDto(saved);
    }

    public List<IncidentTicketDto> findAll() {
        return repository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public IncidentTicketDto findById(String id) {
        return repository.findById(id).map(this::mapToDto)
            .orElseThrow(() -> new NotFoundException("Incident ticket not found with id " + id));
    }

    public IncidentTicketDto update(String id, IncidentTicketDto dto) {
        IncidentTicket existing = repository.findById(id)
            .orElseThrow(() -> new NotFoundException("Incident ticket not found with id " + id));

        String previousStatus = existing.getStatus();
        existing.setTitle(dto.getTitle());
        existing.setDescription(dto.getDescription());
        existing.setStatus(dto.getStatus());
        existing.setCreatedBy(dto.getCreatedBy());
        existing.setUpdatedAt(LocalDateTime.now());
        updateSlaFields(existing, previousStatus, dto.getStatus());

        IncidentTicket saved = repository.save(existing);
        if (saved.getStatus() != null && !saved.getStatus().equals(previousStatus)) {
            notificationService.publish(
                NotificationType.TICKET,
                "Ticket status updated",
                "Ticket \"" + saved.getTitle() + "\" moved to " + saved.getStatus() + ".",
                saved.getCreatedBy(),
                "TICKET",
                saved.getId()
            );
        }
        return mapToDto(saved);
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Incident ticket not found with id " + id);
        }
        repository.deleteById(id);
    }

    private IncidentTicketDto mapToDto(IncidentTicket entity) {
        IncidentTicketDto dto = new IncidentTicketDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setStatus(entity.getStatus());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setFirstResponseAt(entity.getFirstResponseAt());
        dto.setResolvedAt(entity.getResolvedAt());
        return dto;
    }

    private IncidentTicket mapToEntity(IncidentTicketDto dto) {
        IncidentTicket entity = new IncidentTicket();
        entity.setId(dto.getId());
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setStatus(dto.getStatus());
        entity.setCreatedBy(dto.getCreatedBy());
        entity.setCreatedAt(dto.getCreatedAt());
        entity.setUpdatedAt(dto.getUpdatedAt());
        entity.setFirstResponseAt(dto.getFirstResponseAt());
        entity.setResolvedAt(dto.getResolvedAt());
        return entity;
    }

    public IncidentTicketDto markFirstResponseIfNeeded(String ticketId) {
        IncidentTicket ticket = repository.findById(ticketId)
            .orElseThrow(() -> new NotFoundException("Incident ticket not found with id " + ticketId));
        if (ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(LocalDateTime.now());
            ticket.setUpdatedAt(LocalDateTime.now());
            ticket = repository.save(ticket);
        }
        return mapToDto(ticket);
    }

    private static void updateSlaFields(IncidentTicket ticket, String previousStatus, String nextStatus) {
        if (ticket.getFirstResponseAt() == null && "IN_PROGRESS".equals(nextStatus)) {
            ticket.setFirstResponseAt(LocalDateTime.now());
        }
        if ("RESOLVED".equals(nextStatus) || "CLOSED".equals(nextStatus)) {
            if (ticket.getResolvedAt() == null) {
                ticket.setResolvedAt(LocalDateTime.now());
            }
        } else if (("RESOLVED".equals(previousStatus) || "CLOSED".equals(previousStatus)) && !"CLOSED".equals(nextStatus)) {
            ticket.setResolvedAt(null);
        }
    }
}
