package com.atlas.backend.service;

import com.atlas.backend.entity.Path;
import com.atlas.backend.repository.PathRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PathService {

    @Autowired
    private PathRepository pathRepository;

    public List<Path> findByFloor(Long buildingId, Integer floor) {
        return pathRepository.findByBuildingIdAndFloor(buildingId, floor);
    }
}