package com.atlas.backend.controller;

import com.atlas.backend.dto.FacultyRequest ;
import com.atlas.backend.service.FacultyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculties")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    @PostMapping
    public ResponseEntity<FacultyRequest > create(@RequestBody FacultyRequest  dto) {
        return ResponseEntity.ok(facultyService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<FacultyRequest >> getAll() {
        return ResponseEntity.ok(facultyService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacultyRequest > getById(@PathVariable Long id) {
        return ResponseEntity.ok(facultyService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FacultyRequest > update(@PathVariable Long id, @RequestBody FacultyRequest  dto) {
        return ResponseEntity.ok(facultyService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facultyService.delete(id);
        return ResponseEntity.noContent().build();
    }
    // -- get faculty by room -- //
    @GetMapping("/by-room/{roomId}")
    public ResponseEntity<List<FacultyRequest>>  getByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(facultyService.getByRoomId(roomId));
    }
    // --- Room Mapping ---

    @PutMapping("/{facultyId}/assign-room/{roomId}")
    public ResponseEntity<FacultyRequest > assignRoom(
            @PathVariable Long facultyId,
            @PathVariable Long roomId) {
        return ResponseEntity.ok(facultyService.assignRoom(facultyId, roomId));
    }

    @PutMapping("/{facultyId}/unassign-room")
    public ResponseEntity<FacultyRequest > unassignRoom(@PathVariable Long facultyId) {
        return ResponseEntity.ok(facultyService.unassignRoom(facultyId));
    }
}