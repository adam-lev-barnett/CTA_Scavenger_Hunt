package com.hackathon.chica_go.service;

import com.hackathon.chica_go.dto.OverpassStationDTO;
import com.hackathon.chica_go.model.PointOfInterest;
import com.hackathon.chica_go.repository.PointOfInterestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

/**
 * Seeds the database with CTA station data on application startup
 * Only runs if the stations table is empty
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StationDataSeeder implements CommandLineRunner {

    private final PointOfInterestRepository pointOfInterestRepository;
    private final OverpassApiService overpassApiService;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking if station data needs to be seeded...");

        long stationCount = pointOfInterestRepository.findStations().size();

        if (stationCount > 0) {
            log.info("Station data already exists ({} stations). Skipping seed.", stationCount);
            return;
        }

        log.info("No stations found. Seeding database with CTA station data...");
        seedStations();
    }

    private void seedStations() {
        try {
            // Try the simple query first (more reliable)
            List<OverpassStationDTO> stationDTOs = overpassApiService.fetchCTAStationsSimple();

            if (stationDTOs.isEmpty()) {
                log.warn("No stations returned from Overpass API. Trying alternative query...");
                stationDTOs = overpassApiService.fetchCTAStations();
            }

            if (stationDTOs.isEmpty()) {
                log.warn("Still no stations found. You may need to seed manually or check the Overpass query.");
                seedFallbackStations();
                return;
            }

            // Convert DTOs to entities and save
            List<PointOfInterest> stations = stationDTOs.stream()
                    .map(dto -> PointOfInterest.builder()
                            .poiName(dto.getName())
                            .latitude(dto.getLat())
                            .longitude(dto.getLon())
                            .points(100)
                            .build())
                    .toList();

            persistStations(stations);

            log.info("Successfully seeded {} CTA stations", stations.size());

        } catch (Exception e) {
            log.error("Error seeding station data from Overpass API. Falling back to manual seed.", e);
            seedFallbackStations();
        }
    }

    /**
     * Fallback: Seed a few well-known CTA L stations manually
     * Use this if Overpass API is unavailable or returns no results
     */
    private void seedFallbackStations() {
        log.info("Seeding fallback CTA stations...");

        List<PointOfInterest> fallbackStations = List.of(
                buildStation("State/Lake", BigDecimal.valueOf(41.88574), BigDecimal.valueOf(-87.62773)),
                buildStation("Clark/Lake", BigDecimal.valueOf(41.88583), BigDecimal.valueOf(-87.63094)),
                buildStation("Washington/Wabash", BigDecimal.valueOf(41.88322), BigDecimal.valueOf(-87.62617)),
                buildStation("Adams/Wabash", BigDecimal.valueOf(41.87937), BigDecimal.valueOf(-87.62595)),
                buildStation("Harold Washington Library", BigDecimal.valueOf(41.87615), BigDecimal.valueOf(-87.62859)),
                buildStation("LaSalle/Van Buren", BigDecimal.valueOf(41.87686), BigDecimal.valueOf(-87.63169)),
                buildStation("Quincy/Wells", BigDecimal.valueOf(41.87886), BigDecimal.valueOf(-87.63378)),
                buildStation("Washington/Wells", BigDecimal.valueOf(41.88267), BigDecimal.valueOf(-87.63361)),
                buildStation("Merchandise Mart", BigDecimal.valueOf(41.88847), BigDecimal.valueOf(-87.63375)),
                buildStation("Chicago (Red Line)", BigDecimal.valueOf(41.89681), BigDecimal.valueOf(-87.62808))
        );

        persistStations(fallbackStations);
        log.info("Successfully seeded {} fallback CTA stations", fallbackStations.size());
    }

    private void persistStations(List<PointOfInterest> stations) {
        pointOfInterestRepository.saveAll(stations);

        List<Long> ids = stations.stream()
                .map(PointOfInterest::getId)
                .filter(Objects::nonNull)
                .toList();

        if (!ids.isEmpty()) {
            pointOfInterestRepository.markAsStations(ids);
        }
    }

    private PointOfInterest buildStation(String name, BigDecimal latitude, BigDecimal longitude) {
        return PointOfInterest.builder()
                .poiName(name)
                .latitude(latitude)
                .longitude(longitude)
                .points(100)
                .build();
    }
}

