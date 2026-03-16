package com.atlas.backend.controller;

import org.locationtech.jts.geom.Coordinate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.atlas.backend.service.NavigationService;

import java.util.List;

@RestController 
@RequestMapping("/api/navigate")
public class NavigationController {

    @Autowired
    private NavigationService navService;

    @GetMapping
    public List<Coordinate> getRoute(@RequestParam double sLat, @RequestParam double sLng, 
                                     @RequestParam double eLat, @RequestParam double eLng) {
        return navService.navigate(sLat, sLng, eLat, eLng);
    }
} 