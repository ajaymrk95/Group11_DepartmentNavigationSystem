package com.atlas.backend.aspect;

import com.atlas.backend.annotation.Auditable;
import com.atlas.backend.service.LogService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditAspect {

    private final LogService logService;

    public AuditAspect(LogService logService) {
        this.logService = logService;
    }

    @AfterReturning(
        pointcut = "@annotation(auditable)",
        returning = "result"
    )
    public void afterAuditableMethod(
            JoinPoint joinPoint,
            Auditable auditable,
            Object result) {

        String action     = auditable.action();
        String entityType = auditable.entityType();
        Long   entityId   = null;
        String details;

        if ("DELETE".equals(action)) {
            // DELETE methods return void
            // so get the ID from the first method argument
            Object[] args = joinPoint.getArgs();
            if (args.length > 0 && args[0] instanceof Long) {
                entityId = (Long) args[0];
            }
            details = "Deleted " + entityType + " with id " + entityId;

        } else {
            // CREATE and UPDATE return the saved DTO/entity
            // extract ID via getId() reflection — works for any schema
            entityId = extractId(result);
            details  = buildDetails(action, entityType, result);
        }

        logService.record(action, entityType, entityId, details);
    }

    // Works for ANY entity/DTO that has getId()
    // So adding a new schema like Floor just works automatically
    private Long extractId(Object result) {
        if (result == null) return null;
        try {
            var method = result.getClass().getMethod("getId");
            Object val = method.invoke(result);
            if (val instanceof Long) return (Long) val;
        } catch (Exception ignored) {}
        return null;
    }

    // Builds a human-readable log message
    // Tries to get getName() for a nicer message — falls back gracefully
    private String buildDetails(String action, String entityType, Object result) {
        String label = entityType;

        if (result != null) {
            try {
                var method = result.getClass().getMethod("getName");
                Object name = method.invoke(result);
                if (name != null) label = entityType + ": " + name;
            } catch (Exception ignored) {}
        }

        return switch (action) {
            case "CREATE" -> "Created new " + label;
            case "UPDATE" -> "Updated " + label;
            default       -> action + " on " + label;
        };
    }
}