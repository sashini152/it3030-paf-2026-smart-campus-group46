package com.smartcampus.hub.notification;

import org.springframework.data.mongodb.repository.MongoRepository;

<<<<<<< HEAD
public interface NotificationRepository extends MongoRepository<Notification, String> {
}

=======
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByEmailOrderByCreatedAtDesc(String email);

    List<Notification> findByEmailAndReadFalseOrderByCreatedAtDesc(String email);
}
>>>>>>> 4b40911d003429830a1ef19786124d62873a6777
