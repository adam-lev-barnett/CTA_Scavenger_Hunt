package com.hackathon.chica_go.service;

import com.hackathon.chica_go.dto.StampBookEntryRequest;
import com.hackathon.chica_go.dto.StampBookEntryResponse;
import com.hackathon.chica_go.model.PointOfInterest;
import com.hackathon.chica_go.model.StampBook;
import com.hackathon.chica_go.model.StampBookEntry;
import com.hackathon.chica_go.repository.PointOfInterestRepository;
import com.hackathon.chica_go.repository.StampBookEntryRepository;
import com.hackathon.chica_go.repository.StampBookRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.awt.*;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class StampBookService {

    private final StampBookRepository stampBookRepository;
    private final StampBookEntryRepository stampBookEntryRepository;
    private final PointOfInterestRepository pointOfInterestRepository;

    /**
     * Fetches the StampBook belonging to the given user.
     */
    public StampBook getStampBook(Long userId) {
        return stampBookRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("StampBook not found for user: " + userId));
    }

    /**
     * Returns all entries in a stamp book — used to render the full stamp grid.
     */
    public List<StampBookEntry> getAllEntries(Long stampBookId) {
        return stampBookEntryRepository.findByStampBookId(stampBookId);
    }

    /**
     * Returns the single StampBookEntry for a specific location within a stamp book.
     * This is the entry point for check-in logic.
     */
    public StampBookEntry getEntry(Long stampBookId, Long poiId) {
        return stampBookEntryRepository
                .findByStampBookIdAndPointOfInterestId(stampBookId, poiId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No entry found for stampBook=" + stampBookId + ", poi=" + poiId));
    }

    public StampBookEntryResponse addStamp(StampBookEntryRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "StampBookEntryRequest cannot be null"
            );
        }

        if (stampBookEntryRepository.existsById(request.id())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Stamp book entry already exists"
            );
        }

        StampBook stampBook = stampBookRepository.findById(request.stampBookId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "StampBook not found"
                ));

        PointOfInterest poi = pointOfInterestRepository.findById(request.poiId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "PointOfInterest not found"
                ));

        StampBookEntry entry = StampBookEntry.builder()
                .stampBook(stampBook)
                .pointOfInterest(poi)
                .build();

        StampBookEntry saved = stampBookEntryRepository.save(entry);

        return new StampBookEntryResponse(
                saved.getId(),
                poi.getId(),
                stampBook.getId()
        );
    }

    public Boolean hasEntry(Long stampBookId, Long poiId) {
        try {
            this.getEntry(stampBookId, poiId);
            return true;
        } catch (EntityNotFoundException e) {
            return false;
        }
    }
}
