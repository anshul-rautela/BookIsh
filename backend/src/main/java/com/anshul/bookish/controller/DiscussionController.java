package com.anshul.bookish.controller;

import com.anshul.bookish.entity.*;
import com.anshul.bookish.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * /books/{bookId}/discussions          – list + create discussions for a book
 * /discussions/{id}                    – get single discussion (with comments)
 * /discussions/{id}/comments           – add a comment
 * /discussions/{id}                    DELETE
 * /comments/{id}                       DELETE
 */
@RestController
@RequiredArgsConstructor
public class DiscussionController {

    private final DiscussionRepository discussionRepo;
    private final CommentRepository    commentRepo;
    private final BookRepository       bookRepo;

    // ── List discussions for a book ────────────────────────────────────────────

    @GetMapping("/books/{openLibraryId}/discussions")
    public ResponseEntity<Page<Discussion>> listDiscussions(
            @PathVariable String openLibraryId,
            @RequestParam(defaultValue = "BOOK") String scope,
            @RequestParam(required = false)       Integer chapter,
            @RequestParam(defaultValue = "0")     int page,
            @RequestParam(defaultValue = "20")    int size) {

        Pageable pg = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Discussion> result = (scope.equals("CHAPTER") && chapter != null)
                ? discussionRepo.findByBook_OpenLibraryIdAndScopeAndChapterNumber(openLibraryId, scope, chapter, pg)
                : discussionRepo.findByBook_OpenLibraryIdAndScope(openLibraryId, scope, pg);

        return ResponseEntity.ok(result);
    }

    // ── Create a discussion ────────────────────────────────────────────────────

    @PostMapping("/books/{openLibraryId}/discussions")
    public ResponseEntity<Discussion> createDiscussion(
            @PathVariable String openLibraryId,
            @RequestBody  Map<String, Object> body,
            @AuthenticationPrincipal Users principal) {

        // Lazily create a local Book record if not yet present
        Book book = bookRepo.findByOpenLibraryId(openLibraryId).orElseGet(() -> {
            Book b = Book.builder()
                    .openLibraryId(openLibraryId)
                    .title((String) body.getOrDefault("bookTitle", ""))
                    .build();
            return bookRepo.save(b);
        });

        Discussion d = Discussion.builder()
                .title((String) body.get("title"))
                .body((String) body.get("body"))
                .scope((String) body.getOrDefault("scope", "BOOK"))
                .chapterNumber(body.get("chapterNumber") != null ? (Integer) body.get("chapterNumber") : null)
                .isSpoiler(Boolean.TRUE.equals(body.get("isSpoiler")))
                .book(book)
                .author(principal)
                .build();

        return ResponseEntity.status(201).body(discussionRepo.save(d));
    }

    // ── Get a single discussion ────────────────────────────────────────────────

    @GetMapping("/discussions/{id}")
    public ResponseEntity<Discussion> getDiscussion(@PathVariable UUID id) {
        return discussionRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Delete a discussion (author only) ─────────────────────────────────────
    @DeleteMapping("/discussions/{id}")
    public ResponseEntity<?> deleteDiscussion(
            @PathVariable UUID id,
            @AuthenticationPrincipal Users principal) {

        return discussionRepo.findById(id).map(d -> {
            if (!d.getAuthor().getId().equals(principal.getId()))
                return ResponseEntity.status(403).build();
            discussionRepo.delete(d);
            return ResponseEntity.noContent().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
    // ── Add a comment ──────────────────────────────────────────────────────────

    @PostMapping("/discussions/{id}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable UUID id,
            @RequestBody  Map<String, Object> body,
            @AuthenticationPrincipal Users principal) {

        return discussionRepo.findById(id).map(d -> {
            Comment c = Comment.builder()
                    .body((String) body.get("body"))
                    .isSpoiler(Boolean.TRUE.equals(body.get("isSpoiler")))
                    .discussion(d)
                    .author(principal)
                    .build();
            return (ResponseEntity<?>) ResponseEntity.status(201).body(commentRepo.save(c));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ── Delete a comment (author only) ────────────────────────────────────────

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(
            @PathVariable UUID id,
            @AuthenticationPrincipal Users principal) {

        return commentRepo.findById(id).map(c -> {
            if (!c.getAuthor().getId().equals(principal.getId()))
                return ResponseEntity.status(403).build();
            commentRepo.delete(c);
            return ResponseEntity.noContent().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
