package com.atlas.admin.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import java.time.OffsetDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class BuildingDto {
    private String id;
    @NotBlank private String code;
    @NotBlank private String name;
    @NotBlank private String fullName;
    private String institute;
    private String location;
    private Integer yearBuilt;
    private Integer totalFloors;
    private Double longitude;
    private Double latitude;
    private String description;
    private Object outlineGeoJson;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Integer floorCount;
    private Integer roomCount;

    public BuildingDto() {}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getInstitute() { return institute; }
    public void setInstitute(String institute) { this.institute = institute; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Integer getYearBuilt() { return yearBuilt; }
    public void setYearBuilt(Integer yearBuilt) { this.yearBuilt = yearBuilt; }
    public Integer getTotalFloors() { return totalFloors; }
    public void setTotalFloors(Integer totalFloors) { this.totalFloors = totalFloors; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Object getOutlineGeoJson() { return outlineGeoJson; }
    public void setOutlineGeoJson(Object outlineGeoJson) { this.outlineGeoJson = outlineGeoJson; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Integer getFloorCount() { return floorCount; }
    public void setFloorCount(Integer floorCount) { this.floorCount = floorCount; }
    public Integer getRoomCount() { return roomCount; }
    public void setRoomCount(Integer roomCount) { this.roomCount = roomCount; }
}
