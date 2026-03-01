package com.hackathon.chica_go.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for login endpoint
 */
public record LoginRequest(
        @Email @NotBlank String email,
        @NotBlank String password
) {}

