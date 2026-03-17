package com.atlas.admin.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "buildings")
public class Building {
    @Id private String id;
    @Column(nullable = false, unique = true) private String code;
    @Column(nullable = false) private String name;
    @Column(name = "full_name", nullable = false) private String fullName;
    private String institute;
    private String location;
    @Column(name = "year_built") private Integer yearBuilt;
    @Column(name = "total_floors", nullable = false) private Integer totalFloors = 1;
    private Double longitude;
    private Double latitude;
    @Column(columnDefinition = "TEXT") private String description;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "outline_geojson", columnDefinition = "jsonb") private Object outlineGeoJson;
    @Column(name = "created_at", updatable = false) private OffsetDateTime createdAt;
    @Column(name = "updated_at") private OffsetDateTime updatedAt;
    @OneToMany(mappedBy = "building", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Floor> floors = new ArrayList<>();

    public Building() {}
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
    public List<Floor> getFloors() { return floors; }
    public void setFloors(List<Floor> floors) { this.floors = floors; }
}
