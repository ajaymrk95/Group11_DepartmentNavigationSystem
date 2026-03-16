package com.atlas.backend.entity;

import java.util.List;

import org.locationtech.jts.geom.Point;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "locations")
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String room;

    @Column(columnDefinition = "geometry(Point,4326)")
    private Point coords;

    @ElementCollection
    @CollectionTable(name = "location_entrances", joinColumns = @JoinColumn(name = "location_id"))
    @Column(columnDefinition = "geometry(Point,4326)")
    private List<Point> entrances;

    @Enumerated(EnumType.STRING)
    private LocationType type;

    @Enumerated(EnumType.STRING)
    private LocationCategory category;

    @ElementCollection
    @CollectionTable(name = "location_tags", joinColumns = @JoinColumn(name = "location_id"))
    private List<String> tag;

    private Integer floor;

    @Column(length = 1000)
    private String description;

    private Long parentLocationId;

    public Location() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }

    public Point getCoords() { return coords; }
    public void setCoords(Point coords) { this.coords = coords; }

    public List<Point> getEntrances() { return entrances; }
    public void setEntrances(List<Point> entrances) { this.entrances = entrances; }

    public LocationType getType() { return type; }
    public void setType(LocationType type) { this.type = type; }

    public LocationCategory getCategory() { return category; }
    public void setCategory(LocationCategory category) { this.category = category; }

    public List<String> getTag() { return tag; }
    public void setTag(List<String> tag) { this.tag = tag; }

    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getParentLocationId() { return parentLocationId; }
    public void setParentLocationId(Long parentLocationId) { this.parentLocationId = parentLocationId; }
}