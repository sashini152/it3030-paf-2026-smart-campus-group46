package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.IncidentTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IncidentTicketRepository extends MongoRepository<IncidentTicket, String> {
}

