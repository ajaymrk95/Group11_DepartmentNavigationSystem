package com.atlas.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.atlas.backend.entity.Location;

public interface LocationRepository extends JpaRepository<Location, Long> {

    @Query("SELECT DISTINCT l FROM Location l LEFT JOIN l.tag t WHERE LOWER(l.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(l.room) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(t) = LOWER(:q)")
    List<Location> searchLocations(@Param("q") String q);

}