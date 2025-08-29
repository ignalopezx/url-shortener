package com.ignacio.url_shortener_backend.dto;

import java.time.LocalDateTime;

public record ShortenResponse(
        String code,
        String shortUrl,
        LocalDateTime expiresAt
) {}