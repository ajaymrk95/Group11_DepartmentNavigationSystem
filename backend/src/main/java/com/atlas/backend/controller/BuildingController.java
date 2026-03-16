package com.atlas.backend.controller;

import com.atlas.backend.entity.Building;
import com.atlas.backend.service.BuildingService;
import com.atlas.backend.utils.GeoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/buildings")
public class BuildingController {

    @Autowired
    private BuildingService buildingService;

    // POST /api/buildings
    // Body: {
    // "name": "Block A",
    // "floors": 3,
    // "geoJson": "{...}",
    // "entries": [[76.5, 11.6], [76.51, 11.61]]
    // }
    @PostMapping
    public Building create(@RequestBody Map<String, Object> body) throws Exception {
        return buildingService.save(
                body.get("name").toString(),
                Integer.valueOf(body.get("floors").toString()),
                body.get("geoJson").toString(),
                (List<List<Double>>) body.get("entries"));
    }

    // GET /api/buildings
    @GetMapping
    public List<Building> getAll() {
        return buildingService.findAll();
    }

    // GET /api/buildings/nearby?lat=11.6&lng=76.5&meters=500
    @GetMapping("/nearby")
    public List<String> getNearby(@RequestParam double lat,
            @RequestParam double lng,
            @RequestParam double meters) {
        return buildingService.findNearby(lat, lng, meters)
                .stream()
                .map(b -> GeoUtil.toGeoJson(b.getGeom()))
                .toList();
    }
}