package com.atlas.backend.service;

import java.util.List;
import org.springframework.stereotype.Service;

import com.atlas.backend.entity.Location;
import com.atlas.backend.dto.LocationDTO;
import com.atlas.backend.repository.LocationRepository;

@Service
public class LocationService {

    private final LocationRepository repository;

    public LocationService(LocationRepository repository) {
        this.repository = repository;
    }

    public List<LocationDTO> searchLocations(String query){

        if(query == null || query.trim().isEmpty()){
            return List.of();
        }

        String q = query.trim();

        List<Location> res = repository.searchLocations(q);

        return res.stream().map(this::mapToDTO).toList();

    }

    public List<LocationDTO> getAllLocations(){
        return repository.findAll().stream().map(this::mapToDTO).toList();
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
            loc.getRoom(),
            loc.getType(),
            loc.getCategory(),
            loc.getDescription(),
            lat,
            lon,
            loc.getTag(),
            loc.getFloor()
        );
    }
    
}