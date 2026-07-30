package com.anshul.bookish.controller;

import com.anshul.bookish.entity.UserShelf;
import com.anshul.bookish.entity.Users;
import com.anshul.bookish.repository.UserShelfRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * /books/search   – proxy to OpenLibrary search API (public)
 * /books/{id}     – proxy to OpenLibrary works API (public)
 * /books/{id}/shelf – manage the authenticated user's shelf entry
 */
@Slf4j
@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BookController {

    private final UserShelfRepository shelfRepo;
    private final RestTemplate restTemplate;

    // ── OpenLibrary proxy ──────────────────────────────────────────────────────

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String q) {
        String url = "https://openlibrary.org/search.json?q=" + q + "&limit=20&fields=key,title,author_name,cover_i,first_publish_year";
        try {
            Map<?, ?> result = restTemplate.getForObject(url, Map.class);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("OpenLibrary search failed", e);
            return ResponseEntity.status(502).body(Map.of("error", "OpenLibrary unavailable"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBook(@PathVariable String id) {
        // id arrives URL-encoded; expect e.g. "OL45804W" (just the key part)
        String url = "https://openlibrary.org/works/" + id + ".json";
        try {
            Map<?, ?> result = restTemplate.getForObject(url, Map.class);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("OpenLibrary work fetch failed for {}", id, e);
            return ResponseEntity.status(502).body(Map.of("error", "Book not found"));
        }
    }

    // ── User shelf ─────────────────────────────────────────────────────────────

    @GetMapping("/{openLibraryId}/shelf")
    public ResponseEntity<?> getShelfEntry(
            @PathVariable String openLibraryId,
            @AuthenticationPrincipal Users principal) {
        return shelfRepo.findByUser_IdAndOpenLibraryId(principal.getId(), openLibraryId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{openLibraryId}/shelf")
    public ResponseEntity<UserShelf> upsertShelfEntry(
            @PathVariable String openLibraryId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Users principal) {

        UserShelf entry = shelfRepo.findByUser_IdAndOpenLibraryId(principal.getId(), openLibraryId)
                .orElseGet(() -> UserShelf.builder()
                        .user(principal)
                        .openLibraryId(openLibraryId)
                        .build());

        if (body.containsKey("status"))
            entry.setStatus((String) body.get("status"));
        if (body.containsKey("currentChapter"))
            entry.setCurrentChapter((Integer) body.get("currentChapter"));
        if (body.containsKey("bookTitle"))
            entry.setBookTitle((String) body.get("bookTitle"));
        if (body.containsKey("coverUrl"))
            entry.setCoverUrl((String) body.get("coverUrl"));

        return ResponseEntity.ok(shelfRepo.save(entry));
    }
}
