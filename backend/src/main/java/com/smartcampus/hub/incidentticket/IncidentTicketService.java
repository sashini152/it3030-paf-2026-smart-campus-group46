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
        publishNotificationSafely(
            "New incident ticket submitted",
            "Ticket \"" + saved.getTitle() + "\" is now OPEN.",
            saved.getCreatedBy(),
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
        existing.setAssignedTechnician(dto.getAssignedTechnician());
        existing.setResolutionNotes(dto.getResolutionNotes());
        existing.setRejectionReason(normalizeRejectionReason(dto.getStatus(), dto.getRejectionReason()));
        existing.setUpdatedAt(LocalDateTime.now());
        validateStatusTransition(previousStatus, dto.getStatus(), existing.getRejectionReason());
        updateSlaFields(existing, previousStatus, dto.getStatus());

        IncidentTicket saved = repository.save(existing);
        if (saved.getStatus() != null && !saved.getStatus().equals(previousStatus)) {
            publishNotificationSafely(
                "Ticket status updated",
                "Ticket \"" + saved.getTitle() + "\" moved to " + saved.getStatus() + ".",
                saved.getCreatedBy(),
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
        dto.setAssignedTechnician(entity.getAssignedTechnician());
        dto.setResolutionNotes(entity.getResolutionNotes());
        dto.setRejectionReason(entity.getRejectionReason());
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
        entity.setAssignedTechnician(dto.getAssignedTechnician());
        entity.setResolutionNotes(dto.getResolutionNotes());
        entity.setRejectionReason(dto.getRejectionReason());
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

    private static String normalizeRejectionReason(String status, String rejectionReason) {
        if (!"REJECTED".equals(status)) {
            return null;
        }
        if (rejectionReason == null || rejectionReason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required when status is REJECTED");
        }
        return rejectionReason.trim();
    }

    private static void validateStatusTransition(String previousStatus, String nextStatus, String rejectionReason) {
        if (nextStatus == null || nextStatus.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        String current = previousStatus == null || previousStatus.isBlank() ? "OPEN" : previousStatus;
        if (current.equals(nextStatus)) {
            return;
        }
        boolean allowed = switch (current) {
            case "OPEN" -> "IN_PROGRESS".equals(nextStatus) || "REJECTED".equals(nextStatus);
            case "IN_PROGRESS" -> "RESOLVED".equals(nextStatus) || "REJECTED".equals(nextStatus);
            case "RESOLVED" -> "CLOSED".equals(nextStatus);
            case "WAITING_FOR_CLIENT", "WAITING_FOR_SUPPORT" -> "IN_PROGRESS".equals(nextStatus) || "REJECTED".equals(nextStatus);
            case "CLOSED", "REJECTED" -> false;
            default -> false;
        };
        if (!allowed) {
            throw new IllegalArgumentException("Invalid ticket status transition");
        }
        if ("REJECTED".equals(nextStatus) && (rejectionReason == null || rejectionReason.isBlank())) {
            throw new IllegalArgumentException("Rejection reason is required when status is REJECTED");
        }
    }

    private void publishNotificationSafely(String title, String message, String targetUserId, String referenceId) {
        try {
            notificationService.publish(
                NotificationType.TICKET,
                title,
                message,
                targetUserId,
                "TICKET",
                referenceId
            );
        } catch (RuntimeException ignored) {
            // Ticket persistence should succeed even if notification creation fails.
        }
    }
}
