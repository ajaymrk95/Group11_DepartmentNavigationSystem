package com.atlas.backend.controller;

import com.atlas.backend.entity.Room;
import com.atlas.backend.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    // POST /api/rooms
    // Body: { "buildingId": 1, "roomNo": "101", "floor": 1, "geoJson": "{...}" }
    @PostMapping
    public Room create(@RequestBody Map<String, Object> body) throws Exception {
        return roomService.save(
                Long.valueOf(body.get("buildingId").toString()),
                body.get("roomNo").toString(),
                Integer.valueOf(body.get("floor").toString()),
                body.get("geoJson").toString());
    }

    // GET /api/rooms?buildingId=1
    @GetMapping
    public List<Room> getByBuilding(@RequestParam Long buildingId) {
        return roomService.findByBuilding(buildingId);
    }
}