package com.anshul.bookish.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Returned by /auth/login and /auth/register.
 * The frontend reads: data.token, data.user.id, data.user.username, data.user.email
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserPayload user;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserPayload {
        private String id;
        private String username;
        private String email;
    }
}
