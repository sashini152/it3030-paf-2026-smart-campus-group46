package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.CommentDto;
import com.smartcampus.hub.dto.CreateCommentRequest;
import com.smartcampus.hub.model.Ticket;
import com.smartcampus.hub.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/tickets", "/api/tickets"})
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@Valid @RequestBody Ticket ticket) {
        Ticket created = ticketService.createTicket(ticket);
        return ResponseEntity.created(URI.create("/api/tickets/" + created.getId())).body(created);
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicket(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicket(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable String id, @Valid @RequestBody Ticket ticket) {
        return ResponseEntity.ok(ticketService.updateTicket(id, ticket));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Ticket> updateStatus(@PathVariable String id, @RequestBody Map<String, String> request) {
        String rawStatus = request.get("status");
        Ticket.Status status = Ticket.Status.valueOf(rawStatus);
        return ResponseEntity.ok(ticketService.updateStatus(id, status));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTechnician(@PathVariable String id, @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, request.get("technicianId")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getComments(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDto> addComment(@PathVariable String id, @Valid @RequestBody CreateCommentRequest request) {
        CommentDto created = ticketService.addComment(id, request.getAuthor(), request.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable String id, @PathVariable String commentId) {
        ticketService.deleteComment(id, commentId);
        return ResponseEntity.noContent().build();
    }
}

