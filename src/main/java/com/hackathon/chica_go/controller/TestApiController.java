package com.hackathon.chica_go.controller;

import com.hackathon.chica_go.dto.OverpassStationDTO;
import com.hackathon.chica_go.model.Station;
import com.hackathon.chica_go.repository.StationRepository;
import com.hackathon.chica_go.service.ApiKeyService;
import com.hackathon.chica_go.service.GeofencingService;
import com.hackathon.chica_go.service.OverpassApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Test controller for external API integrations
 * Can be removed or secured in production
 */
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestApiController {

    private final OverpassApiService overpassApiService;
    private final StationRepository stationRepository;
    private final GeofencingService geofencingService;
    private final ApiKeyService apiKeyService;

    /**
     * Test the Overpass API connection
     */
    @GetMapping("/overpass/fetch")
    public ResponseEntity<List<OverpassStationDTO>> testOverpassApi() {
        List<OverpassStationDTO> stations = overpassApiService.fetchCTAStationsSimple();
        return ResponseEntity.ok(stations);
    }

    /**
     * Check API key status
     */
    @GetMapping("/api-keys/status")
    public ResponseEntity<Map<String, Object>> checkApiKeyStatus() {
        return ResponseEntity.ok(Map.of(
                "google_maps_loaded", apiKeyService.hasValidGoogleMapsKey(),
                "google_maps_key_preview", apiKeyService.hasValidGoogleMapsKey()
                    ? apiKeyService.getGoogleMapsApiKey().substring(0, Math.min(10, apiKeyService.getGoogleMapsApiKey().length())) + "..."
                    : "NOT LOADED",
                "message", apiKeyService.hasValidGoogleMapsKey()
                    ? "API keys successfully loaded"
                    : "API keys not found. Please add src/api-keys/google-maps file"
        ));
    }

    /**
     * Get all stations from the database
     */
    @GetMapping("/stations")
    public ResponseEntity<List<Station>> getAllStations() {
        List<Station> stations = stationRepository.findAll();
        return ResponseEntity.ok(stations);
    }

    /**
     * Test geofencing
     * Example: /api/test/geofence?userLat=41.88574&userLng=-87.62773&targetLat=41.88574&targetLng=-87.62773
     */
    @GetMapping("/geofence")
    public ResponseEntity<Map<String, Object>> testGeofence(
            @RequestParam BigDecimal userLat,
            @RequestParam BigDecimal userLng,
            @RequestParam BigDecimal targetLat,
            @RequestParam BigDecimal targetLng
    ) {
        double distance = geofencingService.calculateDistance(userLat, userLng, targetLat, targetLng);
        boolean withinFence = geofencingService.isWithinGeofence(userLat, userLng, targetLat, targetLng);

        return ResponseEntity.ok(Map.of(
                "distance_meters", distance,
                "within_geofence", withinFence,
                "geofence_radius_meters", geofencingService.getRadiusMeters(),
                "user_location", Map.of("lat", userLat, "lng", userLng),
                "target_location", Map.of("lat", targetLat, "lng", targetLng)
        ));
    }

    /**
     * Update geofence radius for demo/testing
     */
    @PostMapping("/geofence/radius")
    public ResponseEntity<Map<String, Object>> setGeofenceRadius(@RequestParam double radiusMeters) {
        geofencingService.setRadiusMeters(radiusMeters);
        return ResponseEntity.ok(Map.of(
                "message", "Geofence radius updated",
                "new_radius_meters", radiusMeters
        ));
    }
}




