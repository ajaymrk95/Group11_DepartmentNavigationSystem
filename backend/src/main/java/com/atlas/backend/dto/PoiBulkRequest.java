package com.atlas.backend.dto;

public class PoiBulkRequest {
    private Long buildingId;
    private Integer level;
    private String featureCollection;

    public Long getBuildingId() {
        return buildingId;
    }

    public void setBuildingId(Long buildingId) {
        this.buildingId = buildingId;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public String getFeatureCollection() {
        return featureCollection;
    }

    public void setFeatureCollection(String featureCollection) {
        this.featureCollection = featureCollection;
    }
}