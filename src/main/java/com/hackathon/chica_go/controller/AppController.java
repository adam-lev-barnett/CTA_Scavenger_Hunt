package com.hackathon.chica_go.controller;

import com.hackathon.chica_go.model.PointOfInterest;
import com.hackathon.chica_go.model.Profile;
import com.hackathon.chica_go.model.ScoreCalculator;
import com.hackathon.chica_go.model.StampBook;
import com.hackathon.chica_go.model.StampBookEntry;
import com.hackathon.chica_go.repository.PointOfInterestRepository;
import com.hackathon.chica_go.repository.ProfileRepository;
import com.hackathon.chica_go.repository.StampBookEntryRepository;
import com.hackathon.chica_go.repository.StampBookRepository;
import com.hackathon.chica_go.service.GeofencingService;
import com.hackathon.chica_go.service.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Transactional
public class AppController {

    private final ProfileRepository profileRepository;
    private final PointOfInterestRepository pointOfInterestRepository;
    private final StampBookRepository stampBookRepository;
    private final StampBookEntryRepository stampBookEntryRepository;
    private final GeofencingService geofencingService;
    private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;

    private final ScoreCalculator scoreCalculator = new ScoreCalculator();

    @PostMapping("/auth/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        if (request.username() == null || request.username().isBlank()
                || request.email() == null || request.email().isBlank()
                || request.password() == null || request.password().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username, email, and password are required");
        }

        if (profileRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered");
        }
        if (profileRepository.existsByUsername(request.username())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already taken");
        }

        Profile profile = Profile.builder()
                .username(request.username().trim())
                .email(request.email().trim())
                .passwordHash(passwordEncoder.encode(request.password()))
                .hiScore(0)
                .weeklyScore(0)
                .build();

        Profile saved = profileRepository.save(profile);
        ensureStampBookSeeded(saved);

        return ResponseEntity.ok(new AuthResponse(jwtService.generateToken(saved), saved.getId(), saved.getUsername()));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        if (request.email() == null || request.password() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email and password are required");
        }

