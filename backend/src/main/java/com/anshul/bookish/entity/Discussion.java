package com.anshul.bookish.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Discussion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    /** BOOK or CHAPTER */
    @Column(nullable = false)
    private String scope = "BOOK";

    private Integer chapterNumber;

    @com.fasterxml.jackson.annotation.JsonProperty("isSpoiler")
    private boolean isSpoiler = false;

    @CreationTimestamp
    private Instant createdAt;

    // ── Relations ──────────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    @JsonIgnoreProperties({"discussions", "hibernateLazyInitializer", "handler"})
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"shelf", "discussions", "books", "password", "hibernateLazyInitializer", "handler"})
    private Users author;

    @OneToMany(mappedBy = "discussion", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @JsonIgnoreProperties("discussion")
    private List<Comment> comments = new ArrayList<>();
}
