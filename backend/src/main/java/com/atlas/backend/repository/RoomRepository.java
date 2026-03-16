package com.atlas.backend.repository;

import com.atlas.backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {

    // Find all rooms that belong to a building
    List<Room> findByBuildingId(Long buildingId);

    // Find rooms spatially inside a building's geometry
    @Query(value = """
            SELECT r.* FROM rooms r
            JOIN buildings b ON ST_Within(r.geom, b.geom)
            WHERE b.id = :buildingId
            """, nativeQuery = true)
    List<Room> findRoomsInsideBuilding(@Param("buildingId") Long buildingId);
}