package com.atlas.backend.service;

import com.atlas.backend.entity.Path;
import com.atlas.backend.entity.Building;
import com.atlas.backend.repository.PathRepository;
import com.atlas.backend.repository.BuildingRepository;
import com.atlas.backend.utils.GeoUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.locationtech.jts.geom.Geometry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PathService {

    @Autowired
    private PathRepository pathRepository;
  
    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private ObjectMapper objectMapper;
  
    public List<Path> findByFloor(Long buildingId, Integer floor) {
        return pathRepository.findByBuildingIdAndFloor(buildingId, floor);
    }

    public List<Path> getOutdoorPaths() {
        return pathRepository.findAllOutdoorPaths();
    }

    public List<Path> getIndoorPaths(Long buildingId, Integer floor) {
        return pathRepository.findByBuildingAndFloor(buildingId, floor);
    }

    public Path addOutdoorPath(String name, String roadType,
                               Boolean isOneway, Object geomJson) throws Exception {

        Path path = new Path();
        path.setName(name);
        path.setRoadType(roadType != null ? roadType : "path");
        path.setIsAccessible(true);
        path.setIsOneway(isOneway != null ? isOneway : false);
        path.setBuilding(null);
        path.setFloor(null);
        path.setGeom(parseGeom(geomJson));

        return pathRepository.save(path);
    }

    public Path addIndoorPath(String name, String roadType,
                             Boolean isOneway, Long buildingId,
                             Integer floor, Object geomJson) throws Exception {

        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new RuntimeException("Building not found"));

        if (floor < 1 || floor > building.getFloors()) {
            throw new IllegalArgumentException("Invalid floor");
        }

        Path path = new Path();
        path.setName(name);
        path.setRoadType(roadType != null ? roadType : "corridor");
        path.setIsAccessible(true);
        path.setIsOneway(isOneway != null ? isOneway : false);
        path.setBuilding(building);
        path.setFloor(floor);
        path.setGeom(parseGeom(geomJson));

        return pathRepository.save(path);
    }

    public Path toggleAccessible(Long id, Boolean isAccessible) {
        Path path = pathRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Path not found"));

        path.setIsAccessible(isAccessible);
        return pathRepository.save(path);
    }

    private Geometry parseGeom(Object geomJson) throws Exception {
        String geomStr = geomJson instanceof String
                ? (String) geomJson
                : objectMapper.writeValueAsString(geomJson);

        return GeoUtil.fromGeoJson(geomStr);
    }
}