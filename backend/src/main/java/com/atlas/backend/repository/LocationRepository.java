package com.atlas.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.atlas.backend.entity.Location;

public interface LocationRepository extends JpaRepository<Location, Long> {
}