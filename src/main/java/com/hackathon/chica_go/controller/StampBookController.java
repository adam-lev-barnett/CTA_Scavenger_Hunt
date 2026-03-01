package com.hackathon.chica_go.controller;

import com.hackathon.chica_go.dto.StampBookEntryRequest;
import com.hackathon.chica_go.dto.StampBookEntryResponse;
import com.hackathon.chica_go.model.StampBook;
import com.hackathon.chica_go.model.StampBookEntry;
import com.hackathon.chica_go.service.StampBookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stamp-books")
@RequiredArgsConstructor
public class StampBookController {

    private final StampBookService stampBookService;

    /**
     * GET /stamp-books/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<StampBook> getStampBook(@PathVariable Long userId) {
        return ResponseEntity.ok(stampBookService.getStampBook(userId));
    }

    /**
     * GET /stamp-books/{stampBookId}/entries
     */
    @GetMapping("/{stampBookId}/entries")
    public ResponseEntity<List<StampBookEntry>> getAllEntries(@PathVariable Long stampBookId) {
        return ResponseEntity.ok(stampBookService.getAllEntries(stampBookId));
    }

    /**
     * GET /stamp-books/{stampBookId}/entries/{poiId}
     */
    @GetMapping("/{stampBookId}/entries/{poiId}")
    public ResponseEntity<StampBookEntry> getEntry(
            @PathVariable Long stampBookId,
            @PathVariable Long poiId) {
        return ResponseEntity.ok(stampBookService.getEntry(stampBookId, poiId));
    }

    /**
     * POST /stamp-books/entries
     */
    @PostMapping("/entries")
    public ResponseEntity<StampBookEntryResponse> addStamp(@RequestBody StampBookEntryRequest request) {
        return ResponseEntity.ok(stampBookService.addStamp(request));
    }

    /**
     * GET /stamp-books/{stampBookId}/entries/{poiId}/exists
     */
    @GetMapping("/{stampBookId}/entries/{poiId}/exists")
    public ResponseEntity<Boolean> hasEntry(
            @PathVariable Long stampBookId,
            @PathVariable Long poiId) {
        return ResponseEntity.ok(stampBookService.hasEntry(stampBookId, poiId));
    }
}
