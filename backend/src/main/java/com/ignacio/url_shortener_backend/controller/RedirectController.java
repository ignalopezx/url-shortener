package com.ignacio.url_shortener_backend.controller;

import com.ignacio.url_shortener_backend.service.UrlService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class RedirectController {

    private final UrlService service;

    @GetMapping("/{code}")
    public ResponseEntity<Void> redirect(@PathVariable String code, HttpServletRequest req) {
        String ip = req.getRemoteAddr();
        String ua = req.getHeader("User-Agent");
        String ref = req.getHeader("Referer");

        String destination = service.resolveAndRegisterHit(code, ip, ua, ref);

        return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
                .header(HttpHeaders.LOCATION, destination)
                .build();
    }
}

