package com.hackathon.chica_go.dto;

/**
 * Response DTO for authentication endpoints
 */
public record AuthResponse(
        String token,
        Long userId,
        String username
) {}

