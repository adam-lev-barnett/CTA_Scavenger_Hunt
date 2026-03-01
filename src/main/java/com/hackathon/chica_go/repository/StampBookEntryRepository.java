package com.hackathon.chica_go.repository;

import com.hackathon.chica_go.model.StampBookEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StampBookEntryRepository extends JpaRepository<StampBookEntry, Long> {

    // All entries for a stamp book — used to render the full stamp grid
    List<StampBookEntry> findByStampBookId(Long stampBookId);

    // Only the visited entries — used for score calculations
    List<StampBookEntry> findByStampBookIdAndVisitedTrue(Long stampBookId);

    // The single entry for a check-in — stamp_book + POI uniquely identifies it
    Optional<StampBookEntry> findByStampBookIdAndPointOfInterestId(Long stampBookId, Long pointOfInterestId);

    // Check-in guard: has this user already stamped this location?
    boolean existsByStampBookIdAndPointOfInterestIdAndVisitedTrue(Long stampBookId, Long pointOfInterestId);

    // Bulk insert support: how many entries already exist for a stamp book?
    // Used during registration to avoid re-seeding an existing book.
    @Query("SELECT COUNT(e) FROM StampBookEntry e WHERE e.stampBook.id = :stampBookId")
    long countByStampBookId(@Param("stampBookId") Long stampBookId);
}
