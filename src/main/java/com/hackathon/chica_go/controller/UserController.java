package com.hackathon.chica_go.controller;

import com.hackathon.chica_go.model.Profile;
import com.hackathon.chica_go.model.StampBook;
import com.hackathon.chica_go.repository.ProfileRepository;
import com.hackathon.chica_go.repository.StampBookEntryRepository;
import com.hackathon.chica_go.service.JwtService;
import com.hackathon.chica_go.service.StampBookService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Transactional
public class UserController {

    private final ProfileRepository profileRepository;
    private final StampBookEntryRepository stampBookEntryRepository;
    private final JwtService jwtService;
    private final StampBookService stampBookService;

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
        Long authenticatedUserId = jwtService.getAuthenticatedUserId();
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

    @GetMapping("/users/{userId}/stampbook")
    public ResponseEntity<List<StampBookEntryResponse>> getStampBook(@PathVariable Long userId) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        StampBook stampBook = stampBookService.ensureStampBookSeeded(profile);
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

    private record UpdateUserRequest(String username) {}
    private record ProfileResponse(Long id, String username, String email, int hiScore, int weeklyScore) {}
    private record PoiNameResponse(Long id, String name, String pointName) {}
    private record StampBookEntryResponse(Long id, PoiNameResponse pointOfInterest, boolean visited, LocalDateTime visitedAt) {}
}
