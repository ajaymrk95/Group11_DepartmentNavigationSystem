package com.atlas.backend.entity;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Geometry;

@Entity
@Table(name = "paths")
public class Path {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "road_type", nullable = false)
    private String roadType;

    @Column(name = "is_accessible", columnDefinition = "boolean default true")
    private Boolean isAccessible = true;

    @Column(name = "is_oneway", columnDefinition = "boolean default false")
    private Boolean isOneway = false;

    // Optional attributes
    @Column(columnDefinition = "boolean default false")
    private Boolean lit = false;

    @Column(columnDefinition = "varchar(20) default 'public'")
    private String access = "public";

    // For indoor paths — if null, it's an outdoor path
    private Integer floor;

    @ManyToOne
    @JoinColumn(name = "building_id")
    private Building building;

    @Column(columnDefinition = "geometry(Geometry, 4326)", nullable = false)
    private Geometry geom;

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

    public String getRoadType() {
        return roadType;
    }

    public void setRoadType(String roadType) {
        this.roadType = roadType;
    }

    public Boolean getIsAccessible() {
        return isAccessible;
    }

    public void setIsAccessible(Boolean isAccessible) {
        this.isAccessible = isAccessible;
    }

    public Boolean getIsOneway() {
        return isOneway;
    }

    public void setIsOneway(Boolean isOneway) {
        this.isOneway = isOneway;
    }

    public Boolean getLit() {
        return lit;
    }

    public void setLit(Boolean lit) {
        this.lit = lit;
    }

    public String getAccess() {
        return access;
    }

    public void setAccess(String access) {
        this.access = access;
    }

    public Integer getFloor() {
        return floor;
    }

    public void setFloor(Integer floor) {
        this.floor = floor;
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
