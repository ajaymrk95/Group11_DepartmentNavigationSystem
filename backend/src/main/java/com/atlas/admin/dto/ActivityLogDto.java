package com.atlas.admin.dto;

import com.atlas.admin.entity.ActivityLog.LogAction;
import com.atlas.admin.entity.ActivityLog.LogEntity;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ActivityLogDto {
    private Long id;
    private String admin;
    private LogAction action;
    private LogEntity entity;
    private String entityId;
    private String entityName;
    private String details;
    private OffsetDateTime timestamp;

    public ActivityLogDto() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAdmin() { return admin; }
    public void setAdmin(String admin) { this.admin = admin; }
    public LogAction getAction() { return action; }
    public void setAction(LogAction action) { this.action = action; }
    public LogEntity getEntity() { return entity; }
    public void setEntity(LogEntity entity) { this.entity = entity; }
    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }
    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public OffsetDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }
}
