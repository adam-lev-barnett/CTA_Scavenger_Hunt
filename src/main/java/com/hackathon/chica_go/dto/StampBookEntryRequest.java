package com.hackathon.chica_go.dto;

import jakarta.validation.constraints.NotNull;

// Request includes a stampBookId for lookups for individual stampBooks
public record StampBookEntryRequest(@NotNull long id, @NotNull long poiId, @NotNull long stampBookId) {}
