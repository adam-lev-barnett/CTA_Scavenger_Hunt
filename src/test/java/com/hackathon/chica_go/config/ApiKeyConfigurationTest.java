package com.hackathon.chica_go.config;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test that API keys can be loaded from files (without requiring full Spring context)
 */
public class ApiKeyConfigurationTest {

    @Test
    public void testApiKeyFileExists() {
        boolean fileExists = Files.exists(Paths.get("src/api-keys/google-maps"));
        assertTrue(fileExists, "API key file should exist at src/api-keys/google-maps");
        System.out.println("✓ API key file found");
    }

    @Test
    public void testApiKeyFileIsNotEmpty() throws IOException {
        String apiKey = Files.readString(Paths.get("src/api-keys/google-maps")).trim();

        assertNotNull(apiKey, "API key should not be null");
        assertFalse(apiKey.isEmpty(), "API key should not be empty");

        System.out.println("✓ API key file is not empty");
    }

    @Test
    public void testApiKeyHasValidFormat() throws IOException {
        String apiKey = Files.readString(Paths.get("src/api-keys/google-maps")).trim();

        // Google Maps API keys typically start with "AIza" and are 39 characters
        assertTrue(apiKey.length() > 20,
            "API key should have reasonable length (got " + apiKey.length() + " chars)");

        System.out.println("✓ API key has valid format: " + apiKey.substring(0, Math.min(10, apiKey.length())) + "... (" + apiKey.length() + " chars)");
    }

    @Test
    public void testApiKeyIsNotPlaceholder() throws IOException {
        String apiKey = Files.readString(Paths.get("src/api-keys/google-maps")).trim();

        assertNotEquals("YOUR_API_KEY_HERE", apiKey,
            "API key should not be placeholder text");

        System.out.println("✓ API key is not placeholder text");
    }
}


