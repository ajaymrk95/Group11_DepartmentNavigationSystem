package com.atlas.backend.repository;

import com.atlas.backend.entity.Path;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PathRepository extends JpaRepository<Path, Long> {

    // Get all paths for a specific floor of a building
    List<Path> findByBuildingIdAndFloor(Long buildingId, Integer floor);

    // Get only navigable paths for a floor
    List<Path> findByBuildingIdAndFloorAndNavigable(Long buildingId, Integer floor, Boolean navigable);

    // Get paths by type (e.g. all "stairs" in a building)
    List<Path> findByBuildingIdAndType(Long buildingId, String type);

    // Find paths within X meters of a point (useful for snapping user location to
    // nearest path)
    @Query(value = """
            SELECT * FROM paths
            WHERE building_id = :buildingId
            AND floor = :floor
            AND ST_DWithin(
                geom::geography,
                ST_MakePoint(:lng, :lat)::geography,
                :meters
            )
            """, nativeQuery = true)
    List<Path> findNearbyPaths(@Param("buildingId") Long buildingId,
            @Param("floor") Integer floor,
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("meters") double meters);
}