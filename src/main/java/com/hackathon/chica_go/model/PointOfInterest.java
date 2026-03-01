package com.hackathon.chica_go.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

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

    // NULLABLE — a POI with station = null is a standalone location
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", foreignKey = @ForeignKey(name = "fk_station"))
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Station station;

    @Column(name = "points", nullable = false)
    @Builder.Default
    private int points = 0;

    @OneToMany(mappedBy = "pointOfInterest", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<StampBookEntry> stampBookEntries;
}
