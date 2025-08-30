package com.ignacio.url_shortener_backend.controller;

import com.ignacio.url_shortener_backend.dto.ShortenRequest;
import com.ignacio.url_shortener_backend.dto.ShortenResponse;
import com.ignacio.url_shortener_backend.dto.StatsResponse;
import com.ignacio.url_shortener_backend.service.UrlService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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
}
