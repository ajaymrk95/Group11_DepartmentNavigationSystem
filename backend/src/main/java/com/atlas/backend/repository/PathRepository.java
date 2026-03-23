package com.atlas.backend.repository;

import org.springframework.data.repository.query.Param;
import com.atlas.backend.entity.Path;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PathRepository extends JpaRepository<Path, Long> {

    @Query(value = "SELECT * FROM paths WHERE is_accessible = true", nativeQuery = true)
    List<Path> findAllAccessible();

    @Query(value = "SELECT * FROM paths WHERE building_id IS NULL AND is_accessible = true", nativeQuery = true)
    List<Path> findOutdoorPaths();

    //outdoorpaths
    @Query(value = "SELECT * FROM paths WHERE building_id IS NULL", nativeQuery = true)
    List<Path> findAllOutdoorPaths();

    //indoor paths
    @Query(value = "SELECT * FROM paths WHERE building_id = :buildingId AND floor = :floor", nativeQuery = true)
    List<Path> findByBuildingAndFloor(@Param("buildingId") Long buildingId, @Param("floor") Integer floor);

}
