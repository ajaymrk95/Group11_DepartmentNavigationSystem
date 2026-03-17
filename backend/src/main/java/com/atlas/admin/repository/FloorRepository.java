package com.atlas.admin.repository;

import com.atlas.admin.entity.Floor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FloorRepository extends JpaRepository<Floor, String> {
    List<Floor> findByBuildingIdOrderByLevel(String buildingId);
    void deleteByBuildingId(String buildingId);
}
