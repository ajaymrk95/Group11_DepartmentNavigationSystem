package com.atlas.backend.controller;

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

    // GET /api/paths?buildingId=11&floor=1
    @GetMapping
    public Map<String, Object> getFloorPaths(@RequestParam Long buildingId,
            @RequestParam Integer floor) {
        List<Path> paths = pathService.findByFloor(buildingId, floor);

        List<Map<String, Object>> features = paths.stream().map(p -> {
            Map<String, Object> feature = new HashMap<>();
            feature.put("type", "Feature");

            Map<String, Object> properties = new HashMap<>();
            properties.put("id", p.getId());
            properties.put("name", p.getName());
            properties.put("type", p.getRoadType());
            properties.put("navigable", p.getIsAccessible() ? "y" : "n");
            properties.put("floor", p.getFloor());
            feature.put("properties", properties);

            feature.put("geometry", p.getGeom() != null
                    ? GeoUtil.parseGeoJson(GeoUtil.toGeoJson(p.getGeom()))
                    : null);

            return feature;
        }).collect(Collectors.toList());

        Map<String, Object> featureCollection = new HashMap<>();
        featureCollection.put("type", "FeatureCollection");
        featureCollection.put("features", features);

        return featureCollection;
    }
}