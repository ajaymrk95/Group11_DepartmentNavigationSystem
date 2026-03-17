package com.atlas.admin.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "outdoor_locations")
public class OutdoorLocation {
    public enum LocationType { building, entrance, parking, landmark, emergency, other }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    @Column(name = "short_code") private String shortCode;
    @Enumerated(EnumType.STRING) @Column(name = "loc_type", columnDefinition = "location_type") private LocationType locType;
    private String description;
    private Boolean navigable;
    private Double latitude;
    private Double longitude;
    @Column(name = "saved_at") private OffsetDateTime savedAt;
    @Column(name = "created_at", updatable = false) private OffsetDateTime createdAt;
    @Column(name = "updated_at") private OffsetDateTime updatedAt;

    public OutdoorLocation() {}
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
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
