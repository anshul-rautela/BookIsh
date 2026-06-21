package com.anshul.bookish.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(unique = true)
    private UUID id;

    @NonNull
    @Column(unique = true)
    private String userName;

    @NonNull
    @Column(unique = true)
    private String email;

    @NonNull
    @Column(unique = true)
    private String password;
    private String name;

    public UserResponseDto convertToUserResponse(){
            return UserResponseDto.builder()
                    .email(email)
                    .name(name)
                    .userName(userName)
                    .build();
    }
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true,mappedBy = "user")
    private List<Book> books = new ArrayList<>();
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true,mappedBy = "user")
    private List<Discussion>discussions = new ArrayList<>();


}
