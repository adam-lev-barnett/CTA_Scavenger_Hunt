package com.hackathon.chica_go.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response structure from Overpass API
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OverpassResponse {
    private String version;
    private String generator;
    private Osm3s osm3s;
    private List<Element> elements;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Osm3s {
        private String timestamp_osm_base;
        private String copyright;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Element {
        private String type; // "node", "way", "relation"
        private Long id;
        private Double lat;
        private Double lon;
        private Map<String, String> tags;
    }
}

