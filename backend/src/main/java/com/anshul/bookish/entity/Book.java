package com.anshul.bookish.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Data
@Entity
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





}
