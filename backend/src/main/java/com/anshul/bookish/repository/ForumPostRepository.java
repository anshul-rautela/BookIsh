package com.anshul.bookish.repository;

import com.anshul.bookish.entity.ForumPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ForumPostRepository extends JpaRepository<ForumPost, UUID> {
    Page<ForumPost> findByForum_Name(String forumName, Pageable pageable);
}
