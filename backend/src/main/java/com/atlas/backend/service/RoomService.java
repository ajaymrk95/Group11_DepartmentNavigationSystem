package com.atlas.backend.service;

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

    public Room save(Long buildingId, String roomNo, Integer floor, String geoJson) throws Exception {
        Building building = buildingRepository.findById(buildingId).orElseThrow();
        Room r = new Room();
        r.setBuilding(building);
        r.setRoomNo(roomNo);
        r.setFloor(floor);
        r.setGeom(GeoUtil.fromGeoJson(geoJson));
        return roomRepository.save(r);
    }

    public List<Room> findByBuilding(Long buildingId) {
        return roomRepository.findByBuildingId(buildingId);
    }
}