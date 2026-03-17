package com.atlas.admin.service;

import com.atlas.admin.dto.DashboardStatsDto;
import com.atlas.admin.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {
    private final BuildingRepository buildingRepo;
    private final FloorRepository floorRepo;
    private final RoomRepository roomRepo;
    private final OutdoorLocationRepository locationRepo;
    private final ActivityLogRepository logRepo;

    public DashboardService(BuildingRepository b, FloorRepository f, RoomRepository r,
                             OutdoorLocationRepository l, ActivityLogRepository a) {
        this.buildingRepo = b; this.floorRepo = f; this.roomRepo = r;
        this.locationRepo = l; this.logRepo = a;
    }

    public DashboardStatsDto getStats() {
        Map<String, Long> roomsByCategory = roomRepo.findAll().stream()
            .filter(r -> r.getCategory() != null)
            .collect(Collectors.groupingBy(r -> r.getCategory().name(), Collectors.counting()));

        Map<String, Long> locationsByType = locationRepo.findAll().stream()
            .filter(l -> l.getLocType() != null)
            .collect(Collectors.groupingBy(l -> l.getLocType().name(), Collectors.counting()));

        return new DashboardStatsDto(
            buildingRepo.count(), floorRepo.count(), roomRepo.count(),
            locationRepo.count(), logRepo.count(), roomsByCategory, locationsByType);
    }
}
