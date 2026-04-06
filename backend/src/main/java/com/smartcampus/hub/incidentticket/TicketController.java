package com.smartcampus.hub.incidentticket;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.smartcampus.hub.incidentticket.dto.CommentDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

	private static final long LIST_TIMEOUT_SECONDS = 2;

	private final TicketService ticketService;
	private final CommentService commentService;
	private final FileUploadService fileUploadService;

	public TicketController(TicketService ticketService, CommentService commentService, FileUploadService fileUploadService) {
		this.ticketService = ticketService;
		this.commentService = commentService;
		this.fileUploadService = fileUploadService;
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
	public Ticket updateStatus(@PathVariable String id, @Valid @RequestBody UpdateTicketStatusRequest body) {
		return ticketService.updateStatus(id, body.getStatus(), body.getRejectionReason());
	}

	@PatchMapping("/{id}/assign")
	public Ticket assignTechnician(@PathVariable String id, @RequestBody UpdateTicketAssignmentRequest body) {
		return ticketService.assignTechnician(id, body.getAssignedTechnician());
	}

	@PatchMapping("/{id}/resolution-notes")
	public Ticket updateResolutionNotes(@PathVariable String id, @RequestBody UpdateTicketResolutionNotesRequest body) {
		return ticketService.updateResolutionNotes(id, body.getResolutionNotes());
	}

	@PostMapping(path = "/{ticketId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public Map<String, Object> uploadImages(@PathVariable String ticketId, @RequestParam("files") List<MultipartFile> files) {
		List<String> imageUrls = fileUploadService.uploadTicketImages(ticketId, files);
		Map<String, Object> response = new LinkedHashMap<>();
		response.put("ticketId", ticketId);
		response.put("imageUrls", imageUrls);
		return response;
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
		dto.setCreatedByName(body.getAuthorName());
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
