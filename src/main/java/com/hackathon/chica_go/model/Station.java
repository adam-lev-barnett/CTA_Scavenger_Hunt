package com.hackathon.chica_go.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Lightweight view of a PointOfInterest that acts as a CTA station
 * (stationId == id). Not a JPA entity — built from PointOfInterest rows.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Station {

    private Long id;
    private String name;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private List<PointOfInterest> nearbyPois;

    public static Station from(PointOfInterest poi, List<PointOfInterest> nearbyPois) {
        return new Station(poi.getId(), poi.getPoiName(), poi.getLatitude(), poi.getLongitude(), nearbyPois);
    }
}
