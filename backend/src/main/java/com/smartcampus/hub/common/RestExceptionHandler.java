package com.smartcampus.hub.common;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class RestExceptionHandler {

	@ExceptionHandler(NotFoundException.class)
	public ResponseEntity<Map<String, Object>> notFound(NotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
	}

	@ExceptionHandler(ConflictException.class)
	public ResponseEntity<Map<String, Object>> conflict(ConflictException ex) {
		return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, Object>> badRequest(IllegalArgumentException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
	}

	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<Map<String, Object>> illegalState(IllegalStateException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, Object>> validation(MethodArgumentNotValidException ex) {
		Map<String, String> fields = ex.getBindingResult().getFieldErrors().stream()
				.collect(Collectors.toMap(
						fe -> fe.getField(),
						fe -> fe.getDefaultMessage() == null ? "invalid" : fe.getDefaultMessage(),
						(a, b) -> a,
						HashMap::new));
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(Map.of("error", "Validation failed", "fieldErrors", fields));
	}
}
