package com.ignacio.url_shortener_backend.controller;

import com.ignacio.url_shortener_backend.dto.ShortenRequest;
import com.ignacio.url_shortener_backend.dto.ShortenResponse;
import com.ignacio.url_shortener_backend.dto.StatsResponse;
import com.ignacio.url_shortener_backend.dto.UrlItemDto;
import com.ignacio.url_shortener_backend.service.UrlService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/urls")
@RequiredArgsConstructor
public class UrlController {

    private final UrlService service;

    @PostMapping
    public ShortenResponse shorten(@Valid @RequestBody ShortenRequest request) {
        return service.shorten(request);
    }

    @GetMapping("/{code}/stats")
    public StatsResponse stats(@PathVariable String code) {
        return service.stats(code);
    }

    /** ✅ Lista todas las URLs */
    @GetMapping
    public List<UrlItemDto> listAll() {
        return service.listAll();
    }

    /** ✅ Elimina una URL por código */
    @DeleteMapping("/{code}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String code) {
        service.deleteByCode(code);
    }
}
