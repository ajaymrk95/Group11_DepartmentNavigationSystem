package com.atlas.backend.dto;

import com.fasterxml.jackson.databind.JsonNode;

public class RoomBulkRequest {
    private Long buildingId;
    private JsonNode featureCollection; // ← JsonNode not String

    public Long getBuildingId() {
        return buildingId;
    }

    public void setBuildingId(Long buildingId) {
        this.buildingId = buildingId;
    }

    public JsonNode getFeatureCollection() {
        return featureCollection;
    }

    public void setFeatureCollection(JsonNode featureCollection) {
        this.featureCollection = featureCollection;
    }
}