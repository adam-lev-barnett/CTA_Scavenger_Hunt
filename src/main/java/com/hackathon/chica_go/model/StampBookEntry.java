package com.hackathon.chica_go.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hackathon.chica_go.converter.LocalDateTimeConverter;
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
    @Getter private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stamp_book_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_entries_stamp_book"))
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Getter private StampBook stampBook;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "location_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_entries_location"))
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Getter private PointOfInterest pointOfInterest;

    @Column(name = "visited", nullable = false)
    @Builder.Default
    @Getter private boolean visited = false;

    // NULL until the user checks in — matches schema intent
    @Convert(converter = LocalDateTimeConverter.class)
    @Column(name = "visited_at")
    @Setter @Getter private LocalDateTime visitedAt;
}
