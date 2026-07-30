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
 * GET  /forums             – list all forums
 * POST /forums             – create forum (authenticated)
 * GET  /forums/{name}      – get a specific forum
 * GET  /forums/{name}/posts – paginated posts in a forum
 * POST /forums/{name}/posts – create a post
 * GET  /forums/posts/{id}  – get a single post (with comments)
 * POST /forums/posts/{id}/vote    – upvote/downvote
 * POST /forums/posts/{id}/comments – add comment
 */
@RestController
@RequestMapping("/forums")
@RequiredArgsConstructor
public class ForumController {

    private final ForumRepository     forumRepo;
    private final ForumPostRepository postRepo;

    // ── Forum CRUD ─────────────────────────────────────────────────────────────

    @GetMapping
    public List<Forum> listForums() {
        return forumRepo.findAll(Sort.by("name").ascending());
    }

    @PostMapping
    public ResponseEntity<Forum> createForum(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Users principal) {

        if (forumRepo.existsByName(body.get("name")))
            return ResponseEntity.status(409).build();

        Forum f = Forum.builder()
                .name(body.get("name").toLowerCase().replaceAll("\\s+", ""))
                .description(body.get("description"))
                .createdBy(principal)
                .build();
        return ResponseEntity.status(201).body(forumRepo.save(f));
    }

    @GetMapping("/{name}")
    public ResponseEntity<Forum> getForum(@PathVariable String name) {
        return forumRepo.findByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Posts ──────────────────────────────────────────────────────────────────

    @GetMapping("/{name}/posts")
    public ResponseEntity<Page<ForumPost>> listPosts(
            @PathVariable String name,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pg = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(postRepo.findByForum_Name(name, pg));
    }

    @PostMapping("/{name}/posts")
    public ResponseEntity<ForumPost> createPost(
            @PathVariable String name,
            @RequestBody  Map<String, String> body,
            @AuthenticationPrincipal Users principal) {

        return forumRepo.findByName(name).map(forum -> {
            ForumPost p = ForumPost.builder()
                    .title(body.get("title"))
                    .body(body.get("body"))
                    .forum(forum)
                    .author(principal)
                    .build();
            return ResponseEntity.status(201).body(postRepo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<ForumPost> getPost(@PathVariable UUID id) {
        return postRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Voting ─────────────────────────────────────────────────────────────────

    @PostMapping("/posts/{id}/vote")
    public ResponseEntity<ForumPost> vote(
            @PathVariable UUID id,
            @RequestBody  Map<String, String> body) {

        return postRepo.findById(id).map(p -> {
            if ("up".equals(body.get("vote")))   p.setUpvotes(p.getUpvotes() + 1);
            if ("down".equals(body.get("vote"))) p.setDownvotes(p.getDownvotes() + 1);
            return ResponseEntity.ok(postRepo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Comments ───────────────────────────────────────────────────────────────

    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<ForumPost> addComment(
            @PathVariable UUID id,
            @RequestBody  Map<String, String> body,
            @AuthenticationPrincipal Users principal) {

        return postRepo.findById(id).map(p -> {
            ForumComment c = ForumComment.builder()
                    .body(body.get("body"))
                    .forumPost(p)
                    .author(principal)
                    .build();
            p.getComments().add(c);
            return ResponseEntity.ok(postRepo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }
}
