package com.atlas.backend.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;

public class BuildingRequest {
    private String name;
    private Integer floors;
    private JsonNode geoJson; // ← change from String to JsonNode
    private List<List<Double>> entries;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getFloors() {
        return floors;
    }

    public void setFloors(Integer floors) {
        this.floors = floors;
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