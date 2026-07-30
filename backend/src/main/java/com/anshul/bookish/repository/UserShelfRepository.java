package com.anshul.bookish.repository;

import com.anshul.bookish.entity.UserShelf;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserShelfRepository extends JpaRepository<UserShelf, UUID> {
    Optional<UserShelf> findByUser_IdAndOpenLibraryId(UUID userId, String openLibraryId);
    List<UserShelf> findAllByUser_Id(UUID userId);
}
