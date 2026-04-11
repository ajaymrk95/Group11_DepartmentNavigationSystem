package com.atlas.backend.repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import com.atlas.backend.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

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

    // Search by name OR tag - used for the search bar
    @Query(value = """
            SELECT * FROM buildings
            WHERE LOWER(name) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(:query) = ANY(SELECT LOWER(t) FROM unnest(tags) t)
            """, nativeQuery = true)
    List<Building> search(@Param("query") String query);

    @Modifying
    @Transactional
    @Query("UPDATE Room r SET r.isAccessible = :accessible WHERE r.building.id = :buildingId")
    void updateAccessibilityByBuildingId(@Param("buildingId") Long buildingId, 
                                          @Param("accessible") Boolean accessible);
}