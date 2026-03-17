package com.atlas.backend.controller;

import com.atlas.backend.dto.BuildingRequest;
import com.atlas.backend.entity.Building;
import com.atlas.backend.service.BuildingService;
import com.atlas.backend.utils.GeoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/buildings")
public class BuildingController {

    @Autowired
    private BuildingService buildingService;

    @PostMapping
    public Map<String, Object> create(@RequestBody BuildingRequest body) throws Exception {
        Building b = buildingService.save(
            body.getName(),
            body.getFloors(),
            body.getGeoJson(),
            body.getEntries()
        );
        return toMap(b);
    }

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return buildingService.findAll()
            .stream()
            .map(this::toMap)
            .collect(Collectors.toList());
    }

    @GetMapping("/search")
    public Map<String, Object> searchByName(@RequestParam String name) {
        return toMap(buildingService.findByName(name));
    }

    @GetMapping("/nearby")
    public List<Map<String, Object>> getNearby(@RequestParam double lat,
                                                @RequestParam double lng,
                                                @RequestParam double meters) {
        return buildingService.findNearby(lat, lng, meters)
            .stream()
            .map(this::toMap)
            .collect(Collectors.toList());
    }

    private Map<String, Object> toMap(Building b) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", b.getId());
        map.put("name", b.getName());
        map.put("floors", b.getFloors());
        map.put("geom", b.getGeom() != null ? GeoUtil.toGeoJson(b.getGeom()) : null);
        map.put("entries", b.getEntries() != null ? GeoUtil.toGeoJson(b.getEntries()) : null);
        return map;
    }
}