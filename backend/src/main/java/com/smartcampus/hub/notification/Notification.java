package com.smartcampus.hub.notification;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

	@Id
	private String id;

	private String email;
	private String message;
	private NotificationType type;
	private boolean read;
	private Instant createdAt;
}
