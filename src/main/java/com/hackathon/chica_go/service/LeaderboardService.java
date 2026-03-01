package com.hackathon.chica_go.service;

import com.hackathon.chica_go.dto.LeaderboardEntryDTO;
import com.hackathon.chica_go.model.Profile;
import com.hackathon.chica_go.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Service for leaderboard queries
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaderboardService {

    private final ProfileRepository profileRepository;

    /**
     * Get the global leaderboard ordered by all-time high score
     */
    public List<LeaderboardEntryDTO> getGlobalLeaderboard() {
        List<Profile> profiles = profileRepository.findAllByOrderByHiScoreDesc();
        AtomicInteger rank = new AtomicInteger(1);

        return profiles.stream()
                .map(profile -> new LeaderboardEntryDTO(
                        profile.getId(),
                        profile.getUsername(),
                        profile.getHiScore(),
                        profile.getWeeklyScore(),
                        rank.getAndIncrement()
                ))
                .toList();
    }

    /**
     * Get the weekly leaderboard ordered by this week's score
     */
    public List<LeaderboardEntryDTO> getWeeklyLeaderboard() {
        List<Profile> profiles = profileRepository.findAllByOrderByWeeklyScoreDesc();
        AtomicInteger rank = new AtomicInteger(1);

        return profiles.stream()
                .map(profile -> new LeaderboardEntryDTO(
                        profile.getId(),
                        profile.getUsername(),
                        profile.getHiScore(),
                        profile.getWeeklyScore(),
                        rank.getAndIncrement()
                ))
                .toList();
    }
}

