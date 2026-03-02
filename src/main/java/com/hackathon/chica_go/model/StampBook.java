package com.hackathon.chica_go.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "stamp_books")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StampBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Getter private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false, unique = true,
                foreignKey = @ForeignKey(name = "fk_stamp_books_user"))
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Profile profile;

    @JsonIgnore
    @OneToMany(mappedBy = "stampBook", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<StampBookEntry> entries;
}
