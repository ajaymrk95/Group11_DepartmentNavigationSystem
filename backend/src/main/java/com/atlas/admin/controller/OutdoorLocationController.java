package com.atlas.admin.controller;

import com.atlas.admin.dto.OutdoorLocationDto;
import com.atlas.admin.service.OutdoorLocationService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class OutdoorLocationController {

    private final OutdoorLocationService service;
    public OutdoorLocationController(OutdoorLocationService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<OutdoorLocationDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OutdoorLocationDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<OutdoorLocationDto> create(@Valid @RequestBody OutdoorLocationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OutdoorLocationDto> update(@PathVariable Long id,
                                                      @Valid @RequestBody OutdoorLocationDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
