package com.smartcampus.incidentticket.service;

import com.smartcampus.incidentticket.dto.IncidentTicketDto;
import com.smartcampus.incidentticket.exception.ResourceNotFoundException;
import com.smartcampus.incidentticket.model.IncidentTicket;
import com.smartcampus.incidentticket.repository.IncidentTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentTicketService {

    private final IncidentTicketRepository repository;

    public IncidentTicketDto create(IncidentTicketDto dto) {
        IncidentTicket entity = mapToEntity(dto);
        entity.setCreatedAt(LocalDateTime.now());
        IncidentTicket saved = repository.save(entity);
        return mapToDto(saved);
    }

    public List<IncidentTicketDto> findAll() {
        return repository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public IncidentTicketDto findById(String id) {
        return repository.findById(id).map(this::mapToDto)
            .orElseThrow(() -> new ResourceNotFoundException("Incident ticket not found with id " + id));
    }

    public IncidentTicketDto update(String id, IncidentTicketDto dto) {
        IncidentTicket existing = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Incident ticket not found with id " + id));

        existing.setTitle(dto.getTitle());
        existing.setDescription(dto.getDescription());
        existing.setStatus(dto.getStatus());
        existing.setCreatedBy(dto.getCreatedBy());

        return mapToDto(repository.save(existing));
    }

    public IncidentTicketDto updateStatus(String id, String newStatus) {
        IncidentTicket existing = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Incident ticket not found with id " + id));

        String oldStatus = existing.getStatus();
        existing.setStatus(newStatus);

        LocalDateTime now = LocalDateTime.now();

        // Track first response when moving to IN_PROGRESS
        if ("OPEN".equals(oldStatus) && "IN_PROGRESS".equals(newStatus)) {
            existing.setFirstResponseAt(now);
        }

        // Track resolution when moving to RESOLVED or CLOSED
        if (("IN_PROGRESS".equals(oldStatus) || "OPEN".equals(oldStatus)) && 
            ("RESOLVED".equals(newStatus) || "CLOSED".equals(newStatus))) {
            existing.setResolvedAt(now);
        }

        return mapToDto(repository.save(existing));
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Incident ticket not found with id " + id);
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
        return entity;
    }
}
