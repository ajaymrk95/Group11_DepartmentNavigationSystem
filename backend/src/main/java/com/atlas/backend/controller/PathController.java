package com.atlas.backend.controller;

import com.atlas.backend.entity.Path;
import com.atlas.backend.service.PathService;
import com.atlas.backend.utils.GeoUtil;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.List;

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
  
    @GetMapping
    public ResponseEntity<?> getPaths(
            @RequestParam(required = false) Boolean outdoor,
            @RequestParam(required = false) Long buildingId,
            @RequestParam(required = false) Integer floor) {

        if (Boolean.TRUE.equals(outdoor)) {
            return ResponseEntity.ok(
                    pathService.getOutdoorPaths()
                            .stream()
                            .map(this::toMap)
                            .toList()
            );
        }

        if (buildingId != null && floor != null) {
            return ResponseEntity.ok(
                    pathService.getIndoorPaths(buildingId, floor)
                            .stream()
                            .map(this::toMap)
                            .toList()
            );
        }

        return ResponseEntity.badRequest()
                .body(Map.of("error", "Provide outdoor=true OR buildingId+floor"));
    }

    @PostMapping("/outdoor")
    public ResponseEntity<Map<String, Object>> addOutdoor(@RequestBody Map<String, Object> body) throws Exception {

        return ResponseEntity.ok(toMap(
                pathService.addOutdoorPath(
                        (String) body.get("name"),
                        (String) body.get("roadType"),
                        (Boolean) body.get("isOneway"),
                        body.get("geom")
                )
        ));
    }

    @PostMapping("/indoor")
    public ResponseEntity<Map<String, Object>> addIndoor(@RequestBody Map<String, Object> body) throws Exception {

        return ResponseEntity.ok(toMap(
                pathService.addIndoorPath(
                        (String) body.get("name"),
                        (String) body.get("roadType"),
                        (Boolean) body.get("isOneway"),
                        Long.valueOf(body.get("buildingId").toString()),
                        (Integer) body.get("floor"),
                        body.get("geom")
                )
        ));
    }

    @PatchMapping("/{id}/accessible")
    public ResponseEntity<Map<String, Object>> toggleAccessible(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {

        if (body.get("isAccessible") == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "isAccessible is required"));
        }

        return ResponseEntity.ok(
                toMap(pathService.toggleAccessible(id, body.get("isAccessible")))
        );
    }

    private Map<String, Object> toMap(Path p) {
        Map<String, Object> map = new HashMap<>();

        map.put("id", p.getId());
        map.put("name", p.getName());
        map.put("roadType", p.getRoadType());
        map.put("isAccessible", p.getIsAccessible());
        map.put("isOneway", p.getIsOneway());
        map.put("floor", p.getFloor());
        map.put("buildingId",
                p.getBuilding() != null ? p.getBuilding().getId() : null);

        map.put("geom",
                p.getGeom() != null
                        ? GeoUtil.parseGeoJson(GeoUtil.toGeoJson(p.getGeom()))
                        : null);

        return map;
    }
}