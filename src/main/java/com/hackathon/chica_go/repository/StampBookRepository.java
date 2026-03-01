package com.hackathon.chica_go.repository;

import com.hackathon.chica_go.model.StampBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StampBookRepository extends JpaRepository<StampBook, Long> {

    // Primary lookup — every service call starts with a user ID
    Optional<StampBook> findByProfileId(Long profileId);

    boolean existsByProfileId(Long profileId);
}
