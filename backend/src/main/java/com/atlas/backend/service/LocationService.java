package com.atlas.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.atlas.backend.dto.LocationDTO;
import com.atlas.backend.entity.Location;
import com.atlas.backend.repository.LocationRepository;

@Service
public class LocationService {

    private final LocationRepository repository;

    public LocationService(LocationRepository repository) {
        this.repository = repository;
    }

    // 🔹 GET ALL (unchanged logic, but now mapped)
    public List<LocationDTO> getAllLocations() {
        return repository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // 🔹 SEARCH (FIXED — now consistent)
    public List<LocationDTO> searchLocations(String query) {

        if (query == null || query.trim().isEmpty()) {
            return getAllLocations();
        }

        String q = query.trim().toLowerCase();

        return repository.findAll()
                .stream()
                .filter(loc ->
                    (loc.getName() != null && loc.getName().toLowerCase().contains(q)) ||
                    (loc.getRoom() != null && loc.getRoom().toLowerCase().contains(q)) ||
                    (loc.getDescription() != null && loc.getDescription().toLowerCase().contains(q)) ||
                    (loc.getTag() != null && loc.getTag().stream()
                            .anyMatch(tag -> tag.toLowerCase().contains(q)))
                )
                .map(this::mapToDTO)
                .toList();
    }

    // 🔹 ENTITY → DTO mapping (IMPORTANT)
    private LocationDTO mapToDTO(Location loc) {

        Double lat = null;
        Double lng = null;

        if (loc.getCoords() != null) {
            lat = loc.getCoords().getY(); // latitude
            lng = loc.getCoords().getX(); // longitude
        }

        return new LocationDTO(
            loc.getId(),
            loc.getName(),
            loc.getRoom(),
            loc.getType(),
            loc.getCategory(),
            loc.getDescription(),
            lat,
            lng,
            loc.getTag(),
            loc.getFloor()
        );
    }
}