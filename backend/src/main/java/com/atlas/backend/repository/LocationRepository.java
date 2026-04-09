package com.atlas.backend.repository;

import java.util.List;

import org.locationtech.jts.geom.Point;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.atlas.backend.entity.Location;

public interface LocationRepository extends JpaRepository<Location, Long> {

    @Query(value = """
        SELECT 
            r.id,
            r.name,
            r.room_no,
            r.category,
            r.floor,
            r.description,
            r.tags,
            ST_Y(ST_GeometryN(r.entries, 1)) AS lat,
            ST_X(ST_GeometryN(r.entries, 1)) AS lng,
            r.visit_count,
            b.name AS building_name,
            ST_Y(ST_GeometryN(b.entries, 1)) AS b_ent_lat,
            ST_X(ST_GeometryN(b.entries, 1)) AS b_ent_lng
        FROM rooms r
        LEFT JOIN buildings b ON b.id = r.building_id
        WHERE 
            LOWER(r.name) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(r.room_no) LIKE LOWER(CONCAT('%', :q, '%')) OR
            EXISTS (
                SELECT 1 
                FROM unnest(r.tags) AS tag
                WHERE LOWER(tag) LIKE LOWER(CONCAT('%', :q, '%'))
            )
        """, nativeQuery = true)
    List<Object[]> searchRooms(@Param("q") String q);

    @Query(value = """
        SELECT 
            b.id,
            b.name,
            NULL AS room_no,
            NULL AS category,
            b.floors,
            b.description,
            b.tags,
            ST_Y(ST_GeometryN(b.entries, 1)) AS lat,
            ST_X(ST_GeometryN(b.entries, 1)) AS lng,
            b.visit_count,
            b.name AS building_name,
            ST_Y(ST_GeometryN(b.entries, 1)) AS b_ent_lat, 
            ST_X(ST_GeometryN(b.entries, 1)) AS b_ent_lng  
        FROM buildings b
        WHERE 
            LOWER(b.name) LIKE LOWER(CONCAT('%', :q, '%')) OR
            EXISTS (
                SELECT 1 
                FROM unnest(b.tags) AS tag
                WHERE LOWER(tag) LIKE LOWER(CONCAT('%', :q, '%'))
            )
        """, nativeQuery = true)
    List<Object[]> searchBuildings(@Param("q") String q);

    @Modifying
    @Query(value = "UPDATE rooms SET visit_count = visit_count + 1 WHERE id = :id", nativeQuery = true)
    void incrementRoomVisitCount(@Param("id") Long id);

    @Modifying
    @Query(value = "UPDATE buildings SET visit_count = visit_count + 1 WHERE id = :id", nativeQuery = true)
    void incrementBuildingVisitCount(@Param("id") Long id);

    @Query(value = """
        SELECT * FROM (
            SELECT
                r.id,
                r.name,
                r.room_no,
                r.category,
                r.floor,
                r.description,
                r.tags,
                ST_Y(ST_GeometryN(r.entries, 1)) AS lat,
                ST_X(ST_GeometryN(r.entries, 1)) AS lng,
                r.visit_count,
                'ROOM' AS location_type,
                b.name AS building_name
            FROM rooms r
            LEFT JOIN buildings b ON b.id = r.building_id
            WHERE r.visit_count > 0
            UNION ALL
            SELECT
                b.id,
                b.name,
                NULL AS room_no,
                NULL AS category,
                b.floors,
                b.description,
                b.tags,
                ST_Y(ST_GeometryN(b.entries, 1)) AS lat,
                ST_X(ST_GeometryN(b.entries, 1)) AS lng,
                b.visit_count,
                'BUILDING' AS location_type,
                b.name AS building_name
            FROM buildings b
            WHERE b.visit_count > 0
        ) combined
        ORDER BY visit_count DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> findTrending(@Param("limit") int limit);

    @Query(value = """
        SELECT le.entrances
        FROM location_entrances le
        JOIN buildings b ON b.id = le.location_id
        WHERE b.name = :name
    """, nativeQuery = true)
    List<Point> getEntrances(@Param("name") String name);
}