package com.hackathon.chica_go.service;

import com.hackathon.chica_go.dto.StampBookEntryRequest;
import com.hackathon.chica_go.dto.StampBookEntryResponse;
import com.hackathon.chica_go.model.*;
import com.hackathon.chica_go.repository.PointOfInterestRepository;
import com.hackathon.chica_go.repository.ProfileRepository;
import com.hackathon.chica_go.repository.StampBookEntryRepository;
import com.hackathon.chica_go.repository.StampBookRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PointOfInterestService {

    private final ProfileService profileService;
    private final ScoreCalculator scoreCalculator = new ScoreCalculator();
    private final ProfileRepository profileRepository;
    private final PointOfInterestRepository pointOfInterestRepository;
    private final StampBookEntryRepository stampBookEntryRepository;
    private final StampBookRepository stampBookRepository;
    private final StampBookService stampBookService;

    public List<PointOfInterest> getAllPois() {
        return pointOfInterestRepository.findAll();
    }

    public PointOfInterest getPoiById(Long id) {
        return pointOfInterestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("POI not found: " + id));
    }

    public PointOfInterest createPoi(PointOfInterest poi) {
        return pointOfInterestRepository.save(poi);
    }

    public PointOfInterest updatePoi(Long id, PointOfInterest updates) {
        PointOfInterest existing = getPoiById(id);
        if (updates.getPoiName() != null) existing.setPoiName(updates.getPoiName());
        if (updates.getLatitude() != null) existing.setLatitude(updates.getLatitude());
        if (updates.getLongitude() != null) existing.setLongitude(updates.getLongitude());
        existing.setPoints(updates.getPoints());
        return pointOfInterestRepository.save(existing);
    }

    public void deletePoi(Long id) {
        if (!pointOfInterestRepository.existsById(id)) {
            throw new EntityNotFoundException("POI not found: " + id);
        }
        pointOfInterestRepository.deleteById(id);
    }

    public List<PointOfInterest> getNearbyPois(Long stationId) {
        return pointOfInterestRepository.findByStationId(stationId)
                .stream()
                .filter(poi -> !poi.getId().equals(stationId)) // Exclude the station itself
                .toList();
    }

    /*
    Gets the associated point of interest if it exists, the profile that's checking in, and the profile's stamp book
    Checks if the profile has been there before, and adds a stamp if it has.
    Also adds points to the profile based on whether or not they've visited before
    Returns a DTO of the success response
    */
    public CheckInResultDTO checkInProfile(long userId, Long poiId) {

        PointOfInterest poi = pointOfInterestRepository.findById(poiId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Profile foundProfile = profileRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "profile not found"));
        StampBook stampBook = stampBookRepository.findByProfileId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "stampBook not found"));

        boolean isFirstVisit = profileService.visitedPoi(foundProfile.getId(), poi.getId());

        StampBookEntryRequest stampBookEntryRequest = new StampBookEntryRequest(poi.getId(), poi.getId(), stampBook.getId());

        StampBookEntryResponse entryResponse = stampBookService.addStamp(stampBookEntryRequest);

        int pointsEarned = scoreCalculator.calculatePoints(foundProfile.getWeeklyScore(), isFirstVisit);

        foundProfile.addPoints(pointsEarned);

        StampBookEntry addedEntry = stampBookEntryRepository.findById(entryResponse.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        addedEntry.setVisitedAt(LocalDateTime.now());

        return new CheckInResultDTO(pointsEarned, foundProfile.getWeeklyScore(), isFirstVisit);
    }

}
