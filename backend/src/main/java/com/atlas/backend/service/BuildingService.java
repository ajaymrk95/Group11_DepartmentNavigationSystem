package com.atlas.backend.service;

import com.atlas.backend.annotation.Auditable;
import com.atlas.backend.entity.Building;
import com.atlas.backend.repository.BuildingRepository;
import com.atlas.backend.repository.RoomRepository;
import com.atlas.backend.utils.GeoUtil;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BuildingService {

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Auditable(action = "CREATE", entityType = "Building")
    public Building save(String name,
            String description,
            Integer floors,
            Boolean isAccessible,
            String[] tags,
            JsonNode geoJson,
            List<List<Double>> entries) throws Exception {
        Building b = new Building();
        b.setName(name);
        b.setDescription(description);
        b.setFloors(floors != null ? floors : 1);
        b.setIsAccessible(isAccessible != null ? isAccessible : true);
        b.setTags(tags);
        b.setGeom(GeoUtil.fromGeoJson(geoJson.toString()));
      if (entries != null) b.setEntries(GeoUtil.toMultiPoint(entries));
        return buildingRepository.save(b);
    }

    public List<Building> findAll() {
        return buildingRepository.findAll();
    }

    public List<Building> findNearby(double lat, double lng, double meters) {
        return buildingRepository.findNearby(lat, lng, meters);
    }

    public List<Building> search(String query) {
        return buildingRepository.search(query);
    }

    @Auditable(action = "UPDATE", entityType = "Building")
    @Transactional
    public Building updateAccess(Long id, Boolean isAccessible) {
        Building b = buildingRepository.findById(id).orElseThrow();
        b.setIsAccessible(isAccessible);
        buildingRepository.save(b);
        // cascade to all rooms in this building
        roomRepository.updateAccessibilityByBuildingId(id, isAccessible);
        return b;
    }

    @Auditable(action = "UPDATE", entityType = "Building")
public Building update(Long id, String name, String description, Integer floors,
        Boolean isAccessible, String[] tags, JsonNode geoJson,
        List<List<Double>> entries) throws Exception {
    Building b = buildingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Building not found: " + id));
    b.setName(name);
    if (description != null) b.setDescription(description);
    if (floors      != null) b.setFloors(floors);
    if (isAccessible!= null) b.setIsAccessible(isAccessible);
    if (tags        != null) b.setTags(tags);
    if (geoJson     != null) b.setGeom(GeoUtil.fromGeoJson(geoJson.toString()));
    if (entries     != null) b.setEntries(GeoUtil.toMultiPoint(entries));
    return buildingRepository.save(b);
}

}