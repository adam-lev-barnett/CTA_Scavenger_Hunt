package com.hackathon.chica_go.controller;

import com.hackathon.chica_go.dto.AuthResponse;
import com.hackathon.chica_go.dto.LoginRequest;
import com.hackathon.chica_go.dto.RegisterRequest;
import com.hackathon.chica_go.model.Profile;
import com.hackathon.chica_go.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Authentication controller for user login and registration
 * Provides JWT-like token-based authentication
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final ProfileService profileService;
    private final PasswordEncoder passwordEncoder;

    /**
     * POST /auth/login
     * Login endpoint - validates email and password, returns auth token
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Profile profile = profileService.authenticateUser(request.email(), request.password());

        // Generate a simple token (in production, use JWT)
        String token = generateToken(profile.getId());

        return ResponseEntity.ok(new AuthResponse(
                token,
                profile.getId(),
                profile.getUsername()
        ));
    }

    /**
     * POST /auth/register
     * Register endpoint - creates a new user account and returns auth token
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        Profile profile = profileService.register(
                request.username(),
                request.email(),
                request.password()
        );

        // Generate a simple token (in production, use JWT)
        String token = generateToken(profile.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(
                token,
                profile.getId(),
                profile.getUsername()
        ));
    }

    /**
     * Generate a simple token for this user
     * In production, this should be replaced with JWT
     */
    private String generateToken(Long userId) {
        // Simple token format: UUID concatenated with userId
        // In production, use JWT: JWT.create()
        //     .withSubject(userId.toString())
        //     .withIssuedAt(new Date())
        //     .withExpiresAt(new Date(System.currentTimeMillis() + 86400000)) // 24 hours
        //     .sign(algorithm);
        return UUID.randomUUID().toString() + "_" + userId;
    }
}

