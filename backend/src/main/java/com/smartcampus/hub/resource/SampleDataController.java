package com.smartcampus.hub.resource;

import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.resource.ResourceType;
import com.smartcampus.hub.resource.ResourceStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/sample")
@RequiredArgsConstructor
public class SampleDataController {

    private final ResourceRepository resourceRepository;

    @PostMapping("/add-resources")
    public ResponseEntity<String> addSampleResources() {
        try {
            // Clear existing data
            resourceRepository.deleteAll();

            // Add sample resources
            Resource lab = new Resource();
            lab.setName("Computer Lab 101");
            lab.setType("LAB");
            lab.setCapacity(30);
            lab.setLocation("Building A, Floor 2");
            lab.setStatus("ACTIVE");
            lab.setCreatedAt(LocalDateTime.now());
            lab.setUpdatedAt(LocalDateTime.now());

            Resource hall = new Resource();
            hall.setName("Lecture Hall A");
            hall.setType("LECTURE_HALL");
            hall.setCapacity(100);
            hall.setLocation("Building B, Floor 1");
            hall.setStatus("ACTIVE");
            hall.setCreatedAt(LocalDateTime.now());
            hall.setUpdatedAt(LocalDateTime.now());

            Resource room = new Resource();
            room.setName("Meeting Room 201");
            room.setType("MEETING_ROOM");
            room.setCapacity(20);
            room.setLocation("Building C, Floor 3");
            room.setStatus("ACTIVE");
            room.setCreatedAt(LocalDateTime.now());
            room.setUpdatedAt(LocalDateTime.now());

            resourceRepository.save(lab);
            resourceRepository.save(hall);
            resourceRepository.save(room);

            return ResponseEntity.ok("Sample data added successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error adding sample data: " + e.getMessage());
        }
    }
}
