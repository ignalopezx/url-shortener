package com.ignacio.url_shortener_backend.service;

import com.ignacio.url_shortener_backend.dto.ClickDto;
import com.ignacio.url_shortener_backend.dto.ShortenRequest;
import com.ignacio.url_shortener_backend.dto.ShortenResponse;
import com.ignacio.url_shortener_backend.dto.StatsResponse;
import com.ignacio.url_shortener_backend.model.ClickEvent;
import com.ignacio.url_shortener_backend.model.UrlMapping;
import com.ignacio.url_shortener_backend.repository.ClickEventRepository;
import com.ignacio.url_shortener_backend.repository.UrlMappingRepository;
import com.ignacio.url_shortener_backend.util.CodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlMappingRepository urlRepo;
    private final ClickEventRepository clickRepo;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public ShortenResponse shorten(ShortenRequest req) {
        // Validación sintáctica de URL
        try { URI.create(req.originalUrl()); }
        catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "URL inválida");
        }

        String code = (req.customAlias() != null && !req.customAlias().isBlank())
                ? req.customAlias()
                : generateUniqueCode();

        if (urlRepo.findByShortCode(code).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Alias en uso");
        }

        LocalDateTime expiration = (req.expiresAt() != null)
                ? req.expiresAt()
                : LocalDateTime.now().plusDays(7);

        UrlMapping entity = UrlMapping.builder()
                .originalUrl(req.originalUrl())
                .shortCode(code)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiration)
                .build();

        urlRepo.save(entity);

        return new ShortenResponse(code, baseUrl + "/" + code, entity.getExpiresAt());
    }

    private String generateUniqueCode() {
        for (int i = 0; i < 5; i++) {
            String c = CodeGenerator.random(7);
            if (urlRepo.findByShortCode(c).isEmpty()) return c;
        }
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo generar código único, reintentar");
    }

    /** Devuelve la URL original y registra el clic. */
    public String resolveAndRegisterHit(String code, String ip, String userAgent, String referer) {
        UrlMapping mapping = urlRepo.findByShortCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Código inexistente"));

        if (mapping.getExpiresAt() != null && LocalDateTime.now().isAfter(mapping.getExpiresAt())) {
            throw new ResponseStatusException(HttpStatus.GONE, "Link expirado");
        }

        // Registrar el clic
        ClickEvent ev = ClickEvent.builder()
                .urlMapping(mapping)
                .clickedAt(LocalDateTime.now())
                .ipAddress(ip)
                .userAgent(userAgent)
                .build();
        clickRepo.save(ev);

        return mapping.getOriginalUrl();
    }

    /** Devuelve estadísticas básicas del código. */
    public StatsResponse stats(String code) {
        UrlMapping mapping = urlRepo.findByShortCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Código inexistente"));

        long total = clickRepo.countByUrlMappingId(mapping.getId());
        List<ClickDto> last = clickRepo.findTop100ByUrlMappingIdOrderByClickedAtDesc(mapping.getId())
                .stream()
                .map(c -> new ClickDto(c.getClickedAt(), c.getIpAddress(), c.getUserAgent()))
                .toList();

        return new StatsResponse(
                mapping.getShortCode(),
                mapping.getOriginalUrl(),
                mapping.getCreatedAt(),
                mapping.getExpiresAt(),
                total,
                last
        );
    }
}
