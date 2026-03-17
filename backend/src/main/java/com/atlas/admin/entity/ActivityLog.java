package com.atlas.admin.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import org.hibernate.annotations.JdbcTypeCode;//frome here new
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "activity_logs")
public class ActivityLog {
    public enum LogAction  { CREATE, UPDATE, DELETE, LOGIN, LOGOUT }
    public enum LogEntity  { Building, Floor, Room, Path, POI, Auth, OutdoorLocation }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "admin_email", nullable = false) private String adminEmail;
    //@Enumerated(EnumType.STRING) @Column(columnDefinition = "log_action") private LogAction action;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)   // ✅ ADD THIS LINE
    @Column(columnDefinition = "log_action")
    private LogAction action;

    //@Enumerated(EnumType.STRING) @Column(columnDefinition = "log_entity") private LogEntity entity;
    
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)   // ✅ ADD THIS LINE
    @Column(columnDefinition = "log_entity")
    private LogEntity entity;
    
    @Column(name = "entity_id") private String entityId;
    @Column(name = "entity_name") private String entityName;
    private String details;
    @Column(name = "created_at", updatable = false) private OffsetDateTime createdAt;

    public ActivityLog() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAdminEmail() { return adminEmail; }
    public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }
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
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
