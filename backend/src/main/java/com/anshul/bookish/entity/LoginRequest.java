package com.anshul.bookish.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    /** Frontend sends "email"; kept as the primary login identifier. */
    private String email;
    private String password;
}
