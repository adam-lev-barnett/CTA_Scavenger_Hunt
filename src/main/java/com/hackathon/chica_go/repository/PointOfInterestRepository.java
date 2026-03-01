package com.hackathon.chica_go.repository;

import com.hackathon.chica_go.model.PointOfInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PointOfInterestRepository extends JpaRepository<PointOfInterest, Long> {

    // All POIs linked to a specific station
    List<PointOfInterest> findByStationId(Long stationId);

       // Rows that represent stations (station_id == id)
       @Query("SELECT p FROM PointOfInterest p WHERE p.stationId = p.id")
       List<PointOfInterest> findStations();

       // Nearby POIs for a station (exclude the station row itself)
       @Query("SELECT p FROM PointOfInterest p WHERE p.stationId = :stationId AND p.id <> :stationId")
       List<PointOfInterest> findNearbyPoisByStationId(@Param("stationId") Long stationId);

    // Standalone POIs — not tied to any station
       List<PointOfInterest> findByStationIdIsNull();

    List<PointOfInterest> findByPoiNameContainingIgnoreCase(String name);

    // Geofence helper: POIs within a bounding box around user's coordinates.
    // Service layer is responsible for the final Haversine distance check.
    @Query("SELECT p FROM PointOfInterest p WHERE " +
           "p.latitude  BETWEEN :minLat AND :maxLat AND " +
           "p.longitude BETWEEN :minLon AND :maxLon")
    List<PointOfInterest> findWithinBoundingBox(
            @Param("minLat") BigDecimal minLat,
            @Param("maxLat") BigDecimal maxLat,
            @Param("minLon") BigDecimal minLon,
            @Param("maxLon") BigDecimal maxLon);
}
