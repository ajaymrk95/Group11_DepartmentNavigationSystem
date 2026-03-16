package com.atlas.backend.entity;

import jakarta.persistence.*;
import org.locationtech.jts.geom.LineString;

@Entity
@Table(name = "roads")
public class Road {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String osmId;
    private String name;
    private String highway;

    @Column(columnDefinition = "geometry(LineString, 4326)")
    private LineString geometry;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getOsmId() { return osmId; }
    public void setOsmId(String osmId) { this.osmId = osmId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getHighway() { return highway; }
    public void setHighway(String highway) { this.highway = highway; }
    public LineString getGeometry() { return geometry; }
    public void setGeometry(LineString geometry) { this.geometry = geometry; }
}