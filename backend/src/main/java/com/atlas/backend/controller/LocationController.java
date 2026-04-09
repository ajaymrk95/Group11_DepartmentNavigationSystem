package com.atlas.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.atlas.backend.dto.LocationDTO;
import com.atlas.backend.dto.SearchLocationDTO;
import com.atlas.backend.service.LocationService;

@RestController
@RequestMapping("/locations")
@CrossOrigin
public class LocationController {

    private final LocationService service;

    public LocationController(LocationService service) {
        this.service = service;
    }

    @GetMapping("/search")
    public List<SearchLocationDTO> searchLocations(@RequestParam String q) {
        return service.searchLocations(q);
    }

    @GetMapping("/buildings")
    public List<SearchLocationDTO> getAllBuildings() {
        return service.getAllBuildings();
    }

    @GetMapping
    public List<LocationDTO> getAllLocations() {
        return service.getAllLocations();
    }

    /**
     * Called by the frontend when a user clicks/selects a location.
     * locationType must be "ROOM" or "BUILDING" — it's returned in every search result
     * via LocationDTO.locationType, so the frontend always has it available.
     *
     * POST /locations/visit?id=42&locationType=ROOM
     */
    @PostMapping("/visit")
    public void recordVisit(@RequestParam Long id,
                            @RequestParam String locationType) {
        service.recordVisit(id, locationType);
    }

    /**
     * Returns the top frequently visited locations across rooms and buildings.
     * Used to populate the "Popular Locations" side panel in the frontend.
     *
     * GET /locations/trending        → returns top 5 (default)
     * GET /locations/trending?limit=10 → returns top 10
     */
    @GetMapping("/trending")
    public List<LocationDTO> getTrending(
            @RequestParam(defaultValue = "5") int limit) {
        return service.getTrending(limit);
    }
}