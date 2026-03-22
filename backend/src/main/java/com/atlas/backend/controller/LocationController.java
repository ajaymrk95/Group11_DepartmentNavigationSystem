package com.atlas.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.atlas.backend.dto.LocationDTO;
import com.atlas.backend.service.LocationService;

@RestController
@RequestMapping("/locations")
@CrossOrigin
public class LocationController {
    private final LocationService service;
    public LocationController(LocationService service){
        this.service = service;
    }

    @GetMapping("/search")
    public List<LocationDTO> searchLocations(@RequestParam String q){
        return service.searchLocations(q);
    }

    @GetMapping
    public List<LocationDTO> getAllLocations(){ 
        return service.getAllLocations();
    }
}