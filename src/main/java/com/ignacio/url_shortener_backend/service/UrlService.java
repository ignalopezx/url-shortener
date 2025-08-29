package com.ignacio.url_shortener_backend.service;

import com.ignacio.url_shortener_backend.dto.ShortenRequest;
import com.ignacio.url_shortener_backend.dto.ShortenResponse;
import com.ignacio.url_shortener_backend.model.UrlMapping;
import com.ignacio.url_shortener_backend.repository.UrlMappingRepository;
import com.ignacio.url_shortener_backend.util.CodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlMappingRepository urlRepo;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public ShortenResponse shorten(ShortenRequest req) {
        // 1) Validar URL
        try { URI.create(req.originalUrl()); }
        catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "URL inválida");
        }

        // 2) Determinar código (custom o aleatorio)
        String code = (req.customAlias() != null && !req.customAlias().isBlank())
                ? req.customAlias()
                : generateUniqueCode(7);

        // 3) Verificar unicidad
        if (urlRepo.findByShortCode(code).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Alias en uso");
        }

        // 4) Persistir
        UrlMapping entity = UrlMapping.builder()
                .originalUrl(req.originalUrl())
                .shortCode(code)
                .createdAt(LocalDateTime.now())
                .expiresAt(req.expiresAt())
                .build();
        urlRepo.save(entity);

        // 5) Responder
        return new ShortenResponse(code, baseUrl + "/" + code, entity.getExpiresAt());
    }

    private String generateUniqueCode(int len) {
        for (int i = 0; i < 5; i++) {
            String c = CodeGenerator.random(len);
            if (urlRepo.findByShortCode(c).isEmpty()) return c;
        }
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo generar código único, reintentar");
    }
}
