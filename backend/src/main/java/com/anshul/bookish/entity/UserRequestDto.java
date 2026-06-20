package com.anshul.bookish.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRequestDto {
        private String userName;
        private String email;
        private String name;
        private String password;


}
