package com.atlas.backend.service;

import com.atlas.backend.annotation.Auditable;
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

    @Auditable(action = "CREATE", entityType = "Room")
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
}