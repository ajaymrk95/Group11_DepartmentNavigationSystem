package com.atlas.backend.repository;

import java.util.List;

import org.locationtech.jts.geom.Point;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.atlas.backend.entity.Location;

public interface LocationRepository extends JpaRepository<Location, Long> {

    @Query(value = """
        SELECT 
            l.id,
            l.name,
            ST_Y(ST_PointOnSurface(l.entries)) AS lat,
            ST_X(ST_PointOnSurface(l.entries)) AS lng,
            ARRAY_AGG(t.tag) AS tags,
            l.floors
        FROM buildings l
        LEFT JOIN building_tag t ON l.id = t.building_id
        WHERE l.id IN (
            SELECT b.id
            FROM buildings b
            LEFT JOIN building_tag bt ON b.id = bt.building_id
            WHERE 
                LOWER(b.name) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(bt.tag) LIKE LOWER(CONCAT('%', :q, '%'))
        )
        GROUP BY l.id, l.name, l.entries, l.floors
        """, nativeQuery = true)
    List<Object[]> searchOutdoorLocations(@Param("q") String q);

    @Query(value = """
    SELECT le.entrances
    FROM location_entrances le
    JOIN buildings b ON b.id = le.location_id
    WHERE b.name = :name
""", nativeQuery = true)
    List<Point> getEntrances(@Param("name") String name);

}