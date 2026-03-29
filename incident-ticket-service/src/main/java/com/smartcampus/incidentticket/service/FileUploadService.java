package com.smartcampus.incidentticket.service;

import com.smartcampus.incidentticket.config.UploadConfig;
import com.smartcampus.incidentticket.exception.ResourceNotFoundException;
import com.smartcampus.incidentticket.model.Ticket;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileUploadService {

    private final UploadConfig uploadConfig;
    private final TicketService ticketService;

    public List<String> uploadTicketImages(String ticketId, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("No files provided");
        }

        Ticket ticket = ticketService.getAllTickets().stream()
                .filter(t -> t.getId().equals(ticketId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id " + ticketId));

        // Check current image count
        int currentImageCount = ticket.getImageUrls() != null ? ticket.getImageUrls().size() : 0;
        if (currentImageCount + files.size() > uploadConfig.getMaxImagesPerTicket()) {
            throw new IllegalArgumentException(
                String.format("Cannot upload %d files. Ticket already has %d images, maximum allowed is %d",
                    files.size(), currentImageCount, uploadConfig.getMaxImagesPerTicket()));
        }

        // Validate and save files
        List<String> uploadedPaths = new ArrayList<>();
        Path uploadPath = Paths.get(uploadConfig.getDir());

        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }

        for (MultipartFile file : files) {
            validateFile(file);

            String filename = generateUniqueFilename(file.getOriginalFilename());
            Path filePath = uploadPath.resolve(filename);

            try {
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                uploadedPaths.add("/uploads/" + filename);
            } catch (IOException e) {
                throw new RuntimeException("Failed to store file " + filename, e);
            }
        }

        // Update ticket with new image URLs
        List<String> updatedImageUrls = new ArrayList<>();
        if (ticket.getImageUrls() != null) {
            updatedImageUrls.addAll(ticket.getImageUrls());
        }
        updatedImageUrls.addAll(uploadedPaths);

        ticket.setImageUrls(updatedImageUrls);
        ticketService.updateTicket(ticketId, ticket);

        return uploadedPaths;
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !uploadConfig.getAllowedContentTypes().contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type: " + contentType + ". Allowed types: " +
                String.join(", ", uploadConfig.getAllowedContentTypes()));
        }

        // File size is handled by Spring's multipart config
    }

    private String generateUniqueFilename(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }
}