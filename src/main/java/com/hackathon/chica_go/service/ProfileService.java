package com.hackathon.chica_go.service;

import com.hackathon.chica_go.model.*;
import com.hackathon.chica_go.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.Transient;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final StampBookRepository stampBookRepository;
    private final PointOfInterestRepository poiRepository;
    private final StampBookEntryRepository stampBookEntryRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Returns a user's profile or throws if not found.
     * Maps to GET /users/{userId}
     */
    public Profile getProfile(Long userId) {
        return profileRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
    }


    /**
     * Updates a user's username.
     * Maps to PATCH /users/{userId}
     */
    public Profile updateUsername(Long userId, String newUsername) {
        if (profileRepository.existsByUsername(newUsername)) {
            throw new IllegalArgumentException("Username already taken: " + newUsername);
        }
        Profile profile = getProfile(userId);
        profile.setUsername(newUsername);
        return profileRepository.save(profile);
    }

    /**
     * Registers a new user: creates their Profile and seeds an empty StampBook
     * with one unvisited entry for every POI currently in the database.
     */

    public Profile register(String username, String email, String rawPassword) {
        if (profileRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (profileRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        Profile profile = Profile.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .build();
        profile = profileRepository.save(profile);

        initializeStampBook(profile);

        return profile;
    }


    /**
     * Creates a StampBook for the new user and populates it with an unvisited
     * entry for every point of interest currently seeded in the database.
     */
    private void initializeStampBook(Profile profile) {
        StampBook stampBook = StampBook.builder()
                .profile(profile)
                .build();
        stampBook = stampBookRepository.save(stampBook);

        List<PointOfInterest> allLocations = poiRepository.findAll();
        StampBook finalStampBook = stampBook;
        List<StampBookEntry> entries = allLocations.stream()
                .map(poi -> StampBookEntry.builder()
                        .stampBook(finalStampBook)
                        .pointOfInterest(poi)
                        .build())
                .toList();
        stampBookEntryRepository.saveAll(entries);
    }

    @Transient
    public Boolean visitedPoi(Long userId, Long poiId) {
        return stampBookRepository.findByProfileId(userId)
                .map(stampBook -> stampBookEntryRepository
                        .existsByStampBookIdAndPointOfInterestIdAndVisitedTrue(stampBook.getId(), poiId))
                .orElse(false);
    }

}
