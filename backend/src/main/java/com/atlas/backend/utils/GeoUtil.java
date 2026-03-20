package com.atlas.backend.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.locationtech.jts.geom.*;
import org.locationtech.jts.io.geojson.GeoJsonReader;
import org.locationtech.jts.io.geojson.GeoJsonWriter;
import java.util.List;

public class GeoUtil {

    private static final GeometryFactory factory = new GeometryFactory(new PrecisionModel(), 4326);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static Geometry fromGeoJson(String geoJson) throws Exception {
        return new GeoJsonReader().read(geoJson);
    }

    public static String toGeoJson(Geometry geom) {
        return new GeoJsonWriter().write(geom);
    }

    public static Geometry toMultiPoint(List<List<Double>> coordinates) {
        Point[] points = coordinates.stream()
                .map(c -> factory.createPoint(new Coordinate(c.get(0), c.get(1))))
                .toArray(Point[]::new);
        return factory.createMultiPoint(points);
    }

    // Convert GeoJSON string → Object (so it's not double stringified in responses)
    public static Object parseGeoJson(String geoJson) {
        try {
            return objectMapper.readValue(geoJson, Object.class);
        } catch (Exception e) {
            return null;
        }
    }
}