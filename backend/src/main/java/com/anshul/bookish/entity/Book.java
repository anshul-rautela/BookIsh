package com.anshul.bookish.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * A lightweight local record that exists only to anchor discussions
 * to a specific OpenLibrary work. All display data (title, cover, etc.)
 * is fetched live from the OpenLibrary API.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "book")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** e.g. "/works/OL45804W"  – used as the external identifier */
    @Column(name = "open_library_id", unique = true, nullable = false, length = 60)
    private String openLibraryId;

    /** Cached title for convenience */
    @Column(length = 300)
    private String title;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Discussion> discussions = new ArrayList<>();
}
