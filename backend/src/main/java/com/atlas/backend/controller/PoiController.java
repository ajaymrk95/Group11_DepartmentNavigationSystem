package com.atlas.backend.controller;

import com.atlas.backend.dto.PoiBulkRequest;
import com.atlas.backend.dto.PoiRequest;
import com.atlas.backend.entity.Poi;
import com.atlas.backend.service.PoiService;
import com.atlas.backend.utils.GeoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pois")
public class PoiController {

    @Autowired
    private PoiService poiService;

    // POST /api/pois
    @PostMapping
    public Poi create(@RequestBody PoiRequest body) throws Exception {
        return poiService.save(body);
    }

    // POST /api/pois/bulk
    @PostMapping("/bulk")
    public Map<String, Object> bulkImport(@RequestBody PoiBulkRequest body) throws Exception {
        List<Poi> saved = poiService.bulkImport(body);
        Map<String, Object> result = new HashMap<>();
        result.put("imported", saved.size());
        result.put("buildingId", body.getBuildingId());
        result.put("level", body.getLevel());
        return result;
    }

    // GET /api/pois?buildingId=1&level=1
    @GetMapping
    public List<Map<String, Object>> getByLevel(@RequestParam Long buildingId,
            @RequestParam Integer level) {
        return mapPois(poiService.findByLevel(buildingId, level));
    }

    // GET /api/pois/type?buildingId=1&level=1&type=entry
    @GetMapping("/type")
    public List<Map<String, Object>> getByType(@RequestParam Long buildingId,
            @RequestParam Integer level,
            @RequestParam String type) {
        return mapPois(poiService.findByType(buildingId, level, type));
    }

    // GET /api/pois/nearest?buildingId=1&level=1&lat=11.32&lng=75.93
    @GetMapping("/nearest")
    public Map<String, Object> getNearest(@RequestParam Long buildingId,
            @RequestParam Integer level,
            @RequestParam double lat,
            @RequestParam double lng) {
        Poi p = poiService.findNearest(buildingId, level, lat, lng);
        return toMap(p);
    }

    // Reusable helper methods
    private List<Map<String, Object>> mapPois(List<Poi> pois) {
        return pois.stream().map(this::toMap).collect(Collectors.toList());
    }

    private Map<String, Object> toMap(Poi p) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("name", p.getName());
        map.put("type", p.getType());
        map.put("access", p.getAccess());
        map.put("level", p.getLevel());
        map.put("geom", GeoUtil.toGeoJson(p.getGeom()));
        return map;
    }
}