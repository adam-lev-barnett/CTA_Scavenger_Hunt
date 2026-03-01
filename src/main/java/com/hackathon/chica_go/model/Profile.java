package com.hackathon.chica_go.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "hi_score", nullable = false)
    @Builder.Default
    private int hiScore = 0;

    @Column(name = "weekly_score", nullable = false)
    @Builder.Default
    private int weeklyScore = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "profile", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Getter private StampBook stampBook;

    @Transient
    Boolean visitedPoi(PointOfInterest pointOfInterest) {
        if (this.stampBook == null || this.stampBook.getEntries() == null || pointOfInterest == null) {
            return false;
        }

        Long poiId = pointOfInterest.getId();
        if (poiId == null) {
            return false;
        }

        return this.stampBook.getEntries().stream()
                .anyMatch(entry ->
                        entry.getPointOfInterest() != null
                                && poiId.equals(entry.getPointOfInterest().getId())
                                && entry.isVisited());
    }

    @Transient
    void addPoints(int points) {
        weeklyScore += points;
    }

    @Transient
    void resetPoints() {
        weeklyScore = 0;
    }


}
