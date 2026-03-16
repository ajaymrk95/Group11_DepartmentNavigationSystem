package com.atlas.backend.service;

import com.atlas.backend.dto.PathBulkRequest;
import com.atlas.backend.dto.PathRequest;
import com.atlas.backend.entity.Building;
import com.atlas.backend.entity.Path;
import com.atlas.backend.repository.BuildingRepository;
import com.atlas.backend.repository.PathRepository;
import com.atlas.backend.utils.GeoUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class PathService {

    @Autowired
    private PathRepository pathRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Save a single path
    public Path save(PathRequest req) throws Exception {
        Building building = buildingRepository.findById(req.getBuildingId()).orElseThrow();
        Path p = new Path();
        p.setBuilding(building);
        p.setFloor(req.getFloor());
        p.setName(req.getName());
        p.setType(req.getType());
        p.setNavigable(req.getNavigable());
        p.setGeom(GeoUtil.fromGeoJson(req.getGeoJson()));
        return pathRepository.save(p);
    }

    // Bulk import from a GeoJSON FeatureCollection
    // This is for importing your whole file at once
    public List<Path> bulkImport(PathBulkRequest req) throws Exception {
        Building building = buildingRepository.findById(req.getBuildingId()).orElseThrow();
        JsonNode root = objectMapper.readTree(req.getFeatureCollection());
        JsonNode features = root.get("features");

        List<Path> saved = new ArrayList<>();

        for (JsonNode feature : features) {
            JsonNode props = feature.get("properties");
            JsonNode geom = feature.get("geometry");

            Path p = new Path();
            p.setBuilding(building);
            p.setFloor(req.getFloor());
            p.setName(props.has("name") && !props.get("name").isNull()
                    ? props.get("name").asText()
                    : null);
            p.setType(props.get("type").asText());
            p.setNavigable("y".equals(props.get("navigable").asText()));
            p.setGeom(GeoUtil.fromGeoJson(geom.toString()));

            saved.add(pathRepository.save(p));
        }

        return saved;
    }

    public List<Path> findByFloor(Long buildingId, Integer floor) {
        return pathRepository.findByBuildingIdAndFloor(buildingId, floor);
    }

    public List<Path> findNavigable(Long buildingId, Integer floor) {
        return pathRepository.findByBuildingIdAndFloorAndNavigable(buildingId, floor, true);
    }
}