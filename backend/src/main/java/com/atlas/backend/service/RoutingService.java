package com.atlas.backend.service;

import com.atlas.backend.dto.RouteResponse;
import com.atlas.backend.entity.Path;
import com.atlas.backend.repository.PathRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.LineString;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RoutingService {

    @Autowired
    private PathRepository pathRepository;

    // Helper classes for Dijkstra
    private static class Node {
        String id; // "lat,lon"
        List<Edge> edges = new ArrayList<>();

        public Node(String id) {
            this.id = id;
        }
    }

    private static class Edge {
        Node target;
        double weight;

        public Edge(Node target, double weight) {
            this.target = target;
            this.weight = weight;
        }
    }

    private static class QueueNode implements Comparable<QueueNode> {
        Node node;
        double distance;

        public QueueNode(Node node, double distance) {
            this.node = node;
            this.distance = distance;
        }

        @Override
        public int compareTo(QueueNode o) {
            return Double.compare(this.distance, o.distance);
        }
    }

    private String toNodeId(double lat, double lon) {
        return String.format("%.8f,%.8f", lat, lon);
    }

    public RouteResponse calculateRoute(double startLat, double startLng, double endLat, double endLng) {
        // 1. Build the in-memory graph from all accessible paths
        List<Path> accessiblePaths = pathRepository.findAllAccessible();
        Map<String, Node> graph = buildGraph(accessiblePaths);

        if (graph.isEmpty()) {
            throw new RuntimeException("No routing data available.");
        }

        // 2. Snap requested start/end to nearest actual nodes in the graph
        Node startNode = findNearestNode(graph, startLat, startLng);
        Node endNode = findNearestNode(graph, endLat, endLng);

        if (startNode == null || endNode == null) {
            throw new RuntimeException("Could not snap to a valid route point.");
        }

        // 3. Run Dijkstra
        return dijkstra(graph, startNode, endNode);
    }

    public RouteResponse calculateFloorRoute(double startLat, double startLng, double endLat, double endLng, Long buildingId, Integer floor) {
        // 1. Build the in-memory graph from all accessible paths
        List<Path> accessiblePaths = pathRepository.findAllAccessibleFloorPaths(buildingId, floor);
        Map<String, Node> graph = buildGraph(accessiblePaths);

        if (graph.isEmpty()) {
            throw new RuntimeException("No routing data available.");
        }

        // 2. Snap requested start/end to nearest actual nodes in the graph
        Node startNode = findNearestNode(graph, startLat, startLng);
        Node endNode = findNearestNode(graph, endLat, endLng);

        if (startNode == null || endNode == null) {
            throw new RuntimeException("Could not snap to a valid route point.");
        }

        // 3. Run Dijkstra
        return dijkstra(graph, startNode, endNode);
    }

    private Map<String, Node> buildGraph(List<Path> paths) {
        Map<String, Node> graph = new HashMap<>();

        for (Path p : paths) {
            Geometry geom = p.getGeom();
            if (geom == null) continue;

            // Handle both Simple LineStrings and MultiLineStrings dynamically
            for (int geomIdx = 0; geomIdx < geom.getNumGeometries(); geomIdx++) {
                Geometry subGeom = geom.getGeometryN(geomIdx);

                if (!(subGeom instanceof LineString)) continue;

                LineString ls = (LineString) subGeom;
                if (ls.getNumPoints() < 2) continue;

                Coordinate[] coords = ls.getCoordinates();
                for (int i = 0; i < coords.length - 1; i++) {
                    // GeoJSON coordinates are usually [longitude, latitude]
                    Coordinate c1 = coords[i];
                    Coordinate c2 = coords[i + 1];

                    String id1 = toNodeId(c1.y, c1.x);
                    String id2 = toNodeId(c2.y, c2.x);

                    graph.putIfAbsent(id1, new Node(id1));
                    graph.putIfAbsent(id2, new Node(id2));

                    Node n1 = graph.get(id1);
                    Node n2 = graph.get(id2);

                    double dist = haversineDistance(c1.y, c1.x, c2.y, c2.x);

                    // Add direct edge
                    n1.edges.add(new Edge(n2, dist));

                    // Add reverse edge if not one-way
                    if (p.getIsOneway() == null || !p.getIsOneway()) {
                        n2.edges.add(new Edge(n1, dist));
                    }
                }
            }
        }
        return graph;
    }

    private Node findNearestNode(Map<String, Node> graph, double lat, double lng) {
        Node nearest = null;
        double minDistance = Double.MAX_VALUE;

        for (String id : graph.keySet()) {
            String[] parts = id.split(",");
            double nodeLat = Double.parseDouble(parts[0]);
            double nodeLng = Double.parseDouble(parts[1]);

            double currentDist = haversineDistance(lat, lng, nodeLat, nodeLng);

            if (currentDist < minDistance) {
                minDistance = currentDist;
                nearest = graph.get(id);
            }
        }
        return nearest;
    }

    private RouteResponse dijkstra(Map<String, Node> graph, Node start, Node end) {
        System.out.println(start);
        System.out.println(end);
        Map<Node, Double> distances = new HashMap<>();
        Map<Node, Node> previous = new HashMap<>();
        PriorityQueue<QueueNode> pq = new PriorityQueue<>();

        for (Node node : graph.values()) {
            distances.put(node, Double.MAX_VALUE);
        }

        distances.put(start, 0.0);
        pq.add(new QueueNode(start, 0.0));

        while (!pq.isEmpty()) {
            QueueNode current = pq.poll();
            Node u = current.node;

            if (current.distance > distances.get(u)) continue;

            // Stop condition
            if (u.id.equals(end.id)) break;

            for (Edge edge : u.edges) {
                Node v = edge.target;
                double newDist = distances.get(u) + edge.weight;

                if (newDist < distances.get(v)) {
                    distances.put(v, newDist);
                    previous.put(v, u);
                    pq.add(new QueueNode(v, newDist));
                }
            }
        }

        if (distances.get(end) == Double.MAX_VALUE) {
            throw new RuntimeException("No path found between the points.");
        }

        // Reconstruct path
        List<List<Double>> pathCoords = new ArrayList<>();
        Node current = end;
        while (current != null) {
            String[] parts = current.id.split(",");
            // Return [lng, lat] to match GeoJSON LineString standard
            double lat = Double.parseDouble(parts[0]);
            double lng = Double.parseDouble(parts[1]);
            pathCoords.add(0, List.of(lng, lat));
            current = previous.get(current);
        }

        return new RouteResponse(pathCoords, distances.get(end));
    }

    // Returns distance in meters
    private double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Radius of the earth in meters
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
