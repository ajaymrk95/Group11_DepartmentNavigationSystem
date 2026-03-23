package com.atlas.backend.controller;

import com.atlas.backend.dto.RouteResponse;
import com.atlas.backend.service.RoutingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "http://localhost:5173") // Allow local dev
public class RoutingController {

    @Autowired
    private RoutingService routingService;

    @GetMapping("/navigate")
    public ResponseEntity<?> getRoute(
            @RequestParam double startLat,
            @RequestParam double startLng,
            @RequestParam double endLat,
            @RequestParam double endLng) {
            
        try {
            RouteResponse route = routingService.calculateRoute(startLat, startLng, endLat, endLng);
            return ResponseEntity.ok(route);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error calculating route: " + e.getMessage());
        }
    }
}
