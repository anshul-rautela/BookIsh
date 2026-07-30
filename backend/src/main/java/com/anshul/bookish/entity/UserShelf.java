package com.anshul.bookish.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.UUID;

/**
 * Tracks which books a user has placed on their reading shelf.
 * Status values: WANT_TO_READ | READING | FINISHED
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "user_shelf",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "open_library_id"}))
public class UserShelf {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private Users user;

    /** The OpenLibrary work ID, e.g. "/works/OL45804W" */
    @Column(name = "open_library_id", nullable = false, length = 60)
    private String openLibraryId;

    /** Cached book title for display without another API call */
    @Column(length = 300)
    private String bookTitle;

    /** Cached cover URL */
    @Column(length = 500)
    private String coverUrl;

    @Column(nullable = false, length = 20)
    private String status;       // WANT_TO_READ | READING | FINISHED

    private Integer currentChapter;
}
