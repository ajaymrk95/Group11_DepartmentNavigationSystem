package com.atlas.backend.repository;

import com.atlas.backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {

    // All rooms in a building on a specific level
    List<Room> findByBuildingIdAndLevel(Long buildingId, Integer level);

    // All rooms of a category in a building (e.g. all classrooms)
    List<Room> findByBuildingIdAndCategory(Long buildingId, String category);

    // Find the room that contains a specific point (e.g. user's location)
    @Query(value = """
            SELECT * FROM rooms
            WHERE building_id = :buildingId
            AND level = :level
            AND ST_Contains(geom, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))
            LIMIT 1
            """, nativeQuery = true)
    Room findRoomAtPoint(@Param("buildingId") Long buildingId,
            @Param("level") Integer level,
            @Param("lat") double lat,
            @Param("lng") double lng);

    // Spatially find rooms inside a building geometry
    @Query(value = """
            SELECT r.* FROM rooms r
            JOIN buildings b ON ST_Intersects(r.geom, b.geom)
            WHERE b.id = :buildingId
            AND r.level = :level
            """, nativeQuery = true)
    List<Room> findRoomsInsideBuilding(@Param("buildingId") Long buildingId,
            @Param("level") Integer level);
}