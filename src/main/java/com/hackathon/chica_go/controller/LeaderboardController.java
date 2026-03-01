package com.hackathon.chica_go.controller;

import com.hackathon.chica_go.dto.LeaderboardEntryDTO;
import com.hackathon.chica_go.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller for leaderboard endpoints
 */
@RestController
@RequestMapping("/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    /**
     * GET /leaderboard
     * Get the global leaderboard (ordered by all-time high score)
     */
    @GetMapping
    public ResponseEntity<List<LeaderboardEntryDTO>> getLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard());
    }

    /**
     * GET /leaderboard/weekly
     * Get the weekly leaderboard (ordered by this week's score)
     */
    @GetMapping("/weekly")
    public ResponseEntity<List<LeaderboardEntryDTO>> getWeeklyLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getWeeklyLeaderboard());
    }
}

