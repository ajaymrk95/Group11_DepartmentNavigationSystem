package com.atlas.backend.controller;

import org.springframework.http.ResponseEntity;
import com.atlas.backend.dto.RoomSummaryResponse;
import com.atlas.backend.dto.RoomRequest;
import com.atlas.backend.entity.Room;
import com.atlas.backend.service.RoomService;
import com.atlas.backend.utils.GeoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    // POST /api/rooms
    @PostMapping
    public Map<String, Object> create(@RequestBody RoomRequest body) throws Exception {
        Room r = roomService.save(body);
        return toRoomFeature(r);
    }

    // GET /api/rooms/all — returns all rooms as a flat list for dropdowns
    @GetMapping("/all")
    public List<Map<String, Object>> getAllRooms() {
        return roomService.findAll()
                .stream()
                .map(this::toRoomSummary)
                .collect(Collectors.toList());
    }

    // GET /api/rooms?buildingId=1&floor=1
    @GetMapping
    public Map<String, Object> getFloorRooms(@RequestParam Long buildingId,
            @RequestParam Integer floor) {
        List<Room> rooms = roomService.findByFloor(buildingId, floor);

        List<Map<String, Object>> features = rooms.stream()
                .map(this::toRoomFeature)
                .collect(Collectors.toList());

        Map<String, Object> featureCollection = new HashMap<>();
        featureCollection.put("type", "FeatureCollection");
        featureCollection.put("features", features);

        return featureCollection;
    }

    // Flat summary for dropdown use (no geometry)
    private Map<String, Object> toRoomSummary(Room r) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", r.getId());
        map.put("roomNo", r.getRoomNo());
        map.put("name", r.getName());
        map.put("floor", r.getFloor());
        map.put("category", r.getCategory());
        map.put("buildingId", r.getBuilding() != null ? r.getBuilding().getId() : null);
        map.put("buildingName", r.getBuilding() != null ? r.getBuilding().getName() : null);
        return map;
    }

    // Updated GET /api/rooms/search?buildingId=11&q=101
    @GetMapping("/search")
    public List<Map<String, Object>> searchRooms(@RequestParam Long buildingId,
            @RequestParam String q) {
        // 1. Notice 'floor' is removed from parameters and service call
        return roomService.searchRooms(buildingId, q)
                .stream()
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", r.getId());
                    map.put("name", r.getName());
                    map.put("roomNo", r.getRoomNo());
                    map.put("category", r.getCategory());

                    // 2. Add floor to the response so the frontend can display it
                    map.put("floor", r.getFloor());

                    map.put("entries", r.getEntries() != null
                            ? GeoUtil.parseGeoJson(GeoUtil.toGeoJson(r.getEntries()))
                            : null);
                    return map;
                })
                .collect(Collectors.toList());
    }

    private Map<String, Object> toRoomFeature(Room r) {
        Map<String, Object> feature = new HashMap<>();
        feature.put("type", "Feature");

        Map<String, Object> properties = new HashMap<>();
        properties.put("id", r.getId());
        properties.put("roomNo", r.getRoomNo());
        properties.put("floor", r.getFloor());
        properties.put("category", r.getCategory());
        properties.put("name", r.getName());
        properties.put("isAccessible", r.getIsAccessible());
        properties.put("description", r.getDescription());
        properties.put("tags", r.getTags() != null ? r.getTags() : new String[] {});
        feature.put("properties", properties);

        feature.put("geometry", r.getGeom() != null
                ? GeoUtil.parseGeoJson(GeoUtil.toGeoJson(r.getGeom()))
                : null);

        return feature;
    }

    @GetMapping("/admin")
    public List<RoomSummaryResponse> getAllRoomsForAdmin() {
        return roomService.getAllRoomSummaries();
    }

    @PatchMapping("/{id}/accessible")
    public ResponseEntity<Map<String, Object>> updateAccessible(
        @PathVariable Long id,
        @RequestBody Map<String, Boolean> body) {
    Boolean accessible = body.get("accessible");
    if (accessible == null) {
        return ResponseEntity.badRequest().body(Map.of("error", "accessible field is required"));
    }
    Room room = roomService.updateAccessible(id, accessible);  // now returns Room
    Map<String, Object> response = new HashMap<>();
    response.put("success", true);
    response.put("id", room.getId());
    response.put("accessible", room.getIsAccessible());
    return ResponseEntity.ok(response);
}

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id,
        @RequestBody RoomRequest body) throws Exception {
        Room r = roomService.update(id, body);
        return ResponseEntity.ok(toRoomFeature(r));
    }
}