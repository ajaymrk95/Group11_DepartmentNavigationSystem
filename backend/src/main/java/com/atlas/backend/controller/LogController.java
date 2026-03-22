package com.atlas.backend.controller;

import com.atlas.backend.entity.Log;
import com.atlas.backend.service.LogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    private final LogService logService;

    public LogController(LogService logService) {
        this.logService = logService;
    }

    // GET /api/logs          → all logs newest first
    // GET /api/logs?type=Faculty  → filter by entity type
    @GetMapping
    public ResponseEntity<List<Log>> getLogs(
            @RequestParam(required = false) String type) {
        if (type != null && !type.isBlank()) {
            return ResponseEntity.ok(logService.getByEntityType(type));
        }
        return ResponseEntity.ok(logService.getAll());
    }
}