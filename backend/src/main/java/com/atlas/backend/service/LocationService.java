package com.atlas.backend.service;

import java.sql.Array;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

import com.atlas.backend.dto.LocationDTO;
import com.atlas.backend.entity.Location;
import com.atlas.backend.entity.LocationCategory;
import com.atlas.backend.entity.LocationType;
import com.atlas.backend.repository.LocationRepository;

@Service
public class LocationService {

    private final LocationRepository repository;

    public LocationService(LocationRepository repository) {
        this.repository = repository;
    }

    public List<LocationDTO> searchLocations(String query) {
        if (query == null || query.trim().isEmpty()) return List.of();

        List<Object[]> res = repository.searchOutdoorLocations(query.trim());
        return res.stream().map(row -> {
            List<String> tags = row[4] instanceof String[] arr ? Arrays.asList(arr) : List.of();
            return new LocationDTO(
                ((Number) row[0]).longValue(),
                (String) row[1],
                LocationType.BUILDING,
                LocationCategory.OUTDOOR,
                row[2] != null ? ((Number) row[2]).doubleValue() : null,
                row[3] != null ? ((Number) row[3]).doubleValue() : null,
                tags,
                row[5] != null ? ((Number) row[5]).intValue() : null
            );
        }).toList();
    }

    public List<LocationDTO> getAllLocations(){
    return repository.findAll()
            .stream()
            .map(this::mapToDTO)
            .toList();
    }

    private LocationDTO mapToDTO(Location loc){
        Double lat = null;
        Double lon = null;

        if(loc.getCoords() != null) {
            lat = loc.getCoords().getY();
            lon = loc.getCoords().getX();
        }

        return new LocationDTO(
            loc.getId(),
            loc.getName(),
            LocationType.BUILDING,        // fixed
            LocationCategory.OUTDOOR,     // fixed
            lat,
            lon,
            loc.getTag(),                 // ⚠️ depends on mapping
            loc.getFloor()
        );
    }
    
}