package com.anshul.bookish.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class Users implements UserDetails {  //cahnged user to Users
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







    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority("USER"));
    }

    @Override
    public String getUsername() {
        return userName;
    }
    public String getUserName() {
        return userName;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
