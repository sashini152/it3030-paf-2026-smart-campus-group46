package com.smartcampus.hub.incidentticket;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.hub.incidentticket.dto.CommentDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/incident-tickets/{ticketId}/comments")
public class IncidentTicketCommentController {

	private final CommentService commentService;
	private final IncidentTicketService incidentTicketService;

	public IncidentTicketCommentController(CommentService commentService, IncidentTicketService incidentTicketService) {
		this.commentService = commentService;
		this.incidentTicketService = incidentTicketService;
	}

	@GetMapping
	public List<CommentDto> getComments(@PathVariable String ticketId) {
		return commentService.findByTicketId(ticketId);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public CommentDto createComment(@PathVariable String ticketId, @Valid @RequestBody CreateCommentRequest body) {
		CommentDto dto = new CommentDto();
		dto.setTicketId(ticketId);
		dto.setContent(body.getContent());
		dto.setCreatedBy(body.getAuthor());
		CommentDto created = commentService.create(dto);
		if (isSupportAuthor(body.getAuthor())) {
			incidentTicketService.markFirstResponseIfNeeded(ticketId);
		}
		return created;
	}

	@DeleteMapping("/{commentId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteComment(@PathVariable String ticketId, @PathVariable String commentId) {
		commentService.delete(commentId);
	}

	private static boolean isSupportAuthor(String author) {
		if (author == null) return false;
		String value = author.trim().toLowerCase();
		return value.contains("admin") || value.contains("support");
	}
}
