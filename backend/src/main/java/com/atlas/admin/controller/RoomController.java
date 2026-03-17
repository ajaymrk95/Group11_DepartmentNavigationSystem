package com.atlas.admin.controller;

import com.atlas.admin.dto.RoomDto;
import com.atlas.admin.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;
    public RoomController(RoomService roomService) { this.roomService = roomService; }

    @GetMapping
    public ResponseEntity<List<RoomDto>> getAll(@RequestParam(value = "buildingId", required = false) String buildingId,
                                                 @RequestParam(value = "floorId", required = false) String floorId) {
        if (floorId != null)    return ResponseEntity.ok(roomService.getByFloor(floorId));
        if (buildingId != null) return ResponseEntity.ok(roomService.getByBuilding(buildingId));
        return ResponseEntity.ok(roomService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomDto> getById(@PathVariable("id") String id) {
        return ResponseEntity.ok(roomService.getById(id));
    }

    @PostMapping
    public ResponseEntity<RoomDto> create(@Valid @RequestBody RoomDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomDto> update(@PathVariable("id") String id, @Valid @RequestBody RoomDto dto) {
        return ResponseEntity.ok(roomService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        roomService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
