package com.hackathon.chica_go.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "stamp_book_entries",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_entry",
        columnNames = {"stamp_book_id", "location_id"}
    )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StampBookEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stamp_book_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_entries_stamp_book"))
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private StampBook stampBook;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_entries_location"))
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private PointOfInterest pointOfInterest;

    @Column(name = "visited", nullable = false)
    @Builder.Default
    private boolean visited = false;

    // NULL until the user checks in — matches schema intent
    @Column(name = "visited_at")
    private LocalDateTime visitedAt;
}
