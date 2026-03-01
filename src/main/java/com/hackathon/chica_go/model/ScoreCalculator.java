package com.hackathon.chica_go.model;

public class ScoreCalculator {

    private static final double REPEAT_VISIT_MULTIPLIER = 0.50;

    /**
     * Full points on first visit; 50% on repeat visits.
     */
    public int calculatePoints(int points, boolean isFirstVisit) {
        if (isFirstVisit) {
            return points;
        }
        return (int) Math.round(points * REPEAT_VISIT_MULTIPLIER);
    }

    /**
     * Adds earned points to the profile's weekly score and updates hiScore if exceeded.
     */
    public void applyPointsToProfile(Profile profile, int pointsEarned) {
        int newWeekly = profile.getWeeklyScore() + pointsEarned;
        profile.setWeeklyScore(newWeekly);
        if (newWeekly > profile.getHiScore()) {
            profile.setHiScore(newWeekly);
        }
    }
}
