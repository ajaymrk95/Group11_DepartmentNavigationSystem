package com.atlas.backend.dto;

import java.util.List;

public class RoomSummaryResponse {
    private Long id;
    private String name;
    private String roomNo;
    private String category;
    private Integer floor;
    private Boolean isAccessible;
    private String description;
    private String[] tags;
    private Long buildingId;
    private String buildingName; // joined from buildings table — useful for display
    private Boolean navigable;

    // Constructors
    public RoomSummaryResponse() {}

    public RoomSummaryResponse(Long id, String name, String roomNo, String category,
                                Integer floor, Boolean isAccessible, String description,
                                String[] tags, Long buildingId, String buildingName) {
        this.id = id;
        this.name = name;
        this.roomNo = roomNo;
        this.category = category;
        this.floor = floor;
        this.isAccessible = isAccessible;
        this.description = description;
        this.tags = tags;
        this.buildingId = buildingId;
        this.buildingName = buildingName;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRoomNo() { return roomNo; }
    public void setRoomNo(String roomNo) { this.roomNo = roomNo; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }

    public Boolean getIsAccessible() { return isAccessible; }
    public void setIsAccessible(Boolean isAccessible) { this.isAccessible = isAccessible; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String[] getTags() { return tags; }
    public void setTags(String[] tags) { this.tags = tags; }

    public Long getBuildingId() { return buildingId; }
    public void setBuildingId(Long buildingId) { this.buildingId = buildingId; }

    public String getBuildingName() { return buildingName; }
    public void setBuildingName(String buildingName) { this.buildingName = buildingName; }

    public Boolean getNavigable() { return navigable; }
    public void setNavigable(Boolean navigable) { this.navigable = navigable; }
}