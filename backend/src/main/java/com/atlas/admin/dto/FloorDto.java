package com.atlas.admin.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class FloorDto {
    private String id;
    @NotBlank private String buildingId;
    @NotNull private Integer level;
    @NotBlank private String name;
    private String description;
    private Object pathGeoJson;
    private Object poiGeoJson;
    private Object unitsGeoJson;
    private Map<String, Boolean> pathToggles;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Integer roomCount;

    public FloorDto() {}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getBuildingId() { return buildingId; }
    public void setBuildingId(String buildingId) { this.buildingId = buildingId; }
    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Object getPathGeoJson() { return pathGeoJson; }
    public void setPathGeoJson(Object pathGeoJson) { this.pathGeoJson = pathGeoJson; }
    public Object getPoiGeoJson() { return poiGeoJson; }
    public void setPoiGeoJson(Object poiGeoJson) { this.poiGeoJson = poiGeoJson; }
    public Object getUnitsGeoJson() { return unitsGeoJson; }
    public void setUnitsGeoJson(Object unitsGeoJson) { this.unitsGeoJson = unitsGeoJson; }
    public Map<String, Boolean> getPathToggles() { return pathToggles; }
    public void setPathToggles(Map<String, Boolean> pathToggles) { this.pathToggles = pathToggles; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Integer getRoomCount() { return roomCount; }
    public void setRoomCount(Integer roomCount) { this.roomCount = roomCount; }
}
