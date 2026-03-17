package com.atlas.admin.service;

import com.atlas.admin.dto.BuildingDto;
import com.atlas.admin.entity.Building;
import com.atlas.admin.entity.ActivityLog.LogAction;
import com.atlas.admin.entity.ActivityLog.LogEntity;
import com.atlas.admin.exception.NotFoundException;
import com.atlas.admin.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BuildingService {
    private final BuildingRepository buildingRepo;
    private final FloorRepository floorRepo;
    private final RoomRepository roomRepo;
    private final LogService logService;

    public BuildingService(BuildingRepository b, FloorRepository f, RoomRepository r, LogService l) {
        this.buildingRepo = b; this.floorRepo = f; this.roomRepo = r; this.logService = l;
    }

    public List<BuildingDto> getAll() {
        return buildingRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public BuildingDto getById(String id) { return toDto(findOrThrow(id)); }

    public BuildingDto create(BuildingDto dto) {
        Building b = new Building();
        b.setId(dto.getId() != null ? dto.getId() : dto.getCode().toLowerCase().replace(" ", "-"));
        b.setCode(dto.getCode());
        b.setName(dto.getName());
        b.setFullName(dto.getFullName());
        b.setInstitute(dto.getInstitute());
        b.setLocation(dto.getLocation());
        b.setYearBuilt(dto.getYearBuilt());
        b.setTotalFloors(dto.getTotalFloors() != null ? dto.getTotalFloors() : 1);
        b.setLongitude(dto.getLongitude());
        b.setLatitude(dto.getLatitude());
        b.setDescription(dto.getDescription());
        b.setOutlineGeoJson(dto.getOutlineGeoJson());
        b.setCreatedAt(OffsetDateTime.now());
        b.setUpdatedAt(OffsetDateTime.now());
        Building saved = buildingRepo.save(b);
        logService.log(LogAction.CREATE, LogEntity.Building, saved.getId(), saved.getName(),
            "Created building: " + saved.getFullName());
        return toDto(saved);
    }

    public BuildingDto update(String id, BuildingDto dto) {
        Building b = findOrThrow(id);
        b.setCode(dto.getCode());
        b.setName(dto.getName());
        b.setFullName(dto.getFullName());
        b.setInstitute(dto.getInstitute());
        b.setLocation(dto.getLocation());
        b.setYearBuilt(dto.getYearBuilt());
        b.setTotalFloors(dto.getTotalFloors() != null ? dto.getTotalFloors() : b.getTotalFloors());
        b.setLongitude(dto.getLongitude());
        b.setLatitude(dto.getLatitude());
        b.setDescription(dto.getDescription());
        if (dto.getOutlineGeoJson() != null) b.setOutlineGeoJson(dto.getOutlineGeoJson());
        b.setUpdatedAt(OffsetDateTime.now());
        Building saved = buildingRepo.save(b);
        logService.log(LogAction.UPDATE, LogEntity.Building, id, saved.getName(), "Updated building: " + id);
        return toDto(saved);
    }

    public void delete(String id) {
        Building b = findOrThrow(id);
        buildingRepo.delete(b);
        logService.log(LogAction.DELETE, LogEntity.Building, id, b.getName(), "Deleted building: " + b.getName());
    }

    private Building findOrThrow(String id) {
        return buildingRepo.findById(id).orElseThrow(() -> new NotFoundException("Building not found: " + id));
    }

    private BuildingDto toDto(Building b) {
        BuildingDto dto = new BuildingDto();
        dto.setId(b.getId());
        dto.setCode(b.getCode());
        dto.setName(b.getName());
        dto.setFullName(b.getFullName());
        dto.setInstitute(b.getInstitute());
        dto.setLocation(b.getLocation());
        dto.setYearBuilt(b.getYearBuilt());
        dto.setTotalFloors(b.getTotalFloors());
        dto.setLongitude(b.getLongitude());
        dto.setLatitude(b.getLatitude());
        dto.setDescription(b.getDescription());
        dto.setOutlineGeoJson(b.getOutlineGeoJson());
        dto.setCreatedAt(b.getCreatedAt());
        dto.setUpdatedAt(b.getUpdatedAt());
        dto.setFloorCount(floorRepo.findByBuildingIdOrderByLevel(b.getId()).size());
        dto.setRoomCount(roomRepo.findByBuildingId(b.getId()).size());
        return dto;
    }
}
