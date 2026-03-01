package com.hackathon.chica_go.controller;

import com.hackathon.chica_go.dto.CheckInRequest;
import com.hackathon.chica_go.model.CheckInResultDTO;
import com.hackathon.chica_go.model.PointOfInterest;
import com.hackathon.chica_go.service.PointOfInterestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/poi")
@RequiredArgsConstructor
public class PointOfInterestController {

    private final PointOfInterestService pointOfInterestService;

    /** GET /poi */
    @GetMapping
    public ResponseEntity<List<PointOfInterest>> getAllPois() {
        return ResponseEntity.ok(pointOfInterestService.getAllPois());
    }

    /** GET /poi/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<PointOfInterest> getPoiById(@PathVariable Long id) {
        return ResponseEntity.ok(pointOfInterestService.getPoiById(id));
    }

    /** POST /poi */
    @PostMapping
    public ResponseEntity<PointOfInterest> createPoi(@RequestBody PointOfInterest poi) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pointOfInterestService.createPoi(poi));
    }

    /** PUT /poi/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<PointOfInterest> updatePoi(@PathVariable Long id, @RequestBody PointOfInterest updates) {
        return ResponseEntity.ok(pointOfInterestService.updatePoi(id, updates));
    }

    /** DELETE /poi/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePoi(@PathVariable Long id) {
        pointOfInterestService.deletePoi(id);
        return ResponseEntity.noContent().build();
    }

    /** POST /poi/check-in */
    @PostMapping("/check-in")
    public ResponseEntity<CheckInResultDTO> checkInProfile(@RequestBody CheckInRequest checkInRequest) {
        return ResponseEntity.ok(
                pointOfInterestService.checkInProfile(checkInRequest.userId(), checkInRequest.poiId())
        );
    }
}
