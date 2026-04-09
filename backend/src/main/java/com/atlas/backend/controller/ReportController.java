package com.atlas.backend.controller;

import com.atlas.backend.dto.ReportRequest;
import com.atlas.backend.entity.Report;
import com.atlas.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // Public — no auth required
    @PostMapping
    public ResponseEntity<Map<String, Object>> submit(@RequestBody ReportRequest body) {
        try {
            Report r = reportService.submit(body);
            return ResponseEntity.ok(toMap(r));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin — protected by your existing JWT filter
    @GetMapping
    public List<Map<String, Object>> getAll() {
        return reportService.findAll().stream().map(this::toMap).toList();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            Report r = reportService.updateStatus(id, body.get("status"));
            return ResponseEntity.ok(toMap(r));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> toMap(Report r) {
        return Map.of(
            "id",          r.getId(),
            "type",        r.getType(),
            "description", r.getDescription(),
            "status",      r.getStatus(),
            "createdAt",   r.getCreatedAt().toString()
        );
    }
}