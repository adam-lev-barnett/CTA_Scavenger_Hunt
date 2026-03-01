package com.hackathon.chica_go.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

// AI generated

/**
 * Configuration for loading API keys from files
 */

@Configuration
@Slf4j
public class ApiKeyConfiguration {

    /**
     * Load Google Maps API key from src/api-keys/google-maps file
     */
    @Bean
    public String googleMapsApiKey() {
        return loadApiKeyFromFile("src/api-keys/google-maps");
    }

    /**
     * Generic method to load API key from file
     * Tries multiple locations to find the file
     */
    private String loadApiKeyFromFile(String filePath) {
        // Try relative path first (from project root during development)
        Path devPath = Paths.get(filePath);
        if (Files.exists(devPath)) {
            try {
                String key = Files.readString(devPath).trim();
                if (!key.isEmpty()) {
                    log.info("Successfully loaded API key from {}", filePath);
                    return key;
                }
            } catch (IOException e) {
                log.warn("Failed to read API key from {}: {}", filePath, e.getMessage());
            }
        }

        // Try classpath as fallback
        try {
            ClassPathResource resource = new ClassPathResource(filePath);
            if (resource.exists()) {
                String key = new String(resource.getInputStream().readAllBytes()).trim();
                if (!key.isEmpty()) {
                    log.info("Successfully loaded API key from classpath: {}", filePath);
                    return key;
                }
            }
        } catch (IOException e) {
            log.warn("Failed to read API key from classpath {}: {}", filePath, e.getMessage());
        }

        // If file not found or empty, log warning and return placeholder
        log.warn("API key file not found at {}. Using placeholder. Please add your API key.", filePath);
        return "YOUR_API_KEY_HERE";
    }
}

