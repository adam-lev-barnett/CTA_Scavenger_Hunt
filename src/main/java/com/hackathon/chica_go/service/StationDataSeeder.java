package com.hackathon.chica_go.service;

import com.hackathon.chica_go.dto.OverpassStationDTO;
import com.hackathon.chica_go.model.Station;
import com.hackathon.chica_go.repository.StationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds the database with CTA station data on application startup
 * Only runs if the stations table is empty
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StationDataSeeder implements CommandLineRunner {

    private final StationRepository stationRepository;
    private final OverpassApiService overpassApiService;

    @Override
    public void run(String... args) {
        log.info("Checking if station data needs to be seeded...");

        long stationCount = stationRepository.count();

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
            List<Station> stations = stationDTOs.stream()
                    .map(dto -> Station.builder()
                            .stationName(dto.getName())
                            .latitude(dto.getLat())
                            .longitude(dto.getLon())
                            .build())
                    .toList();

            stationRepository.saveAll(stations);
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

        List<Station> fallbackStations = List.of(
                Station.builder()
                        .stationName("State/Lake")
                        .latitude(java.math.BigDecimal.valueOf(41.88574))
                        .longitude(java.math.BigDecimal.valueOf(-87.62773))
                        .build(),
                Station.builder()
                        .stationName("Clark/Lake")
                        .latitude(java.math.BigDecimal.valueOf(41.88583))
                        .longitude(java.math.BigDecimal.valueOf(-87.63094))
                        .build(),
                Station.builder()
                        .stationName("Washington/Wabash")
                        .latitude(java.math.BigDecimal.valueOf(41.88322))
                        .longitude(java.math.BigDecimal.valueOf(-87.62617))
                        .build(),
                Station.builder()
                        .stationName("Adams/Wabash")
                        .latitude(java.math.BigDecimal.valueOf(41.87937))
                        .longitude(java.math.BigDecimal.valueOf(-87.62595))
                        .build(),
                Station.builder()
                        .stationName("Harold Washington Library")
                        .latitude(java.math.BigDecimal.valueOf(41.87615))
                        .longitude(java.math.BigDecimal.valueOf(-87.62859))
                        .build(),
                Station.builder()
                        .stationName("LaSalle/Van Buren")
                        .latitude(java.math.BigDecimal.valueOf(41.87686))
                        .longitude(java.math.BigDecimal.valueOf(-87.63169))
                        .build(),
                Station.builder()
                        .stationName("Quincy/Wells")
                        .latitude(java.math.BigDecimal.valueOf(41.87886))
                        .longitude(java.math.BigDecimal.valueOf(-87.63378))
                        .build(),
                Station.builder()
                        .stationName("Washington/Wells")
                        .latitude(java.math.BigDecimal.valueOf(41.88267))
                        .longitude(java.math.BigDecimal.valueOf(-87.63361))
                        .build(),
                Station.builder()
                        .stationName("Merchandise Mart")
                        .latitude(java.math.BigDecimal.valueOf(41.88847))
                        .longitude(java.math.BigDecimal.valueOf(-87.63375))
                        .build(),
                Station.builder()
                        .stationName("Chicago (Red Line)")
                        .latitude(java.math.BigDecimal.valueOf(41.89681))
                        .longitude(java.math.BigDecimal.valueOf(-87.62808))
                        .build()
        );

        stationRepository.saveAll(fallbackStations);
        log.info("Successfully seeded {} fallback CTA stations", fallbackStations.size());
    }
}

