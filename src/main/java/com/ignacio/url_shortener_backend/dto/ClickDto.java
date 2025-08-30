package com.ignacio.url_shortener_backend.dto;

import java.time.LocalDateTime;

public record ClickDto(
        LocalDateTime clickedAt,
        String ipAddress,
        String userAgent
) {}
