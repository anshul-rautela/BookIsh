package com.anshul.bookish.repository;

import com.anshul.bookish.entity.Discussion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DiscussionRepository extends JpaRepository<Discussion, UUID> {

    Page<Discussion> findByBook_OpenLibraryIdAndScope(String openLibraryId, String scope, Pageable pageable);

    Page<Discussion> findByBook_OpenLibraryIdAndScopeAndChapterNumber(
            String openLibraryId, String scope, int chapterNumber, Pageable pageable);

    List<Discussion> findByAuthor_IdOrderByCreatedAtDesc(UUID authorId);
}
