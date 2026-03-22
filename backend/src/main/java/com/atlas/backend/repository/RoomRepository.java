package com.atlas.backend.repository;

import com.atlas.backend.dto.RoomSummaryResponse;
import com.atlas.backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {

    // All rooms in a building on a specific floor
    List<Room> findByBuildingIdAndFloor(Long buildingId, Integer floor);

    // Find the room that contains a specific point (e.g. user's location)
    @Query(value = """
            SELECT * FROM rooms
            WHERE building_id = :buildingId
            AND floor = :floor
            AND ST_Contains(geom, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))
            LIMIT 1
            """, nativeQuery = true)
    Room findRoomAtPoint(@Param("buildingId") Long buildingId,
            @Param("floor") Integer floor,
            @Param("lat") double lat,
            @Param("lng") double lng);

    // Spatially find rooms inside a building geometry
    @Query(value = """
            SELECT r.* FROM rooms r
            JOIN buildings b ON ST_Intersects(r.geom, b.geom)
            WHERE b.id = :buildingId
            AND r.floor = :floor
            """, nativeQuery = true)
    List<Room> findRoomsInsideBuilding(@Param("buildingId") Long buildingId,
            @Param("floor") Integer floor);

    @Modifying
    @Transactional
    @Query("""
        UPDATE Room r
        SET r.isAccessible = :isAccessible
        WHERE r.building.id = :buildingId
        """)
    void updateAccessibilityByBuildingId(@Param("buildingId") Long buildingId,
                                        @Param("isAccessible") Boolean isAccessible);

    @Query("""
        SELECT new com.atlas.backend.dto.RoomSummaryResponse(
            r.id, r.name, r.roomNo, r.category,
            r.floor, r.isAccessible, r.description,
            r.tags, r.building.id, r.building.name
        )
        FROM Room r
        LEFT JOIN r.building b
        ORDER BY r.building.id, r.floor, r.roomNo
    """)
    List<RoomSummaryResponse> findAllRoomSummaries();
}