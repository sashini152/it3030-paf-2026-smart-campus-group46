package com.smartcampus.incidentticket.repository;

import com.smartcampus.incidentticket.model.IncidentTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IncidentTicketRepository extends MongoRepository<IncidentTicket, String> {
}
