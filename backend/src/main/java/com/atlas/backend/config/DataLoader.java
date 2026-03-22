package com.atlas.backend.config;

import com.atlas.backend.entity.Path;
import com.atlas.backend.repository.PathRepository;
import com.atlas.backend.utils.GeoUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.locationtech.jts.geom.Geometry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private PathRepository pathRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        // Only load data if no outdoor paths exist
        if (pathRepository.findOutdoorPaths().isEmpty()) {
            System.out.println("No outdoor paths found in database. Populating from nitc_roads.geojson...");
            loadRoadsData();
        } else {
            System.out.println("Outdoor paths already exist in the database. Skipping geojson import.");
        }
    }

    private void loadRoadsData() {
        try (InputStream is = getClass().getResourceAsStream("/nitc_roads.geojson")) {
            if (is == null) {
                System.err.println("Could not find /nitc_roads.geojson in resources!");
                return;
            }

            JsonNode root = objectMapper.readTree(is);
            JsonNode features = root.get("features");
            
            List<Path> pathsToSave = new ArrayList<>();

            for (JsonNode feature : features) {
                JsonNode props = feature.get("properties");
                JsonNode geomNode = feature.get("geometry");

                Path path = new Path();

                // Safely extract properties
                if (props.has("name")) path.setName(props.get("name").asText());
                
                String highway = props.has("highway") ? props.get("highway").asText() : "unclassified";
                path.setRoadType(highway);
                
                String access = props.has("access") ? props.get("access").asText() : "public";
                path.setAccess(access);

                if (props.has("lit")) {
                    path.setLit("yes".equalsIgnoreCase(props.get("lit").asText()));
                }
                
                if (props.has("oneway")) {
                    path.setIsOneway("yes".equalsIgnoreCase(props.get("oneway").asText()));
                }

                // Accessible logic based on our discussion
                boolean isAccessible = true;
                if ("private".equalsIgnoreCase(access) && 
                    !List.of("footway", "path", "service").contains(highway.toLowerCase())) {
                    isAccessible = false;
                }
                path.setIsAccessible(isAccessible);

                // Convert geometry securely
                String geomStr = objectMapper.writeValueAsString(geomNode);
                Geometry parsedGeom = GeoUtil.fromGeoJson(geomStr);
                path.setGeom(parsedGeom);

                pathsToSave.add(path);
            }

            pathRepository.saveAll(pathsToSave);
            System.out.println("Successfully loaded " + pathsToSave.size() + " outdoor paths into the database!");

        } catch (Exception e) {
            System.err.println("Failed to load nitc_roads.geojson data:");
            e.printStackTrace();
        }
    }
}
