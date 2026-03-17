package com.atlas.backend.service;

import com.atlas.backend.dto.PoiBulkRequest;
import com.atlas.backend.dto.PoiRequest;
import com.atlas.backend.entity.Building;
import com.atlas.backend.entity.Poi;
import com.atlas.backend.repository.BuildingRepository;
import com.atlas.backend.repository.PoiRepository;
import com.atlas.backend.utils.GeoUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class PoiService {

    @Autowired
    private PoiRepository poiRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Poi save(PoiRequest req) throws Exception {
        Building building = buildingRepository.findById(req.getBuildingId()).orElseThrow();
        Poi p = new Poi();
        p.setBuilding(building);
        p.setLevel(req.getLevel());
        p.setName(req.getName());
        p.setType(req.getType());
        p.setAccess(req.getAccess());
        p.setGeom(GeoUtil.fromGeoJson(req.getGeoJson()));
        return poiRepository.save(p);
    }

    public List<Poi> bulkImport(PoiBulkRequest req) throws Exception {
        Building building = buildingRepository.findById(req.getBuildingId()).orElseThrow();
        JsonNode features = objectMapper.readTree(req.getFeatureCollection()).get("features");

        List<Poi> saved = new ArrayList<>();

        for (JsonNode feature : features) {
            JsonNode props = feature.get("properties");
            JsonNode geom = feature.get("geometry");

            Poi p = new Poi();
            p.setBuilding(building);
            p.setLevel(req.getLevel());
            p.setName(props.get("name").asText().trim());
            p.setType(props.get("type").asText());
            p.setAccess("y".equals(props.get("access").asText()));
            p.setGeom(GeoUtil.fromGeoJson(geom.toString()));

            saved.add(poiRepository.save(p));
        }

        return saved;
    }

    public List<Poi> findByLevel(Long buildingId, Integer level) {
        return poiRepository.findByBuildingIdAndLevel(buildingId, level);
    }

    public List<Poi> findByType(Long buildingId, Integer level, String type) {
        return poiRepository.findByBuildingIdAndLevelAndType(buildingId, level, type);
    }

    public Poi findNearest(Long buildingId, Integer level, double lat, double lng) {
        return poiRepository.findNearest(buildingId, level, lat, lng);
    }
}