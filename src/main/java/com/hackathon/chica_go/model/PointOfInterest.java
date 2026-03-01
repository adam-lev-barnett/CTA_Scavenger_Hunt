package com.hackathon.chica_go.model;

import com.hackathon.chica_go.repository.ProfileRepository;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Entity
@Table(name = "point_of_interests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointOfInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "poi_name", nullable = false, length = 500)
    private String poiName;

    @Column(name = "longitude", nullable = false, precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(name = "latitude", nullable = false, precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "points", nullable = false)
    @Builder.Default
    private int points = 0;

    /*
    @OneToMany(mappedBy = "pointOfInterest", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<StampBookEntry> stampBookEntries;
     */

    @Transient
    private CheckIn checkIn;

    @Transient
    private final ScoreCalculator scoreCalculator = new ScoreCalculator();

    @Transient
    private ProfileRepository profileRepository;

    public CheckIn.CheckInResult checkInProfile(Profile profile) {
        if (profile == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "profile is null");

        boolean isFirstVisit = profile.visitedPoi(this);

        int pointsEarned = scoreCalculator.calculatePoints(points, isFirstVisit);

        profile.addPoints(pointsEarned);

        scoreCalculator.applyPointsToProfile(user, pointsEarned);

        entry.setVisited(true);
        entry.setVisitedAt(LocalDateTime.now());

        return new CheckIn.CheckInResult(pointsEarned, user.getWeeklyScore(), isFirstVisit);
    }



}
