package com.atlas.admin.service;

import com.atlas.admin.dto.FloorDto;
import com.atlas.admin.entity.*;
import com.atlas.admin.entity.ActivityLog.*;
import com.atlas.admin.exception.NotFoundException;
import com.atlas.admin.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class FloorService {
    private final FloorRepository floorRepo;
    private final BuildingRepository buildingRepo;
    private final RoomRepository roomRepo;
    private final LogService logService;

    public FloorService(FloorRepository f, BuildingRepository b, RoomRepository r, LogService l) {
        this.floorRepo = f; this.buildingRepo = b; this.roomRepo = r; this.logService = l;
    }

    public List<FloorDto> getByBuilding(String buildingId) {
        return floorRepo.findByBuildingIdOrderByLevel(buildingId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public FloorDto getById(String id) { return toDto(findOrThrow(id)); }

    public FloorDto create(FloorDto dto) {
        Building building = buildingRepo.findById(dto.getBuildingId())
            .orElseThrow(() -> new NotFoundException("Building not found: " + dto.getBuildingId()));
        Floor f = new Floor();
        f.setId(dto.getId() != null ? dto.getId()
            : dto.getBuildingId() + "-f" + dto.getLevel() + "-" + System.currentTimeMillis());
        f.setBuilding(building);
        f.setLevel(dto.getLevel());
        f.setName(dto.getName());
        f.setDescription(dto.getDescription());
        f.setPathGeoJson(dto.getPathGeoJson());
        f.setPoiGeoJson(dto.getPoiGeoJson());
        f.setUnitsGeoJson(dto.getUnitsGeoJson());
        f.setPathToggles(dto.getPathToggles() != null ? dto.getPathToggles() : new HashMap<>());
        f.setCreatedAt(OffsetDateTime.now());
        f.setUpdatedAt(OffsetDateTime.now());
        Floor saved = floorRepo.save(f);
        logService.log(LogAction.CREATE, LogEntity.Floor, saved.getId(), saved.getName(),
            "Created floor " + saved.getName() + " in " + dto.getBuildingId());
        return toDto(saved);
    }

    public FloorDto update(String id, FloorDto dto) {
        Floor f = findOrThrow(id);
        f.setLevel(dto.getLevel());
        f.setName(dto.getName());
        f.setDescription(dto.getDescription());
        if (dto.getPathGeoJson()  != null) f.setPathGeoJson(dto.getPathGeoJson());
        if (dto.getPoiGeoJson()   != null) f.setPoiGeoJson(dto.getPoiGeoJson());
        if (dto.getUnitsGeoJson() != null) f.setUnitsGeoJson(dto.getUnitsGeoJson());
        if (dto.getPathToggles()  != null) f.setPathToggles(dto.getPathToggles());
        f.setUpdatedAt(OffsetDateTime.now());
        Floor saved = floorRepo.save(f);
        logService.log(LogAction.UPDATE, LogEntity.Floor, id, f.getName(), "Updated floor: " + id);
        return toDto(saved);
    }

    public FloorDto updatePathToggles(String id, Map<String, Boolean> toggles) {
        Floor f = findOrThrow(id);
        Map<String, Boolean> current = f.getPathToggles() != null ? new HashMap<>(f.getPathToggles()) : new HashMap<>();
        current.putAll(toggles);
        f.setPathToggles(current);
        f.setUpdatedAt(OffsetDateTime.now());
        Floor saved = floorRepo.save(f);
        logService.log(LogAction.UPDATE, LogEntity.Path, id, f.getName(), "Updated path toggles for: " + id);
        return toDto(saved);
    }

    public void delete(String id) {
        Floor f = findOrThrow(id);
        floorRepo.delete(f);
        logService.log(LogAction.DELETE, LogEntity.Floor, id, f.getName(), "Deleted floor: " + f.getName());
    }

    private Floor findOrThrow(String id) {
        return floorRepo.findById(id).orElseThrow(() -> new NotFoundException("Floor not found: " + id));
    }

    private FloorDto toDto(Floor f) {
        FloorDto dto = new FloorDto();
        dto.setId(f.getId());
        dto.setBuildingId(f.getBuilding().getId());
        dto.setLevel(f.getLevel());
        dto.setName(f.getName());
        dto.setDescription(f.getDescription());
        dto.setPathGeoJson(f.getPathGeoJson());
        dto.setPoiGeoJson(f.getPoiGeoJson());
        dto.setUnitsGeoJson(f.getUnitsGeoJson());
        dto.setPathToggles(f.getPathToggles());
        dto.setCreatedAt(f.getCreatedAt());
        dto.setUpdatedAt(f.getUpdatedAt());
        dto.setRoomCount(roomRepo.findByFloorId(f.getId()).size());
        return dto;
    }
}
