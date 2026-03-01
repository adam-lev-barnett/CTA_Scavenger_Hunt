package com.hackathon.chica_go.controller;

import com.hackathon.chica_go.dto.CheckInRequest;
import com.hackathon.chica_go.model.CheckInResultDTO;
import com.hackathon.chica_go.service.PointOfInterestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * Check-in controller - provides /checkin endpoint expected by frontend
 */
@RestController
@RequiredArgsConstructor
public class CheckInController {

    private final PointOfInterestService pointOfInterestService;

    /**
     * POST /checkin - Check in at a location
     * Expected by frontend: POST /checkin
     */
    @PostMapping("/checkin")
    public ResponseEntity<CheckInResultDTO> checkIn(@RequestBody CheckInRequest checkInRequest) {
        return ResponseEntity.ok(
                pointOfInterestService.checkInProfile(checkInRequest.userId(), checkInRequest.poiId())
        );
    }
}

