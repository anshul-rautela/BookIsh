package com.anshul.bookish.entity;
import lombok.*;

import java.util.UUID;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto{
    private String userName;
    private String email;
    private String name;
}
