package com.smartcampus.incidentticket.controller;

import com.smartcampus.incidentticket.dto.IncidentTicketDto;
import com.smartcampus.incidentticket.service.IncidentTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incident-tickets")
@RequiredArgsConstructor
public class IncidentTicketController {

    private final IncidentTicketService service;

    @PostMapping
    public ResponseEntity<IncidentTicketDto> create(@Valid @RequestBody IncidentTicketDto dto) {
        IncidentTicketDto saved = service.create(dto);
        return ResponseEntity.created(URI.create("/api/incident-tickets/" + saved.getId())).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<IncidentTicketDto>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentTicketDto> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncidentTicketDto> update(@PathVariable String id, @Valid @RequestBody IncidentTicketDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<IncidentTicketDto> updateStatus(@PathVariable String id, @RequestBody Map<String, String> request) {
        String newStatus = request.get("status");
        return ResponseEntity.ok(service.updateStatus(id, newStatus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
