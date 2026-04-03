package com.smartcampus.hub.incidentticket;

import com.smartcampus.hub.incidentticket.dto.CommentDto;
import com.smartcampus.hub.common.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository repository;

    public CommentDto create(CommentDto dto) {
        Comment entity = mapToEntity(dto);
        entity.setCreatedAt(LocalDateTime.now());
        Comment saved = repository.save(entity);
        return mapToDto(saved);
    }

    public List<CommentDto> findAll() {
        return repository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public CommentDto findById(String id) {
        return repository.findById(id).map(this::mapToDto)
            .orElseThrow(() -> new NotFoundException("Comment not found with id " + id));
    }

    public List<CommentDto> findByTicketId(String ticketId) {
        return repository.findAll().stream()
            .filter(comment -> ticketId.equals(comment.getTicketId()))
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    public CommentDto update(String id, CommentDto dto) {
        Comment existing = repository.findById(id)
            .orElseThrow(() -> new NotFoundException("Comment not found with id " + id));

        existing.setContent(dto.getContent());
        existing.setTicketId(dto.getTicketId());
        existing.setCreatedBy(dto.getCreatedBy());
        existing.setCreatedByName(dto.getCreatedByName());

        return mapToDto(repository.save(existing));
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Comment not found with id " + id);
        }
        repository.deleteById(id);
    }

    private CommentDto mapToDto(Comment entity) {
        CommentDto dto = new CommentDto();
        dto.setId(entity.getId());
        dto.setContent(entity.getContent());
        dto.setTicketId(entity.getTicketId());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedByName(entity.getCreatedByName());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    private Comment mapToEntity(CommentDto dto) {
        Comment entity = new Comment();
        entity.setId(dto.getId());
        entity.setContent(dto.getContent());
        entity.setTicketId(dto.getTicketId());
        entity.setCreatedBy(dto.getCreatedBy());
        entity.setCreatedByName(dto.getCreatedByName());
        entity.setCreatedAt(dto.getCreatedAt());
        return entity;
    }
}
