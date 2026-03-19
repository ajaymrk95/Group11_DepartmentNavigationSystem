package com.atlas.backend.service;

import com.atlas.backend.dto.RoomBulkRequest;
import com.atlas.backend.dto.RoomRequest;
import com.atlas.backend.entity.Building;
import com.atlas.backend.entity.Room;
import com.atlas.backend.repository.BuildingRepository;
import com.atlas.backend.repository.RoomRepository;
import com.atlas.backend.utils.GeoUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Room save(RoomRequest req) throws Exception {
        Building building = buildingRepository.findById(req.getBuildingId()).orElseThrow();
        Room r = new Room();
        r.setBuilding(building);
        r.setRoomNo(req.getRoomNo());
        r.setLevel(req.getLevel());
        r.setCategory(req.getCategory());
        r.setName(req.getName());
        r.setNavigable(req.getNavigable());
        r.setGeom(GeoUtil.fromGeoJson(req.getGeoJson()));
        return roomRepository.save(r);
    }

    // Bulk import from FeatureCollection
    public List<Room> bulkImport(RoomBulkRequest req) throws Exception {
        Building building = buildingRepository.findById(req.getBuildingId()).orElseThrow();
        JsonNode root = req.getFeatureCollection().get("features");
        JsonNode features = root.get("features");

        List<Room> saved = new ArrayList<>();

        for (JsonNode feature : features) {
            JsonNode props = feature.get("properties");
            JsonNode geom = feature.get("geometry");

            Room r = new Room();
            r.setBuilding(building);
            r.setRoomNo(props.has("room_no") && !props.get("room_no").isNull()
                    ? props.get("room_no").asText()
                    : null);
            r.setLevel(props.get("level").asInt());
            r.setCategory(props.get("category").asText());
            r.setName(props.get("name").asText());
            r.setNavigable(props.has("navigable") && !props.get("navigable").isNull()
                    ? props.get("navigable").asBoolean()
                    : null);
            r.setGeom(GeoUtil.fromGeoJson(geom.toString()));

            saved.add(roomRepository.save(r));
        }

        return saved;
    }

    public List<Room> findByLevel(Long buildingId, Integer level) {
        return roomRepository.findByBuildingIdAndLevel(buildingId, level);
    }

    public List<Room> findByCategory(Long buildingId, String category) {
        return roomRepository.findByBuildingIdAndCategory(buildingId, category);
    }
}