package com.ignacio.url_shortener_backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record StatsResponse(
        String code,
        String originalUrl,
        LocalDateTime createdAt,
        LocalDateTime expiresAt,
        long totalClicks,
        List<ClickDto> lastClicks
) {}