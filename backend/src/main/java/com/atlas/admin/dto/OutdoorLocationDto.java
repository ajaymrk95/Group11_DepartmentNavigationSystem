package com.atlas.admin.dto;

import com.atlas.admin.entity.OutdoorLocation.LocationType;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class OutdoorLocationDto {
    private Long id;
    @NotBlank private String name;
    private String shortCode;
    @NotNull private LocationType locType;
    private String description;
    private Boolean navigable;
    @NotNull private Double latitude;
    @NotNull private Double longitude;
    private OffsetDateTime savedAt;
    private OffsetDateTime createdAt;

    public OutdoorLocationDto() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getShortCode() { return shortCode; }
    public void setShortCode(String shortCode) { this.shortCode = shortCode; }
    public LocationType getLocType() { return locType; }
    public void setLocType(LocationType locType) { this.locType = locType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getNavigable() { return navigable; }
    public void setNavigable(Boolean navigable) { this.navigable = navigable; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public OffsetDateTime getSavedAt() { return savedAt; }
    public void setSavedAt(OffsetDateTime savedAt) { this.savedAt = savedAt; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
