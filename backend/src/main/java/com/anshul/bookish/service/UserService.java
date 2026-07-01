package com.anshul.bookish.service;

import com.anshul.bookish.entity.UserRequestDto;
import com.anshul.bookish.entity.Users;
import com.anshul.bookish.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ── Registration ──────────────────────────────────────────────
    public Users addUser(Users user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // ── Read ──────────────────────────────────────────────────────
    public Optional<Users> getUserById(UUID userId) {
        return userRepository.findById(userId);
    }

    // ── Update (called from controller with DTO) ──────────────────
    @Transactional
    public Users updateUser(UUID userId, UserRequestDto dto) {
        try {
            Users existing = getUserById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));

            if (dto.getUserName() != null && !dto.getUserName().isBlank())
                existing.setUserName(dto.getUserName());

            if (dto.getName() != null && !dto.getName().isBlank())
                existing.setName(dto.getName());

            if (dto.getEmail() != null && !dto.getEmail().isBlank())
                existing.setEmail(dto.getEmail());

            // Re-encode password only when a new one is supplied
            if (dto.getPassword() != null && !dto.getPassword().isBlank())
                existing.setPassword(passwordEncoder.encode(dto.getPassword()));

            return userRepository.save(existing);
        } catch (Exception e) {
            log.error("Error: can't update user {}", userId, e);
            return null;
        }
    }

    // ── Delete ────────────────────────────────────────────────────
    public void deleteUserById(UUID userId) {
        userRepository.findById(userId).ifPresent(u -> userRepository.deleteById(userId));
    }
}
