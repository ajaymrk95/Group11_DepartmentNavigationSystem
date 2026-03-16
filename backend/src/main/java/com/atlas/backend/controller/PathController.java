package com.atlas.backend.controller;

import com.atlas.backend.dto.PathBulkRequest;
import com.atlas.backend.dto.PathRequest;
import com.atlas.backend.entity.Path;
import com.atlas.backend.service.PathService;
import com.atlas.backend.utils.GeoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/paths")
public class PathController {

    @Autowired
    private PathService pathService;

    // POST /api/paths - save a single path
    @PostMapping
    public Path create(@RequestBody PathRequest body) throws Exception {
        return pathService.save(body);
    }

    // POST /api/paths/bulk - import entire GeoJSON FeatureCollection
    @PostMapping("/bulk")
    public Map<String, Object> bulkImport(@RequestBody PathBulkRequest body) throws Exception {
        List<Path> saved = pathService.bulkImport(body);
        return Map.of(
                "imported", saved.size(),
                "buildingId", body.getBuildingId(),
                "floor", body.getFloor());
    }

    // GET /api/paths?buildingId=1&floor=0
    @GetMapping
    public List<Map<String, Object>> getByFloor(@RequestParam Long buildingId,
                                                @RequestParam Integer floor) {
        return pathService.findByFloor(buildingId, floor)
            .stream()
            .map(p -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", p.getId());
                map.put("name", p.getName() != null ? p.getName() : "");
                map.put("type", p.getType());
                map.put("navigable", p.getNavigable());
                map.put("geom", GeoUtil.toGeoJson(p.getGeom()));
                return map;
            })
            .collect(Collectors.toList());
    }
}