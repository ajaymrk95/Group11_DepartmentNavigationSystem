package com.atlas.backend.dto;

import java.util.List;
import java.util.Map;

public class RouteResponse {
    private String type = "LineString";
    private List<List<Double>> coordinates;
    private Map<String, Object> properties;

    public RouteResponse(List<List<Double>> coordinates, double distanceMeters) {
        this.coordinates = coordinates;
        this.properties = Map.of("distanceMeters", distanceMeters);
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public List<List<Double>> getCoordinates() { return coordinates; }
    public void setCoordinates(List<List<Double>> coordinates) { this.coordinates = coordinates; }
    public Map<String, Object> getProperties() { return properties; }
    public void setProperties(Map<String, Object> properties) { this.properties = properties; }
}
