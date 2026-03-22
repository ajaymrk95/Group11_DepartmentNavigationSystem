package com.atlas.backend.service;

import com.atlas.backend.dto.RoomSummaryResponse;
import com.atlas.backend.dto.RoomRequest;
import com.atlas.backend.entity.Building;
import com.atlas.backend.entity.Room;
import com.atlas.backend.repository.BuildingRepository;
import com.atlas.backend.repository.RoomRepository;
import com.atlas.backend.utils.GeoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    public Room save(RoomRequest req) throws Exception {
        Building building = buildingRepository.findById(req.getBuildingId()).orElseThrow();
        Room r = new Room();
        r.setBuilding(building);
        r.setRoomNo(req.getRoomNo());
        r.setFloor(req.getFloor());
        r.setCategory(req.getCategory());
        r.setName(req.getName());
        r.setIsAccessible(req.getIsAccessible() != null ? req.getIsAccessible() : true);
        r.setDescription(req.getDescription());
        r.setTags(req.getTags());
        r.setGeom(GeoUtil.fromGeoJson(req.getGeoJson().toString()));
        r.setEntries(req.getEntries() != null ? GeoUtil.toMultiPoint(req.getEntries()) : null);
        return roomRepository.save(r);
    }

    public List<Room> findByFloor(Long buildingId, Integer floor) {
        return roomRepository.findByBuildingIdAndFloor(buildingId, floor);
    }

    public List<RoomSummaryResponse> getAllRoomSummaries() {
        return roomRepository.findAllRoomSummaries();
    }

    public void updateAccessible(Long id, Boolean accessible) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
        room.setIsAccessible(accessible);
        roomRepository.save(room);
    }

    public Room update(Long id, RoomRequest body) throws Exception {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + id));

        room.setName(body.getName());
        room.setRoomNo(body.getRoomNo());
        room.setCategory(body.getCategory());
        room.setFloor(body.getFloor());
        room.setDescription(body.getDescription());
        room.setTags(body.getTags());
        room.setIsAccessible(body.getIsAccessible());

        if (body.getFloor() != null) room.setFloor(body.getFloor());
        if (body.getBuildingId() != null) {
            Building building = buildingRepository.findById(body.getBuildingId())
                    .orElseThrow(() -> new RuntimeException("Building not found"));
            room.setBuilding(building);
        }

        // Only update geometry if new files were provided
        if (body.getGeoJson() != null) {
            room.setGeom(GeoUtil.fromGeoJson(body.getGeoJson().toString()));
        }
        if (body.getEntries() != null) {
            room.setEntries(GeoUtil.toMultiPoint(body.getEntries()));
        }

        return roomRepository.save(room);
    }
}