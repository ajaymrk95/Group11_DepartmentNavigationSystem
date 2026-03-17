package com.atlas.admin.service;

import com.atlas.admin.dto.RoomDto;
import com.atlas.admin.entity.*;
import com.atlas.admin.entity.ActivityLog.*;
import com.atlas.admin.exception.NotFoundException;
import com.atlas.admin.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoomService {
    private final RoomRepository roomRepo;
    private final BuildingRepository buildingRepo;
    private final FloorRepository floorRepo;
    private final LogService logService;

    public RoomService(RoomRepository r, BuildingRepository b, FloorRepository f, LogService l) {
        this.roomRepo = r; this.buildingRepo = b; this.floorRepo = f; this.logService = l;
    }

    public List<RoomDto> getAll() {
        return roomRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }
    public List<RoomDto> getByBuilding(String buildingId) {
        return roomRepo.findByBuildingId(buildingId).stream().map(this::toDto).collect(Collectors.toList());
    }
    public List<RoomDto> getByFloor(String floorId) {
        return roomRepo.findByFloorId(floorId).stream().map(this::toDto).collect(Collectors.toList());
    }
    public RoomDto getById(String id) {
        return toDto(roomRepo.findById(id).orElseThrow(() -> new NotFoundException("Room not found: " + id)));
    }

    public RoomDto create(RoomDto dto) {
        Building building = buildingRepo.findById(dto.getBuildingId())
            .orElseThrow(() -> new NotFoundException("Building not found: " + dto.getBuildingId()));
        Floor floor = floorRepo.findById(dto.getFloorId())
            .orElseThrow(() -> new NotFoundException("Floor not found: " + dto.getFloorId()));
        Room r = new Room();
        r.setId(dto.getId() != null ? dto.getId() : "room-" + System.currentTimeMillis());
        r.setBuilding(building);
        r.setFloor(floor);
        r.setRoomNo(dto.getRoomNo());
        r.setName(dto.getName());
        r.setCategory(dto.getCategory());
        r.setLevel(dto.getLevel() != null ? dto.getLevel() : floor.getLevel());
        r.setCapacity(dto.getCapacity());
        r.setDescription(dto.getDescription());
        r.setAccessible(dto.getAccessible() != null ? dto.getAccessible() : true);
        r.setFeatureId(dto.getFeatureId());
        r.setCreatedAt(OffsetDateTime.now());
        r.setUpdatedAt(OffsetDateTime.now());
        Room saved = roomRepo.save(r);
        logService.log(LogAction.CREATE, LogEntity.Room, saved.getId(), saved.getName(), "Created room: " + saved.getName());
        return toDto(saved);
    }

    public RoomDto update(String id, RoomDto dto) {
        Room r = roomRepo.findById(id).orElseThrow(() -> new NotFoundException("Room not found: " + id));
        if (dto.getFloorId() != null && !dto.getFloorId().equals(r.getFloor().getId())) {
            Floor floor = floorRepo.findById(dto.getFloorId())
                .orElseThrow(() -> new NotFoundException("Floor not found: " + dto.getFloorId()));
            r.setFloor(floor);
        }
        r.setRoomNo(dto.getRoomNo()); r.setName(dto.getName()); r.setCategory(dto.getCategory());
        r.setLevel(dto.getLevel()); r.setCapacity(dto.getCapacity());
        r.setDescription(dto.getDescription()); r.setAccessible(dto.getAccessible());
        r.setFeatureId(dto.getFeatureId()); r.setUpdatedAt(OffsetDateTime.now());
        Room saved = roomRepo.save(r);
        logService.log(LogAction.UPDATE, LogEntity.Room, id, r.getName(), "Updated room: " + id);
        return toDto(saved);
    }

    public void delete(String id) {
        Room r = roomRepo.findById(id).orElseThrow(() -> new NotFoundException("Room not found: " + id));
        roomRepo.delete(r);
        logService.log(LogAction.DELETE, LogEntity.Room, id, r.getName(), "Deleted room: " + r.getName());
    }

    private RoomDto toDto(Room r) {
        RoomDto dto = new RoomDto();
        dto.setId(r.getId()); dto.setBuildingId(r.getBuilding().getId()); dto.setFloorId(r.getFloor().getId());
        dto.setRoomNo(r.getRoomNo()); dto.setName(r.getName()); dto.setCategory(r.getCategory());
        dto.setLevel(r.getLevel()); dto.setCapacity(r.getCapacity()); dto.setDescription(r.getDescription());
        dto.setAccessible(r.getAccessible()); dto.setFeatureId(r.getFeatureId());
        dto.setCreatedAt(r.getCreatedAt()); dto.setUpdatedAt(r.getUpdatedAt());
        return dto;
    }
}
