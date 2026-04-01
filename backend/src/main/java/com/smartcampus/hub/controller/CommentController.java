package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.CommentDto;
import com.smartcampus.hub.dto.CreateCommentRequest;
import com.smartcampus.hub.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incident-tickets/{ticketId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable String ticketId) {
        return ResponseEntity.ok(commentService.getCommentsByTicketId(ticketId));
    }

    @PostMapping
    public ResponseEntity<CommentDto> createComment(
            @PathVariable String ticketId,
            @Valid @RequestBody CreateCommentRequest request
    ) {
        CommentDto created = commentService.createComment(ticketId, request.getAuthor(), request.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId
    ) {
        commentService.deleteComment(ticketId, commentId);
        return ResponseEntity.noContent().build();
    }
}

