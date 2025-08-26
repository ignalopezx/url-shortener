package com.ignacio.url_shortener_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ClickEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private UrlMapping urlMapping;

    @Column(nullable = false)
    private LocalDateTime clickedAt;

    private String ipAddress;
    private String userAgent;
}