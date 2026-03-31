package com.smartcampus.incidentticket.service;

import com.smartcampus.incidentticket.dto.CommentDto;
import com.smartcampus.incidentticket.exception.InvalidWorkflowTransitionException;
import com.smartcampus.incidentticket.exception.ResourceNotFoundException;
import com.smartcampus.incidentticket.model.Comment;
import com.smartcampus.incidentticket.model.Ticket;
import com.smartcampus.incidentticket.repository.CommentRepository;
import com.smartcampus.incidentticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;

    private static final int MAX_IMAGE_URLS = 3;
    private static final Map<Ticket.Status, Ticket.Status> statusTransitionMap = new EnumMap<>(Ticket.Status.class);

    static {
        statusTransitionMap.put(Ticket.Status.OPEN, Ticket.Status.IN_PROGRESS);
        statusTransitionMap.put(Ticket.Status.IN_PROGRESS, Ticket.Status.RESOLVED);
        statusTransitionMap.put(Ticket.Status.RESOLVED, Ticket.Status.CLOSED);
    }

    public Ticket createTicket(Ticket ticket) {
        if (ticket == null) {
            throw new IllegalArgumentException("Ticket cannot be null");
        }

        if (ticket.getStatus() == null) {
            ticket.setStatus(Ticket.Status.OPEN);
        }

        if (!Ticket.Status.OPEN.equals(ticket.getStatus())) {
            throw new IllegalArgumentException("New ticket status must be OPEN");
        }

        enforceImageUrlsLimit(ticket.getImageUrls());

        LocalDateTime now = LocalDateTime.now();
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);

        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicket(String id) {
        return getTicketById(id);
    }

    public Ticket updateTicket(String id, Ticket updateData) {
        Ticket existing = getTicketById(id);

        if (updateData.getTitle() != null) existing.setTitle(updateData.getTitle());
        if (updateData.getDescription() != null) existing.setDescription(updateData.getDescription());
        if (updateData.getCategory() != null) existing.setCategory(updateData.getCategory());
        if (updateData.getPriority() != null) existing.setPriority(updateData.getPriority());
        if (updateData.getResourceId() != null) existing.setResourceId(updateData.getResourceId());
        if (updateData.getCreatedBy() != null) existing.setCreatedBy(updateData.getCreatedBy());
        if (updateData.getAssignedTo() != null) existing.setAssignedTo(updateData.getAssignedTo());
        if (updateData.getImageUrls() != null) {
            enforceImageUrlsLimit(updateData.getImageUrls());
            existing.setImageUrls(updateData.getImageUrls());
        }

        existing.setUpdatedAt(LocalDateTime.now());

        return ticketRepository.save(existing);
    }

    public void deleteTicket(String id) {
        if (!ticketRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ticket not found with id " + id);
        }

        commentRepository.deleteByTicketId(id);
        ticketRepository.deleteById(id);
    }

    public List<CommentDto> getComments(String id) {
        getTicketById(id);
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(id)
                .stream()
                .map(this::mapCommentToDto)
                .toList();
    }

    public CommentDto addComment(String id, String author, String content) {
        Ticket ticket = getTicketById(id);

        if (author == null || author.trim().isEmpty()) {
            throw new IllegalArgumentException("Author cannot be null or empty");
        }

        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Content cannot be null or empty");
        }

        Comment comment = Comment.builder()
                .ticketId(ticket.getId())
                .userId(author.trim())
                .content(content.trim())
                .createdAt(LocalDateTime.now())
                .build();

        return mapCommentToDto(commentRepository.save(comment));
    }

    public void deleteComment(String id, String commentId) {
        getTicketById(id);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id " + commentId));

        if (!id.equals(comment.getTicketId())) {
            throw new IllegalArgumentException("Comment does not belong to this ticket");
        }

        commentRepository.deleteById(commentId);
    }

    public Ticket assignTechnician(String id, String technicianId) {
        Ticket existing = getTicketById(id);
        existing.setAssignedTo(technicianId);
        existing.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(existing);
    }

    public Ticket updateStatus(String id, Ticket.Status newStatus) {
        Ticket existing = getTicketById(id);

        if (newStatus == null) {
            throw new IllegalArgumentException("New status cannot be null");
        }

        Ticket.Status currentStatus = existing.getStatus();
        if (!isValidTransition(currentStatus, newStatus)) {
            throw new InvalidWorkflowTransitionException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        existing.setStatus(newStatus);
        existing.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(existing);
    }

    private Ticket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id " + id));
    }

    private void enforceImageUrlsLimit(List<String> imageUrls) {
        if (imageUrls != null && imageUrls.size() > MAX_IMAGE_URLS) {
            throw new IllegalArgumentException("imageUrls list size must be at most " + MAX_IMAGE_URLS);
        }
    }

    private boolean isValidTransition(Ticket.Status from, Ticket.Status to) {
        if (from == null || to == null) {
            return false;
        }

        if (from == to) {
            return true;
        }

        Ticket.Status expected = statusTransitionMap.get(from);
        return expected == to;
    }

    private CommentDto mapCommentToDto(Comment comment) {
        CommentDto dto = new CommentDto();
        dto.setId(comment.getId());
        dto.setTicketId(comment.getTicketId());
        dto.setAuthor(comment.getUserId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        return dto;
    }
}
