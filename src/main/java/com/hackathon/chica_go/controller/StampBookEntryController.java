package com.hackathon.chica_go.controller;

import com.hackathon.chica_go.model.StampBookEntry;
import com.hackathon.chica_go.service.StampBookEntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stamp-book-entries")
@RequiredArgsConstructor
public class StampBookEntryController {

    private final StampBookEntryService stampBookEntryService;

    /**
     * GET /stamp-book-entries/{entryId}
     */
    @GetMapping("/{entryId}")
    public ResponseEntity<StampBookEntry> getEntry(@PathVariable Long entryId) {
        return ResponseEntity.ok(stampBookEntryService.getEntry(entryId));
    }

    /**
     * GET /stamp-book-entries/stamp-book/{stampBookId}
     */
    @GetMapping("/stamp-book/{stampBookId}")
    public ResponseEntity<List<StampBookEntry>> getEntriesByStampBook(@PathVariable Long stampBookId) {
        return ResponseEntity.ok(stampBookEntryService.getEntriesByStampBook(stampBookId));
    }

    /**
     * GET /stamp-book-entries/stamp-book/{stampBookId}/visited
     */
    @GetMapping("/stamp-book/{stampBookId}/visited")
    public ResponseEntity<List<StampBookEntry>> getVisitedEntries(@PathVariable Long stampBookId) {
        return ResponseEntity.ok(stampBookEntryService.getVisitedEntries(stampBookId));
    }

    /**
     * GET /stamp-book-entries/stamp-book/{stampBookId}/poi/{poiId}
     */
    @GetMapping("/stamp-book/{stampBookId}/poi/{poiId}")
    public ResponseEntity<StampBookEntry> getEntryByStampBookAndPoi(
            @PathVariable Long stampBookId,
            @PathVariable Long poiId) {
        return ResponseEntity.ok(stampBookEntryService.getEntryByStampBookAndPoi(stampBookId, poiId));
    }

    /**
     * GET /stamp-book-entries/stamp-book/{stampBookId}/poi/{poiId}/visited
     */
    @GetMapping("/stamp-book/{stampBookId}/poi/{poiId}/visited")
    public ResponseEntity<Boolean> hasVisited(
            @PathVariable Long stampBookId,
            @PathVariable Long poiId) {
        return ResponseEntity.ok(stampBookEntryService.hasVisited(stampBookId, poiId));
    }

    /**
     * GET /stamp-book-entries/stamp-book/{stampBookId}/count
     */
    @GetMapping("/stamp-book/{stampBookId}/count")
    public ResponseEntity<Long> countEntries(@PathVariable Long stampBookId) {
        return ResponseEntity.ok(stampBookEntryService.countEntries(stampBookId));
    }

    /**
     * DELETE /stamp-book-entries/{entryId}
     */
    @DeleteMapping("/{entryId}")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long entryId) {
        stampBookEntryService.deleteEntry(entryId);
        return ResponseEntity.noContent().build();
    }
}
