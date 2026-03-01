package com.hackathon.chica_go.repository;

import com.hackathon.chica_go.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // Leaderboard queries — ordered by score descending
    List<User> findAllByOrderByHiScoreDesc();

    List<User> findAllByOrderByWeeklyScoreDesc();

    // Weekly reset — sets every user's weekly_score back to 0
    @Modifying
    @Query("UPDATE User u SET u.weeklyScore = 0")
    void resetAllWeeklyScores();
}
