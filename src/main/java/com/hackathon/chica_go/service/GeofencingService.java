package com.hackathon.chica_go.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Service to validate user proximity to locations (geofencing)
 * Uses Haversine formula for distance calculation
 */
@Service
@Slf4j
public class GeofencingService {

    @Value("${geofence.radius.meters:150}")
    private double radiusMeters;

    private static final double EARTH_RADIUS_METERS = 6371000.0; // Earth's radius in meters

    /**
     * Check if user is within allowed radius of the target location
     *
     * @param userLat User's latitude
     * @param userLng User's longitude
     * @param targetLat Target location's latitude
     * @param targetLng Target location's longitude
     * @return true if user is within geofence radius
     */
    public boolean isWithinGeofence(BigDecimal userLat, BigDecimal userLng,
                                     BigDecimal targetLat, BigDecimal targetLng) {
        double distance = calculateDistance(userLat, userLng, targetLat, targetLng);
        boolean withinFence = distance <= radiusMeters;

        log.debug("Geofence check: distance = {:.2f}m, radius = {:.2f}m, result = {}",
                distance, radiusMeters, withinFence);

        return withinFence;
    }

    /**
     * Calculate distance between two points using Haversine formula
     *
     * @return distance in meters
     */
    public double calculateDistance(BigDecimal lat1, BigDecimal lng1,
                                    BigDecimal lat2, BigDecimal lng2) {
        double dLat = Math.toRadians(lat2.doubleValue() - lat1.doubleValue());
        double dLng = Math.toRadians(lng2.doubleValue() - lng1.doubleValue());

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1.doubleValue())) *
                   Math.cos(Math.toRadians(lat2.doubleValue())) *
                   Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_METERS * c;
    }

    /**
     * Get the current configured geofence radius
     */
    public double getRadiusMeters() {
        return radiusMeters;
    }

    /**
     * Set geofence radius (useful for testing/demo mode)
     */
    public void setRadiusMeters(double radiusMeters) {
        log.info("Geofence radius updated from {} to {} meters", this.radiusMeters, radiusMeters);
        this.radiusMeters = radiusMeters;
    }
}

