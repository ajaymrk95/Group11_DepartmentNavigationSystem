package com.atlas.admin.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;

@Entity
@Table(name = "rooms")
public class Room {
    public enum RoomCategory { classroom, lab, hall, office, toilet, stairs, corridor, other }

    @Id private String id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "building_id", nullable = false) private Building building;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "floor_id", nullable = false) private Floor floor;
    @Column(name = "room_no") private String roomNo;
    @Column(nullable = false) private String name;
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "room_category")
    private RoomCategory category;
    private Integer level;
    private Integer capacity;
    private String description;
    private Boolean accessible;
    @Column(name = "feature_id") private Integer featureId;
    @Column(name = "faculty_name") private String facultyName;
    @Column(name = "created_at", updatable = false) private OffsetDateTime createdAt;
    @Column(name = "updated_at") private OffsetDateTime updatedAt;

    public Room() {}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Building getBuilding() { return building; }
    public void setBuilding(Building building) { this.building = building; }
    public Floor getFloor() { return floor; }
    public void setFloor(Floor floor) { this.floor = floor; }
    public String getRoomNo() { return roomNo; }
    public void setRoomNo(String roomNo) { this.roomNo = roomNo; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public RoomCategory getCategory() { return category; }
    public void setCategory(RoomCategory category) { this.category = category; }
    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getAccessible() { return accessible; }
    public void setAccessible(Boolean accessible) { this.accessible = accessible; }
    public Integer getFeatureId() { return featureId; }
    public void setFeatureId(Integer featureId) { this.featureId = featureId; }
    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
