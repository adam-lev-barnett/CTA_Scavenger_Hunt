package com.hackathon.chica_go.service;

import com.hackathon.chica_go.dto.StampBookEntryResponse;
import com.hackathon.chica_go.model.StampBookEntry;
import com.hackathon.chica_go.repository.StampBookEntryRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StampBookEntryService {

    private final StampBookEntryRepository stampBookEntryRepository;

    /**
     * Returns a single entry by its ID.
     * Maps to GET /stamp-book-entries/{entryId}
     */
    public StampBookEntry getEntry(Long entryId) {
        return stampBookEntryRepository.findById(entryId)
                .orElseThrow(() -> new EntityNotFoundException("StampBookEntry not found: " + entryId));
    }

    /**
     * Returns all entries for a given stamp book.
     * Maps to GET /stamp-book-entries/stamp-book/{stampBookId}
     */
    public List<StampBookEntry> getEntriesByStampBook(Long stampBookId) {
        return stampBookEntryRepository.findByStampBookId(stampBookId);
    }

    /**
     * Returns only the visited entries for a given stamp book.
     * Maps to GET /stamp-book-entries/stamp-book/{stampBookId}/visited
     */
    public List<StampBookEntry> getVisitedEntries(Long stampBookId) {
        return stampBookEntryRepository.findByStampBookIdAndVisitedTrue(stampBookId);
    }

    /**
     * Returns the entry for a specific POI within a stamp book.
     * Maps to GET /stamp-book-entries/stamp-book/{stampBookId}/poi/{poiId}
     */
    public StampBookEntry getEntryByStampBookAndPoi(Long stampBookId, Long poiId) {
        return stampBookEntryRepository.findByStampBookIdAndPointOfInterestId(stampBookId, poiId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No entry found for stampBook=" + stampBookId + ", poi=" + poiId));
    }

    /**
     * Returns whether a user has already stamped a specific POI.
     * Maps to GET /stamp-book-entries/stamp-book/{stampBookId}/poi/{poiId}/visited
     */
    public boolean hasVisited(Long stampBookId, Long poiId) {
        return stampBookEntryRepository.existsByStampBookIdAndPointOfInterestIdAndVisitedTrue(stampBookId, poiId);
    }

    /**
     * Returns the count of entries in a stamp book.
     * Maps to GET /stamp-book-entries/stamp-book/{stampBookId}/count
     */
    public long countEntries(Long stampBookId) {
        return stampBookEntryRepository.countByStampBookId(stampBookId);
    }

    /**
     * Deletes a single entry by its ID.
     * Maps to DELETE /stamp-book-entries/{entryId}
     */
    public void deleteEntry(Long entryId) {
        if (!stampBookEntryRepository.existsById(entryId)) {
            throw new EntityNotFoundException("StampBookEntry not found: " + entryId);
        }
        stampBookEntryRepository.deleteById(entryId);
    }
}
