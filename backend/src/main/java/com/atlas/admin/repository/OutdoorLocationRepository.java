package com.atlas.admin.repository;

import com.atlas.admin.entity.OutdoorLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface OutdoorLocationRepository extends JpaRepository<OutdoorLocation, Long> {}
