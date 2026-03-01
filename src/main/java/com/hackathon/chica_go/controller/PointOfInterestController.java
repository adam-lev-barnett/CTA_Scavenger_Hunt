package com.hackathon.chica_go.controller;

import com.hackathon.chica_go.dto.CheckInRequest;
import com.hackathon.chica_go.model.CheckInResult;
import com.hackathon.chica_go.service.PointOfInterestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/poi")
@RequiredArgsConstructor
public class PointOfInterestController {
    private final PointOfInterestService pointOfInterestService;

    public CheckInResult checkInProfile(CheckInRequest checkInRequest) {
        return pointOfInterestService.checkInProfile(checkInRequest.userId(), checkInRequest.poiId());
    }


}
