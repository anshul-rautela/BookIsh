package com.anshul.bookish.repository;

import com.anshul.bookish.entity.Discussion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DiscussionRepository extends JpaRepository<Discussion, UUID> {

    /** Eagerly loads book + author + all comments (and their authors) for the full thread view. */
    @EntityGraph(attributePaths = {"book", "author", "comments", "comments.author"})
    Optional<Discussion> findById(UUID id);

    @EntityGraph(attributePaths = {"book", "author"})
    Page<Discussion> findByBook_OpenLibraryIdAndScope(String openLibraryId, String scope, Pageable pageable);

    @EntityGraph(attributePaths = {"book", "author"})
    Page<Discussion> findByBook_OpenLibraryIdAndScopeAndChapterNumber(
            String openLibraryId, String scope, int chapterNumber, Pageable pageable);

    @EntityGraph(attributePaths = {"book", "author"})
    List<Discussion> findByAuthor_IdOrderByCreatedAtDesc(UUID authorId);
}
