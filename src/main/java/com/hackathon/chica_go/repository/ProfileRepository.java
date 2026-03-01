package com.hackathon.chica_go.repository;

import com.hackathon.chica_go.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface
ProfileRepository extends JpaRepository<Profile, Long> {

    Optional<Profile> findByUsername(String username);

    Optional<Profile> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // Leaderboard queries — ordered by score descending
    List<Profile> findAllByOrderByHiScoreDesc();

    List<Profile> findAllByOrderByWeeklyScoreDesc();

    // Weekly reset — sets every user's weekly_score back to 0
    @Modifying
    @Query("UPDATE Profile u SET u.weeklyScore = 0")
    void resetAllWeeklyScores();
}
