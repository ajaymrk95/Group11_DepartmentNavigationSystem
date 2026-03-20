package com.atlas.backend.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;

public class RoomRequest {

    private Long buildingId;
    private String roomNo;
    private Integer floor;
    private String category;
    private String name;
    private Boolean isAccessible;
    private String description;
    private String[] tags;
    private JsonNode geoJson;
    private List<List<Double>> entries;

    public Long getBuildingId() {
        return buildingId;
    }

    public void setBuildingId(Long buildingId) {
        this.buildingId = buildingId;
    }

    public String getRoomNo() {
        return roomNo;
    }

    public void setRoomNo(String roomNo) {
        this.roomNo = roomNo;
    }

    public Integer getFloor() {
        return floor;
    }

    public void setFloor(Integer floor) {
        this.floor = floor;
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

    public Boolean getIsAccessible() {
        return isAccessible;
    }

    public void setIsAccessible(Boolean isAccessible) {
        this.isAccessible = isAccessible;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String[] getTags() {
        return tags;
    }

    public void setTags(String[] tags) {
        this.tags = tags;
    }

    public JsonNode getGeoJson() {
        return geoJson;
    }

    public void setGeoJson(JsonNode geoJson) {
        this.geoJson = geoJson;
    }

    public List<List<Double>> getEntries() {
        return entries;
    }

    public void setEntries(List<List<Double>> entries) {
        this.entries = entries;
    }
}