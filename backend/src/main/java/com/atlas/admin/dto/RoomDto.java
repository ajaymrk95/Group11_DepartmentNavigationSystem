package com.atlas.admin.dto;

import com.atlas.admin.entity.Room.RoomCategory;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoomDto {
    private String id;
    @NotBlank private String buildingId;
    @NotBlank private String floorId;
    private String roomNo;
    @NotBlank private String name;
    @NotNull private RoomCategory category;
    private Integer level;
    private Integer capacity;
    private String description;
    private Boolean accessible;
    private Integer featureId;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public RoomDto() {}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getBuildingId() { return buildingId; }
    public void setBuildingId(String buildingId) { this.buildingId = buildingId; }
    public String getFloorId() { return floorId; }
    public void setFloorId(String floorId) { this.floorId = floorId; }
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
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
