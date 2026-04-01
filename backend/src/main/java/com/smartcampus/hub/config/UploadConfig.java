package com.smartcampus.hub.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "app.upload")
@Data
public class UploadConfig {

    private String dir;
    private int maxImagesPerTicket;
    private List<String> allowedContentTypes;
}
