package com.atlas.backend.service;

import com.atlas.backend.entity.Road;
import com.atlas.backend.model.GraphNode;
import com.atlas.backend.model.GraphNode.GraphEdge; // Import the fixed inner class
import com.atlas.backend.repository.RoadRepository;
import org.locationtech.jts.geom.Coordinate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class NavigationService {

    @Autowired
    private RoadRepository roadRepository;

    public List<Coordinate> navigate(double startLat, double startLng, double endLat, double endLng) {
        Map<String, GraphNode> graph = buildGraph();

        // IMPORTANT: JTS uses (Longitude, Latitude) order
        String startId = findNearestNode(graph, new Coordinate(startLng, startLat));
        String endId = findNearestNode(graph, new Coordinate(endLng, endLat));

        if (startId == null || endId == null) return new ArrayList<>();

        return calculateShortestPath(graph, startId, endId);
    }

    private Map<String, GraphNode> buildGraph() {
        Map<String, GraphNode> graph = new HashMap<>();
        List<Road> roads = roadRepository.findAll();

        for (Road road : roads) {
            if (road.getGeometry() == null) continue;
            
            Coordinate[] coords = road.getGeometry().getCoordinates();
            for (int i = 0; i < coords.length - 1; i++) {
                String idA = coords[i].x + "," + coords[i].y;
                String idB = coords[i+1].x + "," + coords[i+1].y;

                graph.putIfAbsent(idA, new GraphNode(idA, coords[i]));
                graph.putIfAbsent(idB, new GraphNode(idB, coords[i+1]));

                // Use JTS distance for weight
                double dist = coords[i].distance(coords[i+1]);
                
                // Use the new inner class syntax
                graph.get(idA).edges.add(new GraphEdge(idB, dist));
                graph.get(idB).edges.add(new GraphEdge(idA, dist));
            }
        }
        return graph;
    }

    private String findNearestNode(Map<String, GraphNode> graph, Coordinate p) {
        return graph.values().stream()
                .min(Comparator.comparingDouble(n -> n.coord.distance(p)))
                .map(n -> n.id).orElse(null);
    }

    private List<Coordinate> calculateShortestPath(Map<String, GraphNode> graph, String start, String end) {
        Map<String, Double> distances = new HashMap<>();
        Map<String, String> predecessors = new HashMap<>();
        
        // Initialize distances
        graph.keySet().forEach(id -> distances.put(id, Double.MAX_VALUE));
        distances.put(start, 0.0);

        PriorityQueue<String> pq = new PriorityQueue<>(Comparator.comparingDouble(distances::get));
        pq.add(start);

        while (!pq.isEmpty()) {
            String u = pq.poll();
            if (u.equals(end)) break;

            for (GraphEdge edge : graph.get(u).edges) {
                double alt = distances.get(u) + edge.weight;
                if (alt < distances.get(edge.to)) {
                    distances.put(edge.to, alt);
                    predecessors.put(edge.to, u);
                    pq.add(edge.to);
                }
            }
        }

        List<Coordinate> path = new ArrayList<>();
        String at = end;
        while (at != null) {
            path.add(graph.get(at).coord);
            at = predecessors.get(at);
        }
        Collections.reverse(path);
        return path;
    }
}