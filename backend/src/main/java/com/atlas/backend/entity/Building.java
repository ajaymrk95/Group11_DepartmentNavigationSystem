package com.atlas.backend.entity;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Geometry;

@Entity
@Table(name = "buildings")
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Integer floors;

    @Column(columnDefinition = "geometry(Geometry, 4326)")
    private Geometry geom;

    // Stores multiple entry points as a MultiPoint geometry
    @Column(columnDefinition = "geometry(MultiPoint, 4326)")
    private Geometry entries;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getFloors() {
        return floors;
    }

    public void setFloors(Integer floors) {
        this.floors = floors;
    }

    public Geometry getGeom() {
        return geom;
    }

    public void setGeom(Geometry geom) {
        this.geom = geom;
    }

    public Geometry getEntries() {
        return entries;
    }

    public void setEntries(Geometry entries) {
        this.entries = entries;
    }
}