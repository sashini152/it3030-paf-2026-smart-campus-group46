// package com.smartcampus.hub.resource;

// import java.time.Instant;

// import org.springframework.data.annotation.Id;
// import org.springframework.data.mongodb.core.mapping.Document;

// @Document(collection = "resources")
// public class Resource {

//     @Id
//     private String id;

//     private ResourceType type;
//     private String name;
//     private int capacity;
//     private String location;
//     private String availabilityWindows;
//     private ResourceStatus status;

//     private Instant createdAt;
//     private Instant updatedAt;

//     public Resource() {
//     }

//     public String getId() {
//         return id;
//     }

//     public void setId(String id) {
//         this.id = id;
//     }

//     public ResourceType getType() {
//         return type;
//     }

//     public void setType(ResourceType type) {
//         this.type = type;
//     }

//     public String getName() {
//         return name;
//     }

//     public void setName(String name) {
//         this.name = name;
//     }

//     public int getCapacity() {
//         return capacity;
//     }

//     public void setCapacity(int capacity) {
//         this.capacity = capacity;
//     }

//     public String getLocation() {
//         return location;
//     }

//     public void setLocation(String location) {
//         this.location = location;
//     }

//     public String getAvailabilityWindows() {
//         return availabilityWindows;
//     }

//     public void setAvailabilityWindows(String availabilityWindows) {
//         this.availabilityWindows = availabilityWindows;
//     }

//     public ResourceStatus getStatus() {
//         return status;
//     }

//     public void setStatus(ResourceStatus status) {
//         this.status = status;
//     }

//     public Instant getCreatedAt() {
//         return createdAt;
//     }

//     public void setCreatedAt(Instant createdAt) {
//         this.createdAt = createdAt;
//     }

//     public Instant getUpdatedAt() {
//         return updatedAt;
//     }

//     public void setUpdatedAt(Instant updatedAt) {
//         this.updatedAt = updatedAt;
//     }
// }


//old
// package com.smartcampus.hub.resource;

// import java.time.Instant;

// import org.springframework.data.annotation.Id;
// import org.springframework.data.mongodb.core.mapping.Document;

// @Document(collection = "resources")
// public class Resource {

// 	@Id
// 	private String id;
// 	private ResourceType type;
// 	private String name;
// 	private int capacity;
// 	private String location;
// 	private String availabilityWindows;
// 	private ResourceStatus status;
// 	private Instant createdAt;
// 	private Instant updatedAt;

// 	public String getId() {
// 		return id;
// 	}

// 	public void setId(String id) {
// 		this.id = id;
// 	}

// 	public ResourceType getType() {
// 		return type;
// 	}

// 	public void setType(ResourceType type) {
// 		this.type = type;
// 	}

// 	public String getName() {
// 		return name;
// 	}

// 	public void setName(String name) {
// 		this.name = name;
// 	}

// 	public int getCapacity() {
// 		return capacity;
// 	}

// 	public void setCapacity(int capacity) {
// 		this.capacity = capacity;
// 	}

// 	public String getLocation() {
// 		return location;
// 	}

// 	public void setLocation(String location) {
// 		this.location = location;
// 	}

// 	public String getAvailabilityWindows() {
// 		return availabilityWindows;
// 	}

// 	public void setAvailabilityWindows(String availabilityWindows) {
// 		this.availabilityWindows = availabilityWindows;
// 	}

// 	public ResourceStatus getStatus() {
// 		return status;
// 	}

// 	public void setStatus(ResourceStatus status) {
// 		this.status = status;
// 	}

// 	public Instant getCreatedAt() {
// 		return createdAt;
// 	}

// 	public void setCreatedAt(Instant createdAt) {
// 		this.createdAt = createdAt;
// 	}

// 	public Instant getUpdatedAt() {
// 		return updatedAt;
// 	}

// 	public void setUpdatedAt(Instant updatedAt) {
// 		this.updatedAt = updatedAt;
// 	}
// }
