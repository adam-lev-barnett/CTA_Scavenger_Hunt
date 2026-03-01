package com.hackathon.chica_go.service;

import com.hackathon.chica_go.dto.OverpassResponse;
import com.hackathon.chica_go.dto.OverpassStationDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

// Based on AI generation, worked on by team
/**
 * Service to fetch CTA L station data from Overpass API (OpenStreetMap)
 */
@Service
@Slf4j
public class OverpassApiService {

    private final WebClient webClient;

    @Value("${overpass.api.url}")
    private String overpassApiUrl;

    public OverpassApiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    /**
     * Fetch all CTA L stations in Chicago using Overpass API
     *
     * Bounding box for Chicago Loop area:
     * South: 41.8781, North: 41.8858, West: -87.6325, East: -87.6245
     *
     * For broader Chicago area, use:
     * South: 41.8, North: 42.0, West: -87.7, East: -87.6
     */
    public List<OverpassStationDTO> fetchCTAStations() {
        log.info("Fetching CTA L stations from Overpass API...");

        // Overpass QL query for CTA stations
        // This searches for railway stations operated by CTA in Chicago
        String query = """
                [out:json][timeout:25];
                (
                  node["railway"="station"]["network"="CTA"]["operator"="CTA"](41.7,−87.8,42.1,−87.5);
                  node["railway"="stop"]["network"="CTA"]["operator"="CTA"](41.7,−87.8,42.1,−87.5);
                );
                out body;
                >;
                out skel qt;
                """;

        try {
            OverpassResponse response = webClient
                    .post()
                    .uri(overpassApiUrl)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .bodyValue("data=" + query)
                    .retrieve()
                    .bodyToMono(OverpassResponse.class)
                    .block();

            if (response == null || response.getElements() == null) {
                log.warn("No data received from Overpass API");
                return List.of();
            }

            List<OverpassStationDTO> stations = response.getElements().stream()
                    .filter(element -> element.getTags() != null)
                    .map(this::mapToStationDTO)
                    .collect(Collectors.toList());

            log.info("Successfully fetched {} CTA stations", stations.size());
            return stations;

        } catch (Exception e) {
            log.error("Error fetching CTA stations from Overpass API", e);
            throw new RuntimeException("Failed to fetch CTA stations", e);
        }
    }

    /**
     * Alternative method with simpler query for testing
     */
    public List<OverpassStationDTO> fetchCTAStationsSimple() {
        log.info("Fetching CTA L stations from Overpass API (simple query)...");

        // Simpler query - just look for railway stations in Chicago area
        String query = """
                [out:json][timeout:25];
                node["railway"~"station|halt"]["name"~".*",i](41.7,-87.8,42.1,-87.5);
                out body;
                """;

        try {
            OverpassResponse response = webClient
                    .post()
                    .uri(overpassApiUrl)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .bodyValue("data=" + query)
                    .retrieve()
                    .bodyToMono(OverpassResponse.class)
                    .block();

            if (response == null || response.getElements() == null) {
                log.warn("No data received from Overpass API");
                return List.of();
            }

            List<OverpassStationDTO> stations = response.getElements().stream()
                    .filter(element -> element.getTags() != null)
                    .filter(element -> {
                        String name = element.getTags().get("name");
                        return name != null && !name.isEmpty();
                    })
                    .map(this::mapToStationDTO)
                    .collect(Collectors.toList());

            log.info("Successfully fetched {} stations", stations.size());
            return stations;

        } catch (Exception e) {
            log.error("Error fetching stations from Overpass API", e);
            throw new RuntimeException("Failed to fetch stations", e);
        }
    }

    private OverpassStationDTO mapToStationDTO(OverpassResponse.Element element) {
        return OverpassStationDTO.builder()
                .id(element.getId())
                .name(element.getTags().getOrDefault("name", "Unknown Station"))
                .lat(BigDecimal.valueOf(element.getLat()))
                .lon(BigDecimal.valueOf(element.getLon()))
                .type(element.getType())
                .railway(element.getTags().get("railway"))
                .operator(element.getTags().get("operator"))
                .network(element.getTags().get("network"))
                .build();
    }
}

