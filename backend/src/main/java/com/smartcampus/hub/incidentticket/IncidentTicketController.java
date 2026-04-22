package com.smartcampus.hub.incidentticket;

import java.net.URI;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.hub.incidentticket.dto.IncidentTicketDto;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/incident-tickets")
@RequiredArgsConstructor
public class IncidentTicketController {

	private static final long LIST_TIMEOUT_SECONDS = 2;

	private final IncidentTicketService service;

	@PostMapping
	public ResponseEntity<IncidentTicketDto> create(@Valid @RequestBody IncidentTicketDto dto) {
		IncidentTicketDto saved = service.create(dto);
		return ResponseEntity.created(URI.create("/api/incident-tickets/" + saved.getId())).body(saved);
	}

	@GetMapping
	public ResponseEntity<List<IncidentTicketDto>> getAll() {
		List<IncidentTicketDto> items = CompletableFuture
				.supplyAsync(service::findAll)
				.completeOnTimeout(List.<IncidentTicketDto>of(), LIST_TIMEOUT_SECONDS, TimeUnit.SECONDS)
				.exceptionally(error -> List.<IncidentTicketDto>of())
				.join();
		return ResponseEntity.ok(items);
	}

	@GetMapping("/{id}")
	public ResponseEntity<IncidentTicketDto> getById(@PathVariable String id) {
		return ResponseEntity.ok(service.findById(id));
	}

	@PutMapping("/{id}")
	public ResponseEntity<IncidentTicketDto> update(@PathVariable String id, @Valid @RequestBody IncidentTicketDto dto) {
		return ResponseEntity.ok(service.update(id, dto));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable String id) {
		service.delete(id);
		return ResponseEntity.noContent().build();
	}
}
