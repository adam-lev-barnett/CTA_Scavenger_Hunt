package com.hackathon.chica_go.repository;

import com.hackathon.chica_go.model.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {

    List<Station> findByStationNameContainingIgnoreCase(String name);

    // Returns all stations within a bounding box — useful for map viewport queries
    @Query("SELECT s FROM Station s WHERE " +
           "s.latitude  BETWEEN :minLat AND :maxLat AND " +
           "s.longitude BETWEEN :minLon AND :maxLon")
    List<Station> findWithinBoundingBox(
            @Param("minLat") BigDecimal minLat,
            @Param("maxLat") BigDecimal maxLat,
            @Param("minLon") BigDecimal minLon,
            @Param("maxLon") BigDecimal maxLon);
}
