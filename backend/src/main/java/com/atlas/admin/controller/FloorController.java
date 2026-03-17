package com.atlas.admin.controller;

import com.atlas.admin.dto.FloorDto;
import com.atlas.admin.service.FloorService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class FloorController {

    private final FloorService floorService;
    public FloorController(FloorService floorService) { this.floorService = floorService; }

    @GetMapping("/buildings/{buildingId}/floors")
    public ResponseEntity<List<FloorDto>> getByBuilding(@PathVariable("buildingId") String buildingId) {
        return ResponseEntity.ok(floorService.getByBuilding(buildingId));
    }

    @GetMapping("/floors/{id}")
    public ResponseEntity<FloorDto> getById(@PathVariable("id") String id) {
        return ResponseEntity.ok(floorService.getById(id));
    }

    @PostMapping("/floors")
    public ResponseEntity<FloorDto> create(@Valid @RequestBody FloorDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(floorService.create(dto));
    }

    @PutMapping("/floors/{id}")
    public ResponseEntity<FloorDto> update(@PathVariable("id") String id, @Valid @RequestBody FloorDto dto) {
        return ResponseEntity.ok(floorService.update(id, dto));
    }

    @PatchMapping("/floors/{id}/toggles")
    public ResponseEntity<FloorDto> updateToggles(@PathVariable("id") String id,
                                                   @RequestBody Map<String, Boolean> toggles) {
        return ResponseEntity.ok(floorService.updatePathToggles(id, toggles));
    }

    @DeleteMapping("/floors/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        floorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
