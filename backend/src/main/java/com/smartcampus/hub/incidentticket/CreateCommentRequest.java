package com.smartcampus.hub.incidentticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateCommentRequest {

	@NotBlank(message = "Author is required")
	private String author;

	@NotBlank(message = "Content is required")
	@Size(max = 500, message = "Comment must not exceed 500 characters")
	private String content;

	public String getAuthor() {
		return author;
	}

	public void setAuthor(String author) {
		this.author = author;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}
}
