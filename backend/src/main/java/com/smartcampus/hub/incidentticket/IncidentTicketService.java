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
        entity.setCreatedAt(LocalDateTime.now());
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
        return entity;
    }
}
