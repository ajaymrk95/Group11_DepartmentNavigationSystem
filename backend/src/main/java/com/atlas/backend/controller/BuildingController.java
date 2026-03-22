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
                body.getDescription(),
                body.getFloors(),
                body.getIsAccessible(),
                body.getTags(),
                body.getGeoJson(),
                body.getEntries());
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
    public List<Map<String, Object>> search(@RequestParam String q) {
        return buildingService.search(q)
                .stream()
                .map(this::toMap)
                .collect(Collectors.toList());
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


    // Use the below function to update the access and sync with rooms
    // id : building id, isAccessible: bool true/false
    // buildingService.updateAccess(id, isAccessible);

@PutMapping("/{id}")
public Map<String, Object> update(@PathVariable Long id,
        @RequestBody BuildingRequest body) throws Exception {
    Building b = buildingService.update(
            id, body.getName(), body.getDescription(),
            body.getFloors(), body.getIsAccessible(),
            body.getTags(), body.getGeoJson(), body.getEntries());
    return toMap(b);
}

@PatchMapping("/{id}/accessible")
public Map<String, Object> updateAccess(@PathVariable Long id,
        @RequestBody Map<String, Boolean> body) {
    Building b = buildingService.updateAccess(id, body.get("isAccessible"));
    return toMap(b);
}

    private Map<String, Object> toMap(Building b) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", b.getId());
        map.put("name", b.getName());
        map.put("description", b.getDescription());
        map.put("floors", b.getFloors());
        map.put("isAccessible", b.getIsAccessible());
        map.put("tags", b.getTags() != null ? b.getTags() : new String[] {});
        map.put("geom", b.getGeom() != null ? GeoUtil.toGeoJson(b.getGeom()) : null);
        map.put("entries", b.getEntries() != null ? GeoUtil.toGeoJson(b.getEntries()) : null);
        return map;
    }
}