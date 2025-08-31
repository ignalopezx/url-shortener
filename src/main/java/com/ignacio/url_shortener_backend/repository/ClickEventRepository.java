package com.ignacio.url_shortener_backend.repository;

import com.ignacio.url_shortener_backend.model.ClickEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClickEventRepository extends JpaRepository<ClickEvent, Long> {
    long countByUrlMappingId(Long urlMappingId);
    List<ClickEvent> findTop100ByUrlMappingIdOrderByClickedAtDesc(Long urlMappingId);
    long deleteByUrlMappingId(Long urlMappingId);
}