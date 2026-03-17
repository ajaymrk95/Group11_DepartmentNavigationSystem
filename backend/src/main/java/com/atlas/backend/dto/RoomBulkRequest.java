package com.atlas.backend.dto;

public class RoomBulkRequest {
    private Long buildingId;
    private String featureCollection;

    public Long getBuildingId() {
        return buildingId;
    }

    public void setBuildingId(Long buildingId) {
        this.buildingId = buildingId;
    }

    public String getFeatureCollection() {
        return featureCollection;
    }

    public void setFeatureCollection(String featureCollection) {
        this.featureCollection = featureCollection;
    }
}