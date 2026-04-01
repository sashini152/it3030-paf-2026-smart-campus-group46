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
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);
        if (ticket.getStatus() == null || ticket.getStatus().isBlank()) {
            ticket.setStatus("OPEN");
        }
        Ticket saved = repository.save(ticket);
        notificationService.publish(
            NotificationType.TICKET,
            "New support ticket submitted",
            "Ticket \"" + saved.getTitle() + "\" is now OPEN.",
            saved.getCreatedBy(),
            "TICKET",
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
        existing.setCategory(ticket.getCategory());
        existing.setPriority(ticket.getPriority());
        existing.setAssignedTechnician(ticket.getAssignedTechnician());
        existing.setImageUrls(ticket.getImageUrls());
        existing.setUpdatedAt(LocalDateTime.now());
        updateSlaFields(existing, previousStatus, ticket.getStatus());

        Ticket saved = repository.save(existing);
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
        return saved;
    }

    public Ticket updateStatus(String id, String status) {
        Ticket existing = findById(id);
        String previousStatus = existing.getStatus();
        existing.setStatus(status);
        existing.setUpdatedAt(LocalDateTime.now());
        updateSlaFields(existing, previousStatus, status);
        Ticket saved = repository.save(existing);
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
}
