package com.anshul.bookish.controller;

import com.anshul.bookish.entity.Users;
import com.anshul.bookish.entity.UserRequestDto;
import com.anshul.bookish.entity.UserResponseDto;
import com.anshul.bookish.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

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
    //  GET /user/{userId}  →  Only the owner can view their profile
    // ──────────────────────────────────────────────────────────────
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUserById(
            @PathVariable UUID userId,
            @AuthenticationPrincipal Users principal) {

        // 403 if the authenticated user is requesting someone else's profile
        if (!principal.getId().equals(userId)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        Optional<Users> user = userService.getUserById(userId);
        if (user.isPresent()) {
            return new ResponseEntity<>(user.get().convertToUserResponse(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
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
}
