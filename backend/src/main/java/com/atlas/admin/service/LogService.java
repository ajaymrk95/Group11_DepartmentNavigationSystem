package com.atlas.admin.service;

import com.atlas.admin.entity.ActivityLog;
import com.atlas.admin.entity.ActivityLog.LogAction;
import com.atlas.admin.entity.ActivityLog.LogEntity;
import com.atlas.admin.repository.ActivityLogRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;

@Service
public class LogService {

    private final ActivityLogRepository logRepo;

    public LogService(ActivityLogRepository logRepo) {
        this.logRepo = logRepo;
    }

    // REQUIRES_NEW: log writes always get their own transaction
    // so a log failure never rolls back the caller's transaction
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(LogAction action, LogEntity entity,
                    String entityId, String entityName, String details) {
        try {
            String email = "system";
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof String s) {
                email = s;
            }

            ActivityLog log = new ActivityLog();
            log.setAdminEmail(email);
            log.setAction(action);
            log.setEntity(entity);
            log.setEntityId(entityId);
            log.setEntityName(entityName);
            log.setDetails(details);
            log.setCreatedAt(OffsetDateTime.now());
            logRepo.save(log);
        } catch (Exception e) {
            // Logging must never break business operations
            System.err.println("[LogService] Failed to write log: " + e.getMessage());
        }
    }
}