package com.atlas.admin.service;

import com.atlas.admin.entity.ActivityLog;
import com.atlas.admin.entity.ActivityLog.LogAction;
import com.atlas.admin.entity.ActivityLog.LogEntity;
import com.atlas.admin.repository.ActivityLogRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.OffsetDateTime;

@Service
public class LogService {
    private final ActivityLogRepository logRepo;
    public LogService(ActivityLogRepository logRepo) { this.logRepo = logRepo; }

    public void log(LogAction action, LogEntity entity, String entityId, String entityName, String details) {
        String email = "system";
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof String s) email = s;

        ActivityLog log = new ActivityLog();
        log.setAdminEmail(email);
        log.setAction(action);
        log.setEntity(entity);
        log.setEntityId(entityId);
        log.setEntityName(entityName);
        log.setDetails(details);
        log.setCreatedAt(OffsetDateTime.now());
        logRepo.save(log);
    }
}
