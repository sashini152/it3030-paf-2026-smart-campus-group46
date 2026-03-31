package com.smartcampus.hub.incidentticket;

import com.smartcampus.hub.common.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository repository;

    public Ticket create(Ticket ticket) {
        ticket.setCreatedAt(LocalDateTime.now());
        return repository.save(ticket);
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

        existing.setTitle(ticket.getTitle());
        existing.setDescription(ticket.getDescription());
        existing.setStatus(ticket.getStatus());
        existing.setCreatedBy(ticket.getCreatedBy());

        return repository.save(existing);
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Ticket not found with id " + id);
        }
        repository.deleteById(id);
    }
}
