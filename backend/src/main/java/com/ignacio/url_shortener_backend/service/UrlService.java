package com.ignacio.url_shortener_backend.service;

import com.ignacio.url_shortener_backend.dto.ClickDto;
import com.ignacio.url_shortener_backend.dto.ShortenRequest;
import com.ignacio.url_shortener_backend.dto.ShortenResponse;
import com.ignacio.url_shortener_backend.dto.StatsResponse;
import com.ignacio.url_shortener_backend.dto.UrlItemDto;
import com.ignacio.url_shortener_backend.model.ClickEvent;
import com.ignacio.url_shortener_backend.model.UrlMapping;
import com.ignacio.url_shortener_backend.repository.ClickEventRepository;
import com.ignacio.url_shortener_backend.repository.UrlMappingRepository;
import com.ignacio.url_shortener_backend.util.CodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlMappingRepository urlRepo;
    private final ClickEventRepository clickRepo;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    // ✅ Alias reservados que no pueden usarse como shortCode
    private static final Set<String> RESERVED = Set.of(
            "api", "actuator", "h2-console", "error", "favicon", "favicon.ico"
    );

    public ShortenResponse shorten(ShortenRequest req) {
        // Validación sintáctica de URL
        try { URI.create(req.originalUrl()); }
        catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "URL inválida");
        }

        String code = (req.customAlias() != null && !req.customAlias().isBlank())
                ? req.customAlias()
                : generateUniqueCode(7);

        validateAliasOrThrow(code);

        // Si no viene expiración → default 7 días
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

    private void validateAliasOrThrow(String code) {
        String key = code.toLowerCase();
        if (RESERVED.contains(key)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Alias reservado");
        }
        if (urlRepo.findByShortCode(code).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Alias en uso");
        }
    }

    private String generateUniqueCode(int len) {
        for (int i = 0; i < 10; i++) {
            String c = CodeGenerator.random(len);
            if (!RESERVED.contains(c.toLowerCase()) && urlRepo.findByShortCode(c).isEmpty()) {
                return c;
            }
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

    /** ✅ Listar todas las URLs con conteo de clicks. */
    public List<UrlItemDto> listAll() {
        return urlRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(m -> new UrlItemDto(
                        m.getShortCode(),
                        m.getOriginalUrl(),
                        m.getCreatedAt(),
                        m.getExpiresAt(),
                        clickRepo.countByUrlMappingId(m.getId()),
                        baseUrl + "/" + m.getShortCode()
                ))
                .toList();
    }

    /** ✅ Eliminar una URL por código (borra primero los clicks asociados). */
    @Transactional
    public void deleteByCode(String code) {
        UrlMapping mapping = urlRepo.findByShortCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Código inexistente"));

        clickRepo.deleteByUrlMappingId(mapping.getId());
        urlRepo.delete(mapping);
    }
}
