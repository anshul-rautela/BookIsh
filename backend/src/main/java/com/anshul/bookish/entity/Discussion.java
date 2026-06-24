package com.anshul.bookish.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class    Discussion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID discussionId;

    @JoinColumn(name = "book_id")
    @ManyToOne()
    private Book book;

    @JoinColumn(name = "user_id")
    @ManyToOne
    private Users user;

}
