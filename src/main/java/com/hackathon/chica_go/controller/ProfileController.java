package com.hackathon.chica_go.controller;

import com.hackathon.chica_go.dto.RegisterRequest;
import com.hackathon.chica_go.model.Profile;
import com.hackathon.chica_go.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    /**
     * POST /users/register
     */
    @PostMapping("/register")
    public ResponseEntity<Profile> register(@Valid @RequestBody RegisterRequest request) {
        Profile created = profileService.register(request.username(), request.email(), request.password());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /users/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<Profile> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    /**
     * PATCH /users/{userId}?username=newName
     */
    @PatchMapping("/{userId}")
    public ResponseEntity<Profile> updateUsername(
            @PathVariable Long userId,
            @RequestParam String username) {
        return ResponseEntity.ok(profileService.updateUsername(userId, username));
    }

    /**
     * GET /users/{userId}/visited/{poiId}
     */
    @GetMapping("/{userId}/visited/{poiId}")
    public ResponseEntity<Boolean> visitedPoi(
            @PathVariable Long userId,
            @PathVariable Long poiId) {
        return ResponseEntity.ok(profileService.visitedPoi(userId, poiId));
    }
}
