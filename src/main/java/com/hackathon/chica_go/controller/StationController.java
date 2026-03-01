package com.hackathon.chica_go.controller;

import com.hackathon.chica_go.dto.CheckInRequest;
import com.hackathon.chica_go.dto.CheckInResponse;
import com.hackathon.chica_go.model.*;
import com.hackathon.chica_go.repository.PointOfInterestRepository;
import com.hackathon.chica_go.repository.ProfileRepository;
import com.hackathon.chica_go.repository.StampBookEntryRepository;
import com.hackathon.chica_go.service.GeofencingService;
import com.hackathon.chica_go.service.JwtService;
import com.hackathon.chica_go.service.StampBookService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// Boilerplate by AI, class structure, endpoint connection, and any business logic more complex than CRUD was created by the team

@RestController
@RequiredArgsConstructor
@Transactional
public class StationController {

    private final ProfileRepository profileRepository;
    private final PointOfInterestRepository pointOfInterestRepository;
    private final StampBookEntryRepository stampBookEntryRepository;
    private final GeofencingService geofencingService;
    private final JwtService jwtService;
    private final StampBookService stampBookService;

    private final ScoreCalculator scoreCalculator = new ScoreCalculator();

    // Re-added /stations prefix only for this specific method
    @GetMapping("/stations/{stationId}/nearby")
    public ResponseEntity<List<PoiResponse>> getNearbyPois(@PathVariable Long stationId) {
        List<PoiResponse> response = pointOfInterestRepository.findNearbyPoisByStationId(stationId)
                .stream()
                .map(this::toPoiResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    // Now correctly mapped to /checkin to match frontend and SecurityConfig
    @PostMapping("/checkin")
    public ResponseEntity<CheckInResponse> checkIn(@RequestBody CheckInRequest request) {
        Long authenticatedUserId = jwtService.getAuthenticatedUserId();

        if (request.locationId() == null || request.userLat() == null || request.userLng() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "locationId, userLat, and userLng are required");
        }

        // We use the ID from the token for security
        Profile profile = profileRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        PointOfInterest poi = pointOfInterestRepository.findById(request.locationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));

        boolean withinFence = geofencingService.isWithinGeofence(
                request.userLat(),
                request.userLng(),
                poi.getLatitude(),
                poi.getLongitude()
        );

        if (!withinFence) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are too far from this location to check in");
        }

        StampBook stampBook = stampBookService.ensureStampBookSeeded(profile);
        StampBookEntry entry = stampBookEntryRepository
                .findByStampBookIdAndPointOfInterestId(stampBook.getId(), poi.getId())
                .orElseGet(() -> stampBookEntryRepository.save(
                        StampBookEntry.builder()
                                .stampBook(stampBook)
                                .pointOfInterest(poi)
                                .visited(false)
                                .build()));

        boolean isFirstVisit = !entry.isVisited();
        int pointsEarned = scoreCalculator.calculatePoints(poi.getPoints(), isFirstVisit);
        scoreCalculator.applyPointsToProfile(profile, pointsEarned);

        entry.setVisited(true);
        entry.setVisitedAt(LocalDateTime.now());

        stampBookEntryRepository.save(entry);
        profileRepository.save(profile);

        return ResponseEntity.ok(new CheckInResponse(pointsEarned, profile.getWeeklyScore(), isFirstVisit));
    }

    private PoiResponse toPoiResponse(PointOfInterest poi) {
        return new PoiResponse(
                poi.getId(),
                poi.getPoiName(),
                null,
                null,
                poi.getLatitude(),
                poi.getLongitude(),
                poi.getStationId(),
                poi.getPoints()
        );
    }

    private record PoiResponse(
            Long id,
            String poiName,
            String stationName,
            String name,
            BigDecimal latitude,
            BigDecimal longitude,
            Long stationId,
            int points
    ) {}
}