        Profile profile = profileRepository.findByEmail(request.email().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), profile.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return ResponseEntity.ok(new AuthResponse(jwtService.generateToken(profile), profile.getId(), profile.getUsername()));
    }

        @GetMapping("/auth/me")
        public ResponseEntity<MeResponse> me() {
                Long authenticatedUserId = getAuthenticatedUserId();

                Profile profile = profileRepository.findById(authenticatedUserId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

                return ResponseEntity.ok(new MeResponse(
                                profile.getId(),
                                profile.getUsername(),
                                profile.getEmail(),
                                profile.getHiScore(),
                                profile.getWeeklyScore()
                ));
        }

    @PostMapping("/checkin")
    public ResponseEntity<CheckInResponse> checkIn(@RequestBody CheckInRequest request) {
        if (request.userId() == null || request.locationId() == null
                || request.userLat() == null || request.userLng() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId, locationId, userLat, and userLng are required");
        }

                Long authenticatedUserId = getAuthenticatedUserId();
                if (!authenticatedUserId.equals(request.userId())) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token user does not match request userId");
                }

        Profile profile = profileRepository.findById(request.userId())
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

        StampBook stampBook = ensureStampBookSeeded(profile);
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

    @GetMapping("/stations/{stationId}/nearby")
    public ResponseEntity<List<PoiResponse>> getNearbyPois(@PathVariable Long stationId) {
        List<PoiResponse> response = pointOfInterestRepository.findNearbyPoisByStationId(stationId)
                .stream()
                .map(this::toPoiResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{userId}/stampbook")
    public ResponseEntity<List<StampBookEntryResponse>> getStampBook(@PathVariable Long userId) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        StampBook stampBook = ensureStampBookSeeded(profile);
        List<StampBookEntryResponse> response = stampBookEntryRepository.findByStampBookId(stampBook.getId())
                .stream()
                .map(entry -> new StampBookEntryResponse(
                        entry.getId(),
                        new PoiNameResponse(
                                entry.getPointOfInterest().getId(),
                                entry.getPointOfInterest().getPoiName(),
                                entry.getPointOfInterest().getPoiName()),
                        entry.isVisited(),
                        entry.getVisitedAt()))
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardResponse>> getLeaderboard() {
        List<LeaderboardResponse> response = profileRepository.findAllByOrderByWeeklyScoreDesc()
                .stream()
                .limit(20)
                .map(profile -> new LeaderboardResponse(0, profile.getUsername(), profile.getWeeklyScore()))
                .toList();

        List<LeaderboardResponse> ranked = java.util.stream.IntStream.range(0, response.size())
                .mapToObj(i -> new LeaderboardResponse(i + 1, response.get(i).username(), response.get(i).weeklyScore()))
                .toList();

        return ResponseEntity.ok(ranked);
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<ProfileResponse> getUser(@PathVariable Long userId) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return ResponseEntity.ok(new ProfileResponse(
                profile.getId(),
                profile.getUsername(),
                profile.getEmail(),
                profile.getHiScore(),
                profile.getWeeklyScore()
        ));
    }

    @PatchMapping("/users/{userId}")
    public ResponseEntity<ProfileResponse> updateUser(@PathVariable Long userId, @RequestBody UpdateUserRequest request) {
                Long authenticatedUserId = getAuthenticatedUserId();
                if (!authenticatedUserId.equals(userId)) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own profile");
                }

        if (request.username() == null || request.username().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username is required");
        }

        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String normalized = request.username().trim();
        if (!normalized.equals(profile.getUsername()) && profileRepository.existsByUsername(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already taken");
        }

        profile.setUsername(normalized);
        Profile saved = profileRepository.save(profile);

        return ResponseEntity.ok(new ProfileResponse(
                saved.getId(),
                saved.getUsername(),
                saved.getEmail(),
                saved.getHiScore(),
                saved.getWeeklyScore()
        ));
    }

    private StampBook ensureStampBookSeeded(Profile profile) {
        StampBook stampBook = stampBookRepository.findByProfileId(profile.getId())
                .orElseGet(() -> stampBookRepository.save(
                        StampBook.builder()
                                .profile(profile)
                                .build()));

        if (stampBookEntryRepository.countByStampBookId(stampBook.getId()) == 0) {
            List<PointOfInterest> allPois = pointOfInterestRepository.findAll();
            List<StampBookEntry> entries = allPois.stream()
                    .map(poi -> StampBookEntry.builder()
                            .stampBook(stampBook)
                            .pointOfInterest(poi)
                            .visited(false)
                            .build())
                    .toList();
            stampBookEntryRepository.saveAll(entries);
        }

        return stampBook;
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

        private Long getAuthenticatedUserId() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null || authentication.getPrincipal() == null) {
                        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authentication");
                }

                Object principal = authentication.getPrincipal();
                if (principal instanceof Long userId) {
                        return userId;
                }

                if (principal instanceof String userIdString) {
                        try {
                                return Long.parseLong(userIdString);
                        } catch (NumberFormatException e) {
                                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication principal");
                        }
                }

                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication principal");
        }

    private record RegisterRequest(String username, String email, String password) {
    }

    private record LoginRequest(String email, String password) {
    }

    private record AuthResponse(String token, Long userId, String username) {
    }

        private record MeResponse(Long id, String username, String email, int hiScore, int weeklyScore) {
        }

    private record CheckInRequest(Long userId, Long locationId, BigDecimal userLat, BigDecimal userLng) {
    }

    private record CheckInResponse(int pointsEarned, int totalScore, boolean isFirstVisit) {
    }

    private record UpdateUserRequest(String username) {
    }

    private record ProfileResponse(Long id, String username, String email, int hiScore, int weeklyScore) {
    }

    private record LeaderboardResponse(int rank, String username, int weeklyScore) {
    }

    private record PoiNameResponse(Long id, String name, String pointName) {
    }

    private record StampBookEntryResponse(Long id, PoiNameResponse pointOfInterest, boolean visited, LocalDateTime visitedAt) {
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
    ) {
    }
}
