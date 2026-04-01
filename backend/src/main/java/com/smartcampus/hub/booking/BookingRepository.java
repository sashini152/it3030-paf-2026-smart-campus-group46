package com.smartcampus.hub.booking;

import java.time.Instant;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface BookingRepository extends MongoRepository<Booking, String> {

	@Query("{ resourceId: ?0, status: { $in: ['PENDING', 'APPROVED'] }, startDateTime: { $lt: ?2 }, endDateTime: { $gt: ?1 } }")
	List<Booking> findOverlappingPendingOrApproved(String resourceId, Instant start, Instant end);

	@Query("{ resourceId: ?0, status: 'APPROVED', _id: { $ne: ?3 }, startDateTime: { $lt: ?2 }, endDateTime: { $gt: ?1 } }")
	List<Booking> findOverlappingApprovedExcluding(String resourceId, Instant start, Instant end, String excludeId);

	Booking findByCheckInToken(String checkInToken);
}
