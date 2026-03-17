package com.atlas.admin.controller;

import com.atlas.admin.dto.*;
import com.atlas.admin.service.LogQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    private final LogQueryService logQueryService;
    public LogController(LogQueryService logQueryService) { this.logQueryService = logQueryService; }

    @GetMapping
    public ResponseEntity<PagedResponse<ActivityLogDto>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entity) {
        return ResponseEntity.ok(logQueryService.getLogs(page, size, action, entity));
    }
}
