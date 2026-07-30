package com.anshul.bookish.controller;

import com.anshul.bookish.entity.Discussion;
import com.anshul.bookish.entity.UserShelf;
import com.anshul.bookish.entity.Users;
import com.anshul.bookish.entity.UserRequestDto;
import com.anshul.bookish.entity.UserResponseDto;
import com.anshul.bookish.repository.DiscussionRepository;
import com.anshul.bookish.repository.UserShelfRepository;
import com.anshul.bookish.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserShelfRepository shelfRepo;

    @Autowired
    private DiscussionRepository discussionRepo;

    // ──────────────────────────────────────────────────────────────
    //  POST /user  →  Register a new user (public, no auth needed)
    // ──────────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<UserResponseDto> addUser(@RequestBody UserRequestDto userRequestDto) {
        try {
            Users user = Users.builder()
                    .userName(userRequestDto.getUserName())
                    .email(userRequestDto.getEmail())
                    .name(userRequestDto.getName())
                    .password(userRequestDto.getPassword())
                    .build();
            userService.addUser(user);
            UserResponseDto userResponseDto = user.convertToUserResponse();
            return new ResponseEntity<>(userResponseDto, HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Error: Can't add new User ", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  GET /user/me  →  Shortcut: return the current user's profile
    // ──────────────────────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getMe(@AuthenticationPrincipal Users principal) {
        return ResponseEntity.ok(principal.convertToUserResponse());
    }

    // ──────────────────────────────────────────────────────────────
    //  GET /user/{userId}  →  Public profile view
    // ──────────────────────────────────────────────────────────────
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable UUID userId) {
        Optional<Users> user = userService.getUserById(userId);
        if (user.isPresent()) {
            return new ResponseEntity<>(user.get().convertToUserResponse(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // ──────────────────────────────────────────────────────────────
    //  GET /user/{userId}/discussions  →  Public: user's discussions
    // ──────────────────────────────────────────────────────────────
    @GetMapping("/{userId}/discussions")
    public ResponseEntity<List<Discussion>> getUserDiscussions(@PathVariable UUID userId) {
        return ResponseEntity.ok(discussionRepo.findByAuthor_IdOrderByCreatedAtDesc(userId));
    }

    // ──────────────────────────────────────────────────────────────
    //  PUT /user/{userId}  →  Only the owner can update their profile
    // ──────────────────────────────────────────────────────────────
    @PutMapping("/{userId}")
    public ResponseEntity<UserResponseDto> updateUser(
            @RequestBody UserRequestDto userRequestDto,
            @PathVariable UUID userId,
            @AuthenticationPrincipal Users principal) {

        if (!principal.getId().equals(userId)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        Users updatedUser = userService.updateUser(userId, userRequestDto);
        if (updatedUser == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(updatedUser.convertToUserResponse(), HttpStatus.OK);
    }

    // ──────────────────────────────────────────────────────────────
    //  DELETE /user/{userId}  →  Only the owner can delete their account
    // ──────────────────────────────────────────────────────────────
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable UUID userId,
            @AuthenticationPrincipal Users principal) {

        if (!principal.getId().equals(userId)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        userService.deleteUserById(userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // ──────────────────────────────────────────────────────────────
    //  GET /user/{userId}/shelf  →  Owner's reading shelf
    // ──────────────────────────────────────────────────────────────
    @GetMapping("/{userId}/shelf")
    public ResponseEntity<List<UserShelf>> getUserShelf(
            @PathVariable UUID userId,
            @AuthenticationPrincipal Users principal) {

        if (!principal.getId().equals(userId)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(shelfRepo.findAllByUser_Id(userId));
    }
}
