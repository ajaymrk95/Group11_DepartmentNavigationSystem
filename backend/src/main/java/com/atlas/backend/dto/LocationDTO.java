package com.atlas.backend.dto;

import java.util.List;

import com.atlas.backend.entity.LocationCategory;

public class LocationDTO {
    private Long id;
    private String name;
    private LocationCategory category;
    private String room;
    private Double latitude;
    private Double longitude;
    private List<String> tag;
    private Integer floor;
    private String description;
    private String locationType; // "ROOM" or "BUILDING"
    private Integer visitCount;
    private String buildingName;

    public LocationDTO(Long id, String name,
                       LocationCategory category, String room,
                       Double latitude, Double longitude,
                       List<String> tag,
                       Integer floor,
                       String description,
                       String locationType,
                       Integer visitCount,
                        String buildingName) {
    
        this.id = id;
        this.name = name;
        this.category = category;
        this.room = room;
        this.latitude = latitude;
        this.longitude = longitude;
        this.tag = tag;
        this.floor = floor;
        this.description = description;
        this.locationType = locationType;
        this.visitCount = visitCount;
        this.buildingName = buildingName;
    }

    public String getDescription() { return description; }
    public Long getId() { return id; }
    public String getName() { return name; }
    public LocationCategory getCategory() { return category; }
    public String getRoom() { return room; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public List<String> getTag() { return tag; }
    public Integer getFloor() { return floor; }
    public String getLocationType() { return locationType; }
    public Integer getVisitCount() { return visitCount; }
    public String getBuildingName() { return buildingName; }
}