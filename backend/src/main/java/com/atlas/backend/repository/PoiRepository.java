package com.atlas.backend.repository;

import com.atlas.backend.entity.Poi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PoiRepository extends JpaRepository<Poi, Long> {

    // All POIs for a building on a specific level
    List<Poi> findByBuildingIdAndLevel(Long buildingId, Integer level);

    // All POIs of a specific type (e.g. all "entry" points)
    List<Poi> findByBuildingIdAndLevelAndType(Long buildingId, Integer level, String type);

    // Find nearest POI to a given point
    @Query(value = """
            SELECT * FROM pois
            WHERE building_id = :buildingId
            AND level = :level
            ORDER BY ST_Distance(
                geom::geography,
                ST_MakePoint(:lng, :lat)::geography
            )
            LIMIT 1
            """, nativeQuery = true)
    Poi findNearest(@Param("buildingId") Long buildingId,
            @Param("level") Integer level,
            @Param("lat") double lat,
            @Param("lng") double lng);

    // Find all POIs within X meters of a point
    @Query(value = """
            SELECT * FROM pois
            WHERE building_id = :buildingId
            AND level = :level
            AND ST_DWithin(
                geom::geography,
                ST_MakePoint(:lng, :lat)::geography,
                :meters
            )
            """, nativeQuery = true)
    List<Poi> findNearby(@Param("buildingId") Long buildingId,
            @Param("level") Integer level,
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("meters") double meters);
}