package com.ignacio.url_shortener_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;

public record ShortenRequest(
        @NotBlank String originalUrl,
        @Pattern(regexp = "^[0-9A-Za-z_-]{3,16}$", message = "alias inválido")
        String customAlias,
        LocalDateTime expiresAt
) {}
