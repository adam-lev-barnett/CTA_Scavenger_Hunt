package com.hackathon.chica_go.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

public final class DataValidation {

    private static <T> T require(Optional<T> optional, String message) {
        return optional.orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, message)
        );
    }

}
