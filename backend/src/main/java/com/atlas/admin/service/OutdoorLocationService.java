package com.atlas.admin.service;

import com.atlas.admin.dto.OutdoorLocationDto;
import com.atlas.admin.entity.*;
import com.atlas.admin.entity.ActivityLog.*;
import com.atlas.admin.exception.NotFoundException;
import com.atlas.admin.repository.OutdoorLocationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OutdoorLocationService {
    private final OutdoorLocationRepository repo;
    private final LogService logService;

    public OutdoorLocationService(OutdoorLocationRepository repo, LogService logService) {
        this.repo = repo; this.logService = logService;
    }

    public List<OutdoorLocationDto> getAll() {
        return repo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public OutdoorLocationDto getById(Long id) {
        return toDto(repo.findById(id).orElseThrow(() -> new NotFoundException("Location not found: " + id)));
    }

    public OutdoorLocationDto create(OutdoorLocationDto dto) {
        OutdoorLocation loc = new OutdoorLocation();
        loc.setName(dto.getName());
        loc.setShortCode(dto.getShortCode());
        loc.setLocType(dto.getLocType());
        loc.setDescription(dto.getDescription());
        loc.setNavigable(dto.getNavigable() != null ? dto.getNavigable() : true);
        loc.setLatitude(dto.getLatitude());
        loc.setLongitude(dto.getLongitude());
        loc.setSavedAt(OffsetDateTime.now());
        loc.setCreatedAt(OffsetDateTime.now());
        loc.setUpdatedAt(OffsetDateTime.now());
        OutdoorLocation saved = repo.save(loc);
        logService.log(LogAction.CREATE, LogEntity.OutdoorLocation, String.valueOf(saved.getId()),
            saved.getName(), "Created outdoor location: " + saved.getName());
        return toDto(saved);
    }

    public OutdoorLocationDto update(Long id, OutdoorLocationDto dto) {
        OutdoorLocation loc = repo.findById(id).orElseThrow(() -> new NotFoundException("Location not found: " + id));
        loc.setName(dto.getName()); loc.setShortCode(dto.getShortCode()); loc.setLocType(dto.getLocType());
        loc.setDescription(dto.getDescription()); loc.setNavigable(dto.getNavigable());
        loc.setLatitude(dto.getLatitude()); loc.setLongitude(dto.getLongitude());
        loc.setUpdatedAt(OffsetDateTime.now());
        OutdoorLocation saved = repo.save(loc);
        logService.log(LogAction.UPDATE, LogEntity.OutdoorLocation, String.valueOf(id), loc.getName(), "Updated outdoor location: " + id);
        return toDto(saved);
    }

    public void delete(Long id) {
        OutdoorLocation loc = repo.findById(id).orElseThrow(() -> new NotFoundException("Location not found: " + id));
        repo.delete(loc);
        logService.log(LogAction.DELETE, LogEntity.OutdoorLocation, String.valueOf(id), loc.getName(), "Deleted outdoor location: " + loc.getName());
    }

    private OutdoorLocationDto toDto(OutdoorLocation l) {
        OutdoorLocationDto dto = new OutdoorLocationDto();
        dto.setId(l.getId()); dto.setName(l.getName()); dto.setShortCode(l.getShortCode());
        dto.setLocType(l.getLocType()); dto.setDescription(l.getDescription());
        dto.setNavigable(l.getNavigable()); dto.setLatitude(l.getLatitude()); dto.setLongitude(l.getLongitude());
        dto.setSavedAt(l.getSavedAt()); dto.setCreatedAt(l.getCreatedAt());
        return dto;
    }
}
