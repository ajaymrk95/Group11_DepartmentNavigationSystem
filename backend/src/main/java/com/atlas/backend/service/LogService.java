package com.atlas.backend.service;

import com.atlas.backend.annotation.Auditable;
import com.atlas.backend.entity.Log;
import com.atlas.backend.repository.LogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LogService {

    private final LogRepository logRepository;

    public LogService(LogRepository logRepository) {
        this.logRepository = logRepository;
    }

    // REQUIRES_NEW → runs in its own transaction
    // so log is saved even if the caller's transaction rolls back
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(String action, String entityType, Long entityId, String details) {
        Log log = new Log();
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDetails(details);
        logRepository.save(log);
    }

    public List<Log> getAll() {
        return logRepository.findAllByOrderByTimestampDesc();
    }

    public List<Log> getByEntityType(String entityType) {
        return logRepository.findByEntityTypeOrderByTimestampDesc(entityType);
    }
}