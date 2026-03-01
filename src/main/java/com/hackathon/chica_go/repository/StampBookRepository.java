package com.hackathon.chica_go.repository;

import com.hackathon.chica_go.model.StampBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StampBookRepository extends JpaRepository<StampBook, Long> {

    // Primary lookup — traverse StampBook.profile.id
    Optional<StampBook> findByProfileId(Long profileId);

    boolean existsByProfileId(Long profileId);
}
