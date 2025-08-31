package com.ignacio.url_shortener_backend.dto;

import java.time.LocalDateTime;

public record UrlItemDto(
        String code,
        String originalUrl,
        LocalDateTime createdAt,
        LocalDateTime expiresAt,
        long totalClicks
) {}
