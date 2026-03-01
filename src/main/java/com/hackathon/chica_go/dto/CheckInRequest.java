package com.hackathon.chica_go.dto;

import java.math.BigDecimal;

public record CheckInRequest(Long userId, Long locationId, BigDecimal userLat, BigDecimal userLng) {}
