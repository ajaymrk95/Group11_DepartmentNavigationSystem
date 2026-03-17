package com.atlas.backend.repository;

import com.atlas.backend.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface BuildingRepository extends JpaRepository<Building, Long> {

    // Find buildings within X meters of a lat/lng point
    @Query(value = """
            SELECT * FROM buildings
            WHERE ST_DWithin(
                geom::geography,
                ST_MakePoint(:lng, :lat)::geography,
                :meters
            )
            """, nativeQuery = true)
    List<Building> findNearby(@Param("lat") double lat,
            @Param("lng") double lng,
            @Param("meters") double meters);

    Optional<Building> findByNameIgnoreCase(String name);
}