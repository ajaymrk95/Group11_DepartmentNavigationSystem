package com.atlas.backend.service;

import com.atlas.backend.entity.Building;
import com.atlas.backend.repository.BuildingRepository;
import com.atlas.backend.utils.GeoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BuildingService {

    @Autowired
    private BuildingRepository buildingRepository;

    public Building save(String name,
            Integer floors,
            String geoJson,
            List<List<Double>> entries) throws Exception {
        Building b = new Building();
        b.setName(name);
        b.setFloors(floors);
        b.setGeom(GeoUtil.fromGeoJson(geoJson));
        b.setEntries(GeoUtil.toMultiPoint(entries));
        return buildingRepository.save(b);
    }

    public List<Building> findNearby(double lat, double lng, double meters) {
        return buildingRepository.findNearby(lat, lng, meters);
    }

    public List<Building> findAll() {
        return buildingRepository.findAll();
    }
}