package com.atlas.backend.repository;

import com.atlas.backend.entity.Path;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PathRepository extends JpaRepository<Path, Long> {

    List<Path> findByBuildingIdAndFloor(Long buildingId, Integer floor);

    @Query(value = "SELECT * FROM paths WHERE is_accessible = true", nativeQuery = true)
    List<Path> findAllAccessible();

    @Query(value = "SELECT * FROM paths WHERE building_id IS NULL AND is_accessible = true", nativeQuery = true)
    List<Path> findOutdoorPaths();
}
