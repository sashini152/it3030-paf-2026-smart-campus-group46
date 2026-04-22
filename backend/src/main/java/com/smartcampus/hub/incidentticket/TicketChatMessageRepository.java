package com.smartcampus.hub.incidentticket;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketChatMessageRepository extends MongoRepository<TicketChatMessage, String> {

    List<TicketChatMessage> findByTicketIdOrderByCreatedAtAsc(String ticketId);
}
