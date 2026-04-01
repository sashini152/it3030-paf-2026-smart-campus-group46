package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {

    List<Comment> findByTicketId(String ticketId);

    List<Comment> findByTicketIdOrderByCreatedAtAsc(String ticketId);

    void deleteByTicketId(String ticketId);
}

