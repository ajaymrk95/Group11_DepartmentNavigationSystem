package com.atlas.backend.service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.atlas.backend.dto.LocationDTO;
import com.atlas.backend.dto.SearchLocationDTO;
import com.atlas.backend.entity.Location;
import com.atlas.backend.entity.LocationCategory;
import com.atlas.backend.repository.LocationRepository;

@Service
public class LocationService {

    private final LocationRepository repository;

    public LocationService(LocationRepository repository) {
        this.repository = repository;
    }

    public List<SearchLocationDTO> searchLocations(String query) {
        if (query == null || query.trim().isEmpty()) return List.of();
        String q = query.trim();
        List<SearchLocationDTO> rooms = mapRows(repository.searchRooms(q), "ROOM");
        List<SearchLocationDTO> buildings = mapRows(repository.searchBuildings(q), "BUILDING");
        return Stream.concat(rooms.stream(), buildings.stream()).toList();
    }

    /**
     * Records a visit (click) on a location.
     * The frontend passes back the id and locationType ("ROOM" or "BUILDING")
     * that were returned in the search result — no ambiguity about which table to update.
     */
    @Transactional
    public void recordVisit(Long id, String locationType) {
        switch (locationType.toUpperCase()) {
            case "ROOM"     -> repository.incrementRoomVisitCount(id);
            case "BUILDING" -> repository.incrementBuildingVisitCount(id);
            default         -> throw new IllegalArgumentException("Unknown locationType: " + locationType);
        }
    }

    /**
     * Returns the top N most visited locations across both rooms and buildings.
     */
    // In LocationService.java

    public List<SearchLocationDTO> getTrending(int limit) {
        return mapRowsWithType(repository.findTrending(limit));
    }

    private List<SearchLocationDTO> mapRowsWithType(List<Object[]> rows) {
        return rows.stream().map(row -> {
            List<String> tags = row[6] instanceof String[] arr
                    ? Arrays.asList(arr)
                    : List.of();

            return new SearchLocationDTO(
                    ((Number) row[0]).longValue(), // id
                    (String) row[1], // name
                    safeParseCategory((String) row[3]), // category
                    (String) row[2], // room (room_no)
                    row[7] != null ? ((Number) row[7]).doubleValue() : null, // latitude
                    row[8] != null ? ((Number) row[8]).doubleValue() : null, // longitude
                    tags, // tag
                    row[4] != null ? ((Number) row[4]).intValue() : null, // floor
                    (String) row[5], // description
                    (String) row[10], // locationType
                    row[9] != null ? ((Number) row[9]).intValue() : null, // visitCount
                    (String) row[11], // buildingName
                    row[12] != null ? ((Number) row[12]).doubleValue() : null, // buildingEntranceLat
                    row[13] != null ? ((Number) row[13]).doubleValue() : null // buildingEntranceLng
            );
        }).toList();
    }

    // Maps rows from searchRooms / searchBuildings (locationType passed explicitly)
    private List<SearchLocationDTO> mapRows(List<Object[]> rows, String locationType) {
        return rows.stream().map(row -> {
            List<String> tags = row[6] instanceof String[] arr
                    ? Arrays.asList(arr)
                    : List.of();
            return new SearchLocationDTO(
                    ((Number) row[0]).longValue(),
                    (String) row[1],
                    safeParseCategory((String) row[3]),
                    (String) row[2],
                    row[7] != null ? ((Number) row[7]).doubleValue() : null,
                    row[8] != null ? ((Number) row[8]).doubleValue() : null,
                    tags,
                    row[4] != null ? ((Number) row[4]).intValue() : null,
                    (String) row[5],
                    locationType,
                    row[9] != null ? ((Number) row[9]).intValue() : null,  // visit_count
                    (String) row[10],
                    row[11] != null ? ((Number) row[11]).doubleValue() : null,
                    row[12] != null ? ((Number) row[12]).doubleValue() : null
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

    public List<LocationDTO> getAllLocations() {
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
                loc.getCategory(),
                loc.getRoom(),
                lat,
                lon,
                loc.getTag(),
                loc.getFloor(),
                loc.getDescription(),
                null,  // legacy Location entity has no locationType
                null,
                null
        );
    }
}