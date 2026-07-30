package com.anshul.bookish.repository;

import com.anshul.bookish.entity.Forum;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ForumRepository extends JpaRepository<Forum, UUID> {
    Optional<Forum> findByName(String name);
    boolean existsByName(String name);
}
