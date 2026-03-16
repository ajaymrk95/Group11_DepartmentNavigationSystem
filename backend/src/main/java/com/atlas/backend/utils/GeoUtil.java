package com.atlas.backend.utils;

import org.locationtech.jts.geom.*;
import org.locationtech.jts.io.geojson.GeoJsonReader;
import org.locationtech.jts.io.geojson.GeoJsonWriter;
import java.util.List;

public class GeoUtil {

    private static final GeometryFactory factory = new GeometryFactory(new PrecisionModel(), 4326);

    // Convert GeoJSON string → Geometry
    public static Geometry fromGeoJson(String geoJson) throws Exception {
        return new GeoJsonReader().read(geoJson);
    }

    // Convert Geometry → GeoJSON string
    public static String toGeoJson(Geometry geom) {
        return new GeoJsonWriter().write(geom);
    }

    // Convert a list of [lng, lat] pairs → MultiPoint geometry
    // Input example: [[76.5, 11.6], [76.51, 11.61]]
    public static Geometry toMultiPoint(List<List<Double>> coordinates) {
        Point[] points = coordinates.stream()
                .map(c -> factory.createPoint(new Coordinate(c.get(0), c.get(1))))
                .toArray(Point[]::new);
        return factory.createMultiPoint(points);
    }
}