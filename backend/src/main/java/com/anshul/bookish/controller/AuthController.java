package com.anshul.bookish.controller;

import com.anshul.bookish.entity.AuthResponse;
import com.anshul.bookish.entity.LoginRequest;
import com.anshul.bookish.entity.UserRequestDto;
import com.anshul.bookish.entity.Users;
import com.anshul.bookish.service.JwtService;
import com.anshul.bookish.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;

    /**
     * POST /auth/login
     * Body: { "userName": "...", "password": "..." }
     * Returns a JWT on success.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUserName(),
                            loginRequest.getPassword()
                    )
            );

            Users user = (Users) auth.getPrincipal();
            String token = jwtService.generateToken(user);

            return ResponseEntity.ok(new AuthResponse(token, user.getUserName(), user.getEmail()));

        } catch (AuthenticationException e) {
            log.warn("Login failed for user {}: {}", loginRequest.getUserName(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * POST /auth/register
     * Body: { "userName": "...", "email": "...", "name": "...", "password": "..." }
     * Registers a new user and returns a JWT immediately (auto-login after register).
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody UserRequestDto dto) {
        try {
            Users user = Users.builder()
                    .userName(dto.getUserName())
                    .email(dto.getEmail())
                    .name(dto.getName())
                    .password(dto.getPassword())
                    .build();

            userService.addUser(user);

            String token = jwtService.generateToken(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new AuthResponse(token, user.getUserName(), user.getEmail()));

        } catch (Exception e) {
            log.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
}
