package com.atlas.admin.repository;

import com.atlas.admin.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, String> {
    List<Room> findByBuildingId(String buildingId);
    List<Room> findByFloorId(String floorId);
    List<Room> findByBuildingIdAndCategory(String buildingId, Room.RoomCategory category);
}
