

package com.smartcampus.hub.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    private String name;
    private String type; // LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
    private String description;
    private int capacity;
    private String location;
    private String availabilityWindows;
    private String status; // ACTIVE, OUT_OF_SERVICE
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;

    public Resource() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "ACTIVE";
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        this.updatedAt = LocalDateTime.now();
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
        this.updatedAt = LocalDateTime.now();
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
        this.updatedAt = LocalDateTime.now();
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
        this.updatedAt = LocalDateTime.now();
    }

    public String getAvailabilityWindows() {
        return availabilityWindows;
    }

    public void setAvailabilityWindows(String availabilityWindows) {
        this.availabilityWindows = availabilityWindows;
        this.updatedAt = LocalDateTime.now();
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
        this.updatedAt = LocalDateTime.now();
    }
}

// package com.smartcampus.hub.model;

// import org.springframework.data.annotation.Id;
// import org.springframework.data.mongodb.core.mapping.Document;
// import java.time.LocalDateTime;

// // @Document(collection = "resources")
// public class Resource {
    
//     @Id
//     private String id;
    
//     private String name;
//     private String type; // LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
//     private String description;
//     private int capacity;
//     private String location;
//     private String status; // ACTIVE, OUT_OF_SERVICE, MAINTENANCE
//     private LocalDateTime createdAt;
//     private LocalDateTime updatedAt;
//     private String createdBy; // Email of admin who created it
    
//     public Resource() {
//         this.createdAt = LocalDateTime.now();
//         this.updatedAt = LocalDateTime.now();
//         this.status = "ACTIVE";
//     }
    
//     // Getters and Setters
//     public String getId() {
//         return id;
//     }
    
//     public void setId(String id) {
//         this.id = id;
//     }
    
//     public String getName() {
//         return name;
//     }
    
//     public void setName(String name) {
//         this.name = name;
//         this.updatedAt = LocalDateTime.now();
//     }
    
//     public String getType() {
//         return type;
//     }
    
//     public void setType(String type) {
//         this.type = type;
//         this.updatedAt = LocalDateTime.now();
//     }
    
//     public String getDescription() {
//         return description;
//     }
    
//     public void setDescription(String description) {
//         this.description = description;
//         this.updatedAt = LocalDateTime.now();
//     }
    
//     public int getCapacity() {
//         return capacity;
//     }
    
//     public void setCapacity(int capacity) {
//         this.capacity = capacity;
//         this.updatedAt = LocalDateTime.now();
//     }
    
//     public String getLocation() {
//         return location;
//     }
    
//     public void setLocation(String location) {
//         this.location = location;
//         this.updatedAt = LocalDateTime.now();
//     }
    
//     public String getStatus() {
//         return status;
//     }
    
//     public void setStatus(String status) {
//         this.status = status;
//         this.updatedAt = LocalDateTime.now();
//     }
    
//     public LocalDateTime getCreatedAt() {
//         return createdAt;
//     }
    
//     public void setCreatedAt(LocalDateTime createdAt) {
//         this.createdAt = createdAt;
//     }
    
//     public LocalDateTime getUpdatedAt() {
//         return updatedAt;
//     }
    
//     public void setUpdatedAt(LocalDateTime updatedAt) {
//         this.updatedAt = updatedAt;
//     }
    
//     public String getCreatedBy() {
//         return createdBy;
//     }
    
//     public void setCreatedBy(String createdBy) {
//         this.createdBy = createdBy;
//         this.updatedAt = LocalDateTime.now();
//     }
// }
