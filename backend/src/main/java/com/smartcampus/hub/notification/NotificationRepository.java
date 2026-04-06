package com.smartcampus.hub.notification;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByEmailOrderByCreatedAtDesc(String email);

    List<Notification> findByEmailAndReadFalseOrderByCreatedAtDesc(String email);
}