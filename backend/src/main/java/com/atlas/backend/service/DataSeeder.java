package com.atlas.backend.service;

import com.atlas.backend.entity.Road;
import com.atlas.backend.repository.RoadRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Service
public class DataSeeder {

    @Autowired
    private RoadRepository roadRepository;

    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    @PostConstruct
    public void seedRoads() {
        if (roadRepository.count() > 0) {
            return; // Don't duplicate data if already seeded
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream inputStream = new ClassPathResource("nitc_roads.geojson").getInputStream();
            JsonNode root = mapper.readTree(inputStream);
            JsonNode features = root.get("features");

            for (JsonNode feature : features) {
                Road road = new Road();
                JsonNode properties = feature.get("properties");
                
                // Mapping GeoJSON properties to Entity
                road.setOsmId(properties.path("id").asText());
                road.setName(properties.path("name").asText("Unnamed Road"));
                road.setHighway(properties.path("highway").asText("path"));

                // Parse Coordinates
                JsonNode coordinates = feature.get("geometry").get("coordinates");
                Coordinate[] coords = new Coordinate[coordinates.size()];
                
                for (int i = 0; i < coordinates.size(); i++) {
                    double lng = coordinates.get(i).get(0).asDouble();
                    double lat = coordinates.get(i).get(1).asDouble();
                    // JTS uses (x, y) order -> (lng, lat)
                    coords[i] = new Coordinate(lng, lat);
                }

                road.setGeometry(geometryFactory.createLineString(coords));
                roadRepository.save(road);
            }
            System.out.println("Successfully seeded NITC roads into PostGIS!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}