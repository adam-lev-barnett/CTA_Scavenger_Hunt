package com.hackathon.chica_go.model;

import java.time.LocalDateTime;


// Only comments are AI generated
public class CheckIn {

    private final ScoreCalculator scoreCalculator;

    public CheckIn(ScoreCalculator scoreCalculator) {
        this.scoreCalculator = scoreCalculator;
    }

    /**
     * Processes a check-in: calculates points, updates the profile scores,
     * and marks the stamp book entry as visited.
     *
     * @param user     the profile checking in
     * @param location the point of interest being visited
     * @param entry    the stamp book entry for this location (may already be visited)
     * @return a result containing points earned, running total, and whether it was a first visit
     */
    public CheckInResult process(Profile user, PointOfInterest location, StampBookEntry entry) {
        boolean isFirstVisit = !entry.isVisited();
        int pointsEarned = scoreCalculator.calculatePoints(location.getPoints(), isFirstVisit);

        scoreCalculator.applyPointsToProfile(user, pointsEarned);

        entry.setVisited(true);
        entry.setVisitedAt(LocalDateTime.now());

        return new CheckInResult(pointsEarned, user.getWeeklyScore(), isFirstVisit);
    }

    /**
     * Immutable result returned to the caller / controller after a check-in.
     * Maps directly to the API response shape: { pointsEarned, totalScore, isFirstVisit }
     */
    public record CheckInResult(int pointsEarned, int totalScore, boolean isFirstVisit) {}
}
