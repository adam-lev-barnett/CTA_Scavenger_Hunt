package com.hackathon.chica_go.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;

public class Station extends PointOfInterest{
    HashSet<PointOfInterest> pointsOfInterest;
    private CheckIn checkIn;

    // Figure out how to automatically pull data/update from the database


}
