package com.smartcampus.incidentticket.service;

import com.smartcampus.incidentticket.exception.ResourceNotFoundException;
import com.smartcampus.incidentticket.model.Comment;
import com.smartcampus.incidentticket.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    public Comment createComment(String ticketId, String userId, String content) {
        if (ticketId == null || ticketId.trim().isEmpty()) {
            throw new IllegalArgumentException("Ticket ID cannot be null or empty");
        }
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Content cannot be null or empty");
        }

        Comment comment = Comment.builder()
                .ticketId(ticketId)
                .userId(userId)
                .content(content.trim())
                .createdAt(LocalDateTime.now())
                .build();

        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByTicketId(String ticketId) {
        if (ticketId == null || ticketId.trim().isEmpty()) {
            throw new IllegalArgumentException("Ticket ID cannot be null or empty");
        }
        return commentRepository.findByTicketId(ticketId);
    }

    public Comment updateComment(String commentId, String userId, String newContent) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id " + commentId));

        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Only the comment creator can update the comment");
        }

        if (newContent == null || newContent.trim().isEmpty()) {
            throw new IllegalArgumentException("Content cannot be null or empty");
        }

        comment.setContent(newContent.trim());
        return commentRepository.save(comment);
    }

    public void deleteComment(String commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id " + commentId));

        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Only the comment creator can delete the comment");
        }

        commentRepository.deleteById(commentId);
    }
}