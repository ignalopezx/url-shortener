package com.ignacio.url_shortener_backend.repository;


import com.ignacio.url_shortener_backend.model.ClickEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClickEventRepository extends JpaRepository<ClickEvent, Long> {
}