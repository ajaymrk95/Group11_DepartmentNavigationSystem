package com.atlas.backend.entity;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Geometry;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomNo; // can be null (e.g. toilets)
    private Integer level; // floor level
    private String category; // "classroom", "toilet", etc.
    private String name; // display name
    private Boolean navigable; // nullable

    @ManyToOne
    @JoinColumn(name = "building_id")
    private Building building;

    @Column(columnDefinition = "geometry(MultiPolygon, 4326)")
    private Geometry geom;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoomNo() {
        return roomNo;
    }

    public void setRoomNo(String roomNo) {
        this.roomNo = roomNo;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getNavigable() {
        return navigable;
    }

    public void setNavigable(Boolean navigable) {
        this.navigable = navigable;
    }

    public Building getBuilding() {
        return building;
    }

    public void setBuilding(Building building) {
        this.building = building;
    }

    public Geometry getGeom() {
        return geom;
    }

    public void setGeom(Geometry geom) {
        this.geom = geom;
    }
}