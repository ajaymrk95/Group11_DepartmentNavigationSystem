package com.atlas.admin.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.*;

@Entity
@Table(name = "floors")
public class Floor {
    @Id private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false) private Building building;
    @Column(nullable = false) private Integer level;
    @Column(nullable = false) private String name;
    private String description;
    @JdbcTypeCode(SqlTypes.JSON) @Column(name = "path_geojson", columnDefinition = "jsonb") private Object pathGeoJson;
    @JdbcTypeCode(SqlTypes.JSON) @Column(name = "poi_geojson", columnDefinition = "jsonb") private Object poiGeoJson;
    @JdbcTypeCode(SqlTypes.JSON) @Column(name = "units_geojson", columnDefinition = "jsonb") private Object unitsGeoJson;
    @JdbcTypeCode(SqlTypes.JSON) @Column(name = "path_toggles", columnDefinition = "jsonb") private Map<String, Boolean> pathToggles = new HashMap<>();
    @Column(name = "created_at", updatable = false) private OffsetDateTime createdAt;
    @Column(name = "updated_at") private OffsetDateTime updatedAt;
    @OneToMany(mappedBy = "floor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Room> rooms = new ArrayList<>();

    public Floor() {}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Building getBuilding() { return building; }
    public void setBuilding(Building building) { this.building = building; }
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
    public List<Room> getRooms() { return rooms; }
    public void setRooms(List<Room> rooms) { this.rooms = rooms; }
}
