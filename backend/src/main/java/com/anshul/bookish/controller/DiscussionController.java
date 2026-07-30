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

        boolean spoilerFlag = Boolean.TRUE.equals(body.get("isSpoiler")) || Boolean.TRUE.equals(body.get("spoiler"));

        Discussion d = Discussion.builder()
                .title((String) body.get("title"))
                .body((String) body.get("body"))
                .scope((String) body.getOrDefault("scope", "BOOK"))
                .chapterNumber(body.get("chapterNumber") != null ? (Integer) body.get("chapterNumber") : null)
                .isSpoiler(spoilerFlag)
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

    // ── Update a discussion (author only) ─────────────────────────────────────

    @PutMapping("/discussions/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> updateDiscussion(
            @PathVariable UUID id,
            @RequestBody  Map<String, Object> body,
            @AuthenticationPrincipal Users principal) {

        if (principal == null) return ResponseEntity.status(401).build();

        return discussionRepo.findById(id).map(d -> {
            if (d.getAuthor() == null || !String.valueOf(d.getAuthor().getId()).equals(String.valueOf(principal.getId())))
                return ResponseEntity.status(403).build();

            if (body.containsKey("title")) d.setTitle((String) body.get("title"));
            if (body.containsKey("body")) d.setBody((String) body.get("body"));
            if (body.containsKey("scope")) d.setScope((String) body.get("scope"));
            if (body.containsKey("chapterNumber")) {
                Object ch = body.get("chapterNumber");
                d.setChapterNumber(ch != null && !ch.toString().isEmpty() ? Integer.parseInt(ch.toString()) : null);
            }
            if (body.containsKey("isSpoiler") || body.containsKey("spoiler")) {
                boolean spoilerFlag = Boolean.TRUE.equals(body.get("isSpoiler")) || Boolean.TRUE.equals(body.get("spoiler"));
                d.setSpoiler(spoilerFlag);
            }

            return ResponseEntity.ok(discussionRepo.save(d));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ── Delete a discussion (author only) ─────────────────────────────────────
    @DeleteMapping("/discussions/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deleteDiscussion(
            @PathVariable UUID id,
            @AuthenticationPrincipal Users principal) {

        if (principal == null) return ResponseEntity.status(401).build();

        return discussionRepo.findById(id).map(d -> {
            if (d.getAuthor() == null || !String.valueOf(d.getAuthor().getId()).equals(String.valueOf(principal.getId())))
                return ResponseEntity.status(403).build();
            discussionRepo.delete(d);
            return ResponseEntity.noContent().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ── Add a comment ──────────────────────────────────────────────────────────

    @PostMapping("/discussions/{id}/comments")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> addComment(
            @PathVariable UUID id,
            @RequestBody  Map<String, Object> body,
            @AuthenticationPrincipal Users principal) {

        if (principal == null) return ResponseEntity.status(401).build();

        return discussionRepo.findById(id).map(d -> {
            boolean spoilerFlag = Boolean.TRUE.equals(body.get("isSpoiler")) || Boolean.TRUE.equals(body.get("spoiler"));
            Comment c = Comment.builder()
                    .body((String) body.get("body"))
                    .isSpoiler(spoilerFlag)
                    .discussion(d)
                    .author(principal)
                    .build();
            return (ResponseEntity<?>) ResponseEntity.status(201).body(commentRepo.save(c));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ── Update a comment (author only) ────────────────────────────────────────

    @PutMapping("/comments/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> updateComment(
            @PathVariable UUID id,
            @RequestBody  Map<String, Object> body,
            @AuthenticationPrincipal Users principal) {

        if (principal == null) return ResponseEntity.status(401).build();

        return commentRepo.findById(id).map(c -> {
            if (c.getAuthor() == null || !String.valueOf(c.getAuthor().getId()).equals(String.valueOf(principal.getId())))
                return ResponseEntity.status(403).build();

            if (body.containsKey("body")) c.setBody((String) body.get("body"));
            if (body.containsKey("isSpoiler") || body.containsKey("spoiler")) {
                boolean spoilerFlag = Boolean.TRUE.equals(body.get("isSpoiler")) || Boolean.TRUE.equals(body.get("spoiler"));
                c.setSpoiler(spoilerFlag);
            }

            return ResponseEntity.ok(commentRepo.save(c));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ── Delete a comment (author only) ────────────────────────────────────────

    @DeleteMapping("/comments/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deleteComment(
            @PathVariable UUID id,
            @AuthenticationPrincipal Users principal) {

        if (principal == null) return ResponseEntity.status(401).build();

        return commentRepo.findById(id).map(c -> {
            if (c.getAuthor() == null || !String.valueOf(c.getAuthor().getId()).equals(String.valueOf(principal.getId())))
                return ResponseEntity.status(403).build();
            commentRepo.delete(c);
            return ResponseEntity.noContent().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
