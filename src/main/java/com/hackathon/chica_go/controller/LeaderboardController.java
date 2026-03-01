package com.hackathon.chica_go.controller;

import com.hackathon.chica_go.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.IntStream;

@RestController
@RequiredArgsConstructor
public class LeaderboardController {

    private final ProfileRepository profileRepository;

    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardResponse>> getLeaderboard() {
        List<LeaderboardResponse> response = profileRepository.findAllByOrderByWeeklyScoreDesc()
                .stream()
                .limit(20)
                .map(profile -> new LeaderboardResponse(0, profile.getUsername(), profile.getWeeklyScore()))
                .toList();

        List<LeaderboardResponse> ranked = IntStream.range(0, response.size())
                .mapToObj(i -> new LeaderboardResponse(i + 1, response.get(i).username(), response.get(i).weeklyScore()))
                .toList();

        return ResponseEntity.ok(ranked);
    }

    private record LeaderboardResponse(int rank, String username, int weeklyScore) {}
}
