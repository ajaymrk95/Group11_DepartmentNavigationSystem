package com.atlas.backend.service;

import com.atlas.backend.dto.ReportRequest;
import com.atlas.backend.entity.Report;
import com.atlas.backend.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    public Report submit(ReportRequest req) {
        if (req.getType() == null || req.getType().isBlank())
            throw new RuntimeException("Type is required.");
        if (req.getDescription() == null || req.getDescription().isBlank())
            throw new RuntimeException("Description is required.");

        Report r = new Report();
        r.setType(req.getType().trim());
        r.setDescription(req.getDescription().trim());
        return reportRepository.save(r);
    }

    public List<Report> findAll() {
        return reportRepository.findAllByOrderByCreatedAtDesc();
    }

    public Report updateStatus(Long id, String status) {
        Report r = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found: " + id));
        r.setStatus(status.toUpperCase());
        return reportRepository.save(r);
    }
}