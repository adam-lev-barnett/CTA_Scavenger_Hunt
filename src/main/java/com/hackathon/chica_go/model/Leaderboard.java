package com.hackathon.chica_go.model;

import java.util.ArrayList;
import java.util.List;

public class Leaderboard {

    private final List<Entry> entries;

    private Leaderboard(List<Entry> entries) {
        this.entries = entries;
    }

    /**
     * Builds a ranked leaderboard from an ordered list of profiles.
     * Expects profiles already sorted by the desired score (weekly or hi-score).
     */
    public static Leaderboard fromProfiles(List<Profile> profiles) {
        List<Entry> entries = new ArrayList<>();
        for (int i = 0; i < profiles.size(); i++) {
            Profile p = profiles.get(i);
            entries.add(new Entry(i + 1, p.getId(), p.getUsername(), p.getWeeklyScore(), p.getHiScore()));
        }
        return new Leaderboard(entries);
    }

    public List<Entry> getEntries() {
        return entries;
    }

    /**
     * A single ranked row in the leaderboard.
     */
    public record Entry(int rank, Long userId, String username, int weeklyScore, int hiScore) {}
}
