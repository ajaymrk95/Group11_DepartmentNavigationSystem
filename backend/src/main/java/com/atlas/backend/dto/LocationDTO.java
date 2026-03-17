package com.atlas.backend.dto;

import java.util.List;

import com.atlas.backend.entity.LocationCategory;
import com.atlas.backend.entity.LocationType;

public class LocationDTO {

    private Long id;
    private String name;
    private String room;
    private LocationType type;
    private LocationCategory category;
    private String description;

    // 🔹 converted from Point
    private Double latitude;
    private Double longitude;

    // 🔹 needed for filters
    private List<String> tag;

    private Integer floor;

    public LocationDTO(Long id, String name, String room,
                       LocationType type, LocationCategory category,
                       String description,
                       Double latitude, Double longitude,
                       List<String> tag,
                       Integer floor) {

        this.id = id;
        this.name = name;
        this.room = room;
        this.type = type;
        this.category = category;
        this.description = description;
        this.latitude = latitude;
        this.longitude = longitude;
        this.tag = tag;
        this.floor = floor;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getRoom() { return room; }
    public LocationType getType() { return type; }
    public LocationCategory getCategory() { return category; }
    public String getDescription() { return description; }

    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }

    public List<String> getTag() { return tag; }

    public Integer getFloor() { return floor; }
}