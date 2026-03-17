package com.atlas.backend.controller;

import com.atlas.backend.dto.RoomBulkRequest;
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
    public Room create(@RequestBody RoomRequest body) throws Exception {
        return roomService.save(body);
    }

    // POST /api/rooms/bulk
    @PostMapping("/bulk")
    public Map<String, Object> bulkImport(@RequestBody RoomBulkRequest body) throws Exception {
        List<Room> saved = roomService.bulkImport(body);
        Map<String, Object> result = new HashMap<>();
        result.put("imported", saved.size());
        result.put("buildingId", body.getBuildingId());
        return result;
    }

    // GET /api/rooms?buildingId=1&level=1
    @GetMapping
    public List<Map<String, Object>> getByLevel(@RequestParam Long buildingId,
            @RequestParam Integer level) {
        return roomService.findByLevel(buildingId, level)
                .stream()
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", r.getId());
                    map.put("roomNo", r.getRoomNo());
                    map.put("level", r.getLevel());
                    map.put("category", r.getCategory());
                    map.put("name", r.getName());
                    map.put("navigable", r.getNavigable());
                    map.put("geom", GeoUtil.toGeoJson(r.getGeom()));
                    return map;
                })
                .collect(Collectors.toList());
    }

    // GET /api/rooms/category?buildingId=1&category=classroom
    @GetMapping("/category")
    public List<Map<String, Object>> getByCategory(@RequestParam Long buildingId,
            @RequestParam String category) {
        return roomService.findByCategory(buildingId, category)
                .stream()
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", r.getId());
                    map.put("roomNo", r.getRoomNo());
                    map.put("category", r.getCategory());
                    map.put("name", r.getName());
                    map.put("geom", GeoUtil.toGeoJson(r.getGeom()));
                    return map;
                })
                .collect(Collectors.toList());
    }
}