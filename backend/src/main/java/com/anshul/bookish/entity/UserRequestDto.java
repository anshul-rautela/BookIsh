package com.anshul.bookish.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRequestDto {
    // Accept both "username" (frontend) and "userName" (legacy)
    @JsonProperty("username")
    private String userName;
    private String email;
    private String name;
    private String password;
    private String bio;
    private String avatarUrl;
}
