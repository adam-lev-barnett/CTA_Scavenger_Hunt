package com.hackathon.chica_go.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for station data from Overpass API
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OverpassStationDTO {
    private Long id;
    private String name;
    private BigDecimal lat;
    private BigDecimal lon;
    private String type; // "node", "way", "relation"

    // Optional tags from Overpass
    private String railway; // "station", "stop", etc.
    private String operator;
    private String network;
}

