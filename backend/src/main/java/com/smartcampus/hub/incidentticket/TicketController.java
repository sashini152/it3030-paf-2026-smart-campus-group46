package com.smartcampus.hub.incidentticket;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.hub.incidentticket.dto.CommentDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

	private static final long LIST_TIMEOUT_SECONDS = 2;

	private final TicketService ticketService;
	private final CommentService commentService;

	public TicketController(TicketService ticketService, CommentService commentService) {
		this.ticketService = ticketService;
		this.commentService = commentService;
	}

	@PostMapping
	public ResponseEntity<Ticket> create(@Valid @RequestBody Ticket ticket) {
		Ticket saved = ticketService.create(ticket);
		return ResponseEntity.created(URI.create("/api/tickets/" + saved.getId())).body(saved);
	}

	@GetMapping
	public List<Ticket> getAll() {
		return CompletableFuture
				.supplyAsync(ticketService::findAll)
				.completeOnTimeout(List.<Ticket>of(), LIST_TIMEOUT_SECONDS, TimeUnit.SECONDS)
				.exceptionally(error -> List.<Ticket>of())
				.join();
	}

	@GetMapping("/{id}")
	public Ticket getById(@PathVariable String id) {
		return ticketService.findById(id);
	}

	@PutMapping("/{id}")
	public Ticket update(@PathVariable String id, @Valid @RequestBody Ticket ticket) {
		return ticketService.update(id, ticket);
	}

	@PatchMapping("/{id}/status")
	public Ticket updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
		return ticketService.updateStatus(id, body.get("status"));
	}

	@GetMapping("/{ticketId}/comments")
	public List<CommentDto> getComments(@PathVariable String ticketId) {
		return commentService.findByTicketId(ticketId);
	}

	@PostMapping("/{ticketId}/comments")
	@ResponseStatus(HttpStatus.CREATED)
	public CommentDto createComment(@PathVariable String ticketId, @Valid @RequestBody CreateCommentRequest body) {
		CommentDto dto = new CommentDto();
		dto.setTicketId(ticketId);
		dto.setContent(body.getContent());
		dto.setCreatedBy(body.getAuthor());
		CommentDto created = commentService.create(dto);
		if (isSupportAuthor(body.getAuthor())) {
			ticketService.markFirstResponseIfNeeded(ticketId);
		}
		return created;
	}

	@DeleteMapping("/{ticketId}/comments/{commentId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteComment(@PathVariable String ticketId, @PathVariable String commentId) {
		commentService.delete(commentId);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable String id) {
		ticketService.delete(id);
	}

	private static boolean isSupportAuthor(String author) {
		if (author == null) {
			return false;
		}
		String value = author.trim().toLowerCase();
		return value.contains("admin") || value.contains("support");
	}
}
