package com.smartcampus.hub.incidentticket;

import com.smartcampus.hub.common.NotFoundException;
import com.smartcampus.hub.notification.NotificationService;
import com.smartcampus.hub.notification.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository repository;
    private final NotificationService notificationService;

    public Ticket create(Ticket ticket) {
        LocalDateTime now = LocalDateTime.now();
        if (ticket.getId() == null || ticket.getId().isBlank()) {
            ticket.setId(nextTicketId(ticket.getCreatedBy()));
        }
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);
        if (ticket.getStatus() == null || ticket.getStatus().isBlank()) {
            ticket.setStatus("OPEN");
        }
        ticket.setAssignedTechnician(normalizeAssignedTechnician(ticket.getAssignedTechnician()));
        ticket.setResolutionNotes(normalizeResolutionNotes(ticket.getResolutionNotes()));
        ticket.setRejectionReason(normalizeRejectionReason(ticket.getStatus(), ticket.getRejectionReason()));
        Ticket saved = repository.save(ticket);
        publishNotificationSafely(
            "New support ticket submitted",
            "Ticket \"" + saved.getTitle() + "\" is now OPEN.",
            saved.getCreatedBy(),
            saved.getId()
        );
        return saved;
    }

    public List<Ticket> findAll() {
        return repository.findAll();
    }

    public Ticket findById(String id) {
        return repository.findById(id)
            .orElseThrow(() -> new NotFoundException("Ticket not found with id " + id));
    }

    public Ticket update(String id, Ticket ticket) {
        Ticket existing = repository.findById(id)
            .orElseThrow(() -> new NotFoundException("Ticket not found with id " + id));

        String previousStatus = existing.getStatus();
        existing.setTitle(ticket.getTitle());
        existing.setDescription(ticket.getDescription());
        existing.setStatus(ticket.getStatus());
        existing.setCreatedBy(ticket.getCreatedBy());
        existing.setCreatedByName(ticket.getCreatedByName());
        existing.setUserEmail(ticket.getUserEmail());
        existing.setResource(ticket.getResource());
        existing.setCategory(ticket.getCategory());
        existing.setPriority(ticket.getPriority());
        existing.setAssignedTechnician(normalizeAssignedTechnician(ticket.getAssignedTechnician()));
        existing.setResolutionNotes(normalizeResolutionNotes(ticket.getResolutionNotes()));
        existing.setRejectionReason(normalizeRejectionReason(ticket.getStatus(), ticket.getRejectionReason()));
        existing.setImageUrls(ticket.getImageUrls());
        existing.setUpdatedAt(LocalDateTime.now());
        validateStatusTransition(previousStatus, ticket.getStatus(), existing.getRejectionReason());
        updateSlaFields(existing, previousStatus, ticket.getStatus());

        Ticket saved = repository.save(existing);
        if (saved.getStatus() != null && !saved.getStatus().equals(previousStatus)) {
            publishNotificationSafely(
                "Ticket status updated",
                "Ticket \"" + saved.getTitle() + "\" moved to " + saved.getStatus() + ".",
                saved.getCreatedBy(),
                saved.getId()
            );
        }
        return saved;
    }

    public Ticket assignTechnician(String id, String assignedTechnician) {
        Ticket existing = findById(id);
        existing.setAssignedTechnician(normalizeAssignedTechnician(assignedTechnician));
        existing.setUpdatedAt(LocalDateTime.now());
        Ticket saved = repository.save(existing);
        publishNotificationSafely(
            "Ticket assignment updated",
            saved.getAssignedTechnician() == null
                ? "Ticket \"" + saved.getTitle() + "\" is now unassigned."
                : "Ticket \"" + saved.getTitle() + "\" is assigned to " + saved.getAssignedTechnician() + ".",
            saved.getCreatedBy(),
            saved.getId()
        );
        return saved;
    }

    public Ticket updateResolutionNotes(String id, String resolutionNotes) {
        Ticket existing = findById(id);
        existing.setResolutionNotes(normalizeResolutionNotes(resolutionNotes));
        existing.setUpdatedAt(LocalDateTime.now());
        return repository.save(existing);
    }

    public Ticket updateStatus(String id, String status, String rejectionReason) {
        Ticket existing = findById(id);
        String previousStatus = existing.getStatus();
        existing.setStatus(status);
        existing.setRejectionReason(normalizeRejectionReason(status, rejectionReason));
        existing.setUpdatedAt(LocalDateTime.now());
        validateStatusTransition(previousStatus, status, existing.getRejectionReason());
        updateSlaFields(existing, previousStatus, status);
        Ticket saved = repository.save(existing);
        if (saved.getStatus() != null && !saved.getStatus().equals(previousStatus)) {
            publishNotificationSafely(
                "Ticket status updated",
                "Ticket \"" + saved.getTitle() + "\" moved to " + saved.getStatus() + ".",
                saved.getCreatedBy(),
                saved.getId()
            );
        }
        return saved;
    }

    public Ticket markFirstResponseIfNeeded(String ticketId) {
        Ticket ticket = findById(ticketId);
        if (ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(LocalDateTime.now());
            ticket.setUpdatedAt(LocalDateTime.now());
            ticket = repository.save(ticket);
        }
        return ticket;
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Ticket not found with id " + id);
        }
        repository.deleteById(id);
    }

    private static void updateSlaFields(Ticket ticket, String previousStatus, String nextStatus) {
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

    private static String normalizeAssignedTechnician(String assignedTechnician) {
        if (assignedTechnician == null || assignedTechnician.isBlank()) {
            return null;
        }
        return assignedTechnician.trim();
    }

    private static String normalizeResolutionNotes(String resolutionNotes) {
        if (resolutionNotes == null || resolutionNotes.isBlank()) {
            return null;
        }
        return resolutionNotes.trim();
    }

    private static void validateStatusTransition(String previousStatus, String nextStatus, String rejectionReason) {
        if (nextStatus == null || nextStatus.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        String current = normalizeWorkflowStatus(previousStatus);
        String target = normalizeWorkflowStatus(nextStatus);
        if (current.equals(target)) {
            return;
        }
        boolean allowed = switch (current) {
            case "OPEN" -> "IN_PROGRESS".equals(target) || "REJECTED".equals(target);
            case "IN_PROGRESS" -> "RESOLVED".equals(target) || "REJECTED".equals(target);
            case "RESOLVED" -> "CLOSED".equals(target);
            case "CLOSED", "REJECTED" -> false;
            default -> false;
        };
        if (!allowed) {
            throw new IllegalArgumentException("Invalid ticket status transition");
        }
        if ("REJECTED".equals(target) && (rejectionReason == null || rejectionReason.isBlank())) {
            throw new IllegalArgumentException("Rejection reason is required when status is REJECTED");
        }
    }

    private static String normalizeWorkflowStatus(String status) {
        if (status == null || status.isBlank()) {
            return "OPEN";
        }
        return switch (status) {
            case "WAITING_FOR_CLIENT", "WAITING_FOR_SUPPORT" -> "IN_PROGRESS";
            default -> status;
        };
    }

    private String nextTicketId(String createdBy) {
        String studentId = sanitizeStudentId(createdBy);
        long nextSequence = repository.countByCreatedBy(createdBy) + 1;
        String candidate = studentId + "_TID" + String.format("%02d", nextSequence);

        while (repository.existsById(candidate)) {
            nextSequence += 1;
            candidate = studentId + "_TID" + String.format("%02d", nextSequence);
        }

        return candidate;
    }

    private static String sanitizeStudentId(String createdBy) {
        String normalized = createdBy == null ? "" : createdBy.replaceAll("[^A-Za-z0-9_]", "").toUpperCase();
        return normalized.isBlank() ? "STUDENT" : normalized;
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
            // Status updates should not fail just because notification persistence fails.
        }
    }
}
