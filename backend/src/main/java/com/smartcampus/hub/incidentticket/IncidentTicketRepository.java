package com.smartcampus.hub.incidentticket;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IncidentTicketRepository extends MongoRepository<IncidentTicket, String> {
}
