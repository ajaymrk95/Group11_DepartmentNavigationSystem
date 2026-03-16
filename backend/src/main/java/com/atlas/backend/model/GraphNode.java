package com.atlas.backend.model;

import org.locationtech.jts.geom.Coordinate;
import java.util.*;

public class GraphNode {
    public String id;
    public Coordinate coord;
    public List<GraphEdge> edges = new ArrayList<>();

    public GraphNode(String id, Coordinate coord) {
        this.id = id;
        this.coord = coord;
    }

    // Move GraphEdge inside and make it public static
    public static class GraphEdge {
        public String to;
        public double weight;

        public GraphEdge(String to, double weight) {
            this.to = to;
            this.weight = weight;
        }
    }
}