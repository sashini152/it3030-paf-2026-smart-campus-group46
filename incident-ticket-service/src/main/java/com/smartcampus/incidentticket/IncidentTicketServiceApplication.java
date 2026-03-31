package com.smartcampus.incidentticket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class IncidentTicketServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(IncidentTicketServiceApplication.class, args);
    }
}
