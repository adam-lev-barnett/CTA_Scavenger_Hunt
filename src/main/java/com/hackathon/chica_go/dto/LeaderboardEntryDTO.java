package com.hackathon.chica_go.dto;

/**
 * Response DTO for leaderboard entries
 */
public record LeaderboardEntryDTO(
        Long userId,
        String username,
        Integer hiScore,
        Integer weeklyScore,
        Integer rank
) {}

