package com.atlas.backend.dto;

import java.util.List;
import java.util.Map;

public class FloorRouteResponse {

    private List<FloorSegment> segments;
    private double distance;

    public FloorRouteResponse(List<FloorSegment> segments, double distance) {
        this.segments = segments;
        this.distance = distance;
    }

    public List<FloorSegment> getSegments() {
        return segments;
    }

    public double getDistance() {
        return distance;
    }

    // ── Inner class ───────────────────────────────────────────────────────────

    public static class FloorSegment {
        private int floor;
        private List<List<Double>> coordinates;

        public FloorSegment(int floor, List<List<Double>> coordinates) {
            this.floor = floor;
            this.coordinates = coordinates;
        }

        public int getFloor() {
            return floor;
        }

        public List<List<Double>> getCoordinates() {
            return coordinates;
        }
    }
}