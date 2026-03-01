package com.hackathon.chica_go.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

//AI generated

/**
 * Service to provide access to loaded API keys
 */
@Service
@Slf4j
public class ApiKeyService {

    private final String googleMapsApiKey;

    public ApiKeyService(@Qualifier("googleMapsApiKey") String googleMapsApiKey) {
        this.googleMapsApiKey = googleMapsApiKey;
    }

    /**
     * Get Google Maps API key
     */
    public String getGoogleMapsApiKey() {
        return googleMapsApiKey;
    }

    /**
     * Check if a valid API key is loaded (not placeholder)
     */
    public boolean hasValidGoogleMapsKey() {
        return googleMapsApiKey != null &&
               !googleMapsApiKey.isEmpty() &&
               !googleMapsApiKey.equals("YOUR_API_KEY_HERE");
    }
}


