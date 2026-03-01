package com.hackathon.chica_go.controller;

import com.hackathon.chica_go.model.Profile;
import com.hackathon.chica_go.repository.ProfileRepository;
import com.hackathon.chica_go.service.JwtService;
import com.hackathon.chica_go.service.StampBookService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
@Transactional
public class AuthController {

    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final StampBookService stampBookService;

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
        stampBookService.ensureStampBookSeeded(saved);

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
        Long authenticatedUserId = jwtService.getAuthenticatedUserId();

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

    private record RegisterRequest(String username, String email, String password) {}
    private record LoginRequest(String email, String password) {}
    private record AuthResponse(String token, Long userId, String username) {}
    private record MeResponse(Long id, String username, String email, int hiScore, int weeklyScore) {}
}
