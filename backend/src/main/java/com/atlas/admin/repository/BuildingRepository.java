package com.atlas.admin.repository;

import com.atlas.admin.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface BuildingRepository extends JpaRepository<Building, String> {}
