package com.smartcampus.incidentticket.service;

import com.smartcampus.incidentticket.dto.CommentDto;
import com.smartcampus.incidentticket.exception.ResourceNotFoundException;
import com.smartcampus.incidentticket.model.Comment;
import com.smartcampus.incidentticket.repository.CommentRepository;
import com.smartcampus.incidentticket.repository.IncidentTicketRepository;
import com.smartcampus.incidentticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final IncidentTicketRepository incidentTicketRepository;
    private final TicketRepository ticketRepository;

    public CommentDto createComment(String ticketId, String author, String content) {
        if (ticketId == null || ticketId.trim().isEmpty()) {
            throw new IllegalArgumentException("Ticket ID cannot be null or empty");
        }
        if (author == null || author.trim().isEmpty()) {
            throw new IllegalArgumentException("Author cannot be null or empty");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Content cannot be null or empty");
        }

        ensureTicketExists(ticketId);

        Comment comment = Comment.builder()
                .ticketId(ticketId)
                .userId(author.trim())
                .content(content.trim())
                .createdAt(LocalDateTime.now())
                .build();

        return mapToDto(commentRepository.save(comment));
    }

    public List<CommentDto> getCommentsByTicketId(String ticketId) {
        if (ticketId == null || ticketId.trim().isEmpty()) {
            throw new IllegalArgumentException("Ticket ID cannot be null or empty");
        }
        ensureTicketExists(ticketId);
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    public CommentDto updateComment(String commentId, String author, String newContent) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id " + commentId));

        if (!comment.getUserId().equals(author)) {
            throw new IllegalArgumentException("Only the comment creator can update the comment");
        }

        if (newContent == null || newContent.trim().isEmpty()) {
            throw new IllegalArgumentException("Content cannot be null or empty");
        }

        comment.setContent(newContent.trim());
        return mapToDto(commentRepository.save(comment));
    }

    public void deleteComment(String ticketId, String commentId) {
        ensureTicketExists(ticketId);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id " + commentId));

        if (!comment.getTicketId().equals(ticketId)) {
            throw new IllegalArgumentException("Comment does not belong to this ticket");
        }

        commentRepository.deleteById(commentId);
    }

    private void ensureTicketExists(String ticketId) {
        boolean existsInIncidentTickets = incidentTicketRepository.existsById(ticketId);
        boolean existsInTickets = ticketRepository.existsById(ticketId);
        if (!existsInIncidentTickets && !existsInTickets) {
            throw new ResourceNotFoundException("Ticket not found with id " + ticketId);
        }
    }

    private CommentDto mapToDto(Comment comment) {
        CommentDto dto = new CommentDto();
        dto.setId(comment.getId());
        dto.setTicketId(comment.getTicketId());
        dto.setAuthor(comment.getUserId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        return dto;
    }
}
