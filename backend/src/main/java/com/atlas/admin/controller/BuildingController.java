package com.atlas.admin.controller;

import com.atlas.admin.dto.BuildingDto;
import com.atlas.admin.service.BuildingService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/buildings")
public class BuildingController {

    private final BuildingService buildingService;
    public BuildingController(BuildingService buildingService) { this.buildingService = buildingService; }

    @GetMapping
    public ResponseEntity<List<BuildingDto>> getAll() {
        return ResponseEntity.ok(buildingService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BuildingDto> getById(@PathVariable String id) {
        return ResponseEntity.ok(buildingService.getById(id));
    }

    @PostMapping
    public ResponseEntity<BuildingDto> create(@Valid @RequestBody BuildingDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(buildingService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BuildingDto> update(@PathVariable String id, @Valid @RequestBody BuildingDto dto) {
        return ResponseEntity.ok(buildingService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        buildingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
