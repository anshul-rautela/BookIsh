package com.anshul.bookish.repository;

import com.anshul.bookish.entity.Forum;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ForumRepository extends JpaRepository<Forum, UUID> {

    @EntityGraph(attributePaths = {"createdBy"})
    List<Forum> findAll(Sort sort);

    @EntityGraph(attributePaths = {"createdBy"})
    Optional<Forum> findByName(String name);

    boolean existsByName(String name);
}
