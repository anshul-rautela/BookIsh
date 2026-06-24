package com.anshul.bookish.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID bookId;

    @Column(length = 2000)
    private String description;

    @Column(unique = true)
    private String isbn;

    private String author;

    private String name;

    @JoinColumn(name = "user_id")
    @ManyToOne
    private Users user;

    @OneToMany(mappedBy = "book")
    private List<Discussion> discussions;
}
