package com.atlas.backend.service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;
import com.atlas.backend.annotation.Auditable;
import org.springframework.stereotype.Service;

import com.atlas.backend.dto.LocationDTO;
import com.atlas.backend.entity.Location;
import com.atlas.backend.entity.LocationCategory;
import com.atlas.backend.repository.LocationRepository;


@Service
public class LocationService {

    private final LocationRepository repository;

    public LocationService(LocationRepository repository) {
        this.repository = repository;
    }

    public List<LocationDTO> searchLocations(String query) {
        if (query == null || query.trim().isEmpty()) return List.of();
        String q = query.trim();

        List<LocationDTO> rooms = mapRows(repository.searchRooms(q));
        List<LocationDTO> buildings = mapRows(repository.searchBuildings(q));

        return Stream.concat(rooms.stream(), buildings.stream()).toList();
    }

    private List<LocationDTO> mapRows(List<Object[]> rows) {
        return rows.stream().map(row -> {
            List<String> tags = row[6] instanceof String[] arr
                ? Arrays.asList(arr)
                : List.of();
            return new LocationDTO(
                ((Number) row[0]).longValue(),
                (String) row[1],
                safeParseCategory((String) row[3]),
                (String) row[2],
                row[7] != null ? ((Number) row[7]).doubleValue() : null,
                row[8] != null ? ((Number) row[8]).doubleValue() : null,
                tags,
                row[4] != null ? ((Number) row[4]).intValue() : null,
                (String) row[5]
            );
        }).toList();
    }

    private LocationCategory safeParseCategory(String value) {
        if (value == null) return null;
        try {
            return LocationCategory.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public List<LocationDTO> getAllLocations(){
    return repository.findAll()
            .stream()
            .map(this::mapToDTO)
            .toList();
    }

    private LocationDTO mapToDTO(Location loc) {
        Double lat = null;
        Double lon = null;
        if (loc.getCoords() != null) {
            lat = loc.getCoords().getY();
            lon = loc.getCoords().getX();
        }
        return new LocationDTO(
            loc.getId(),
            loc.getName(),
            loc.getCategory(),        // use actual category instead of hardcoded OUTDOOR
            loc.getRoom(),
            lat,
            lon,
            loc.getTag(),
            loc.getFloor(),
            loc.getDescription()      // add description
        );
    }
    
}