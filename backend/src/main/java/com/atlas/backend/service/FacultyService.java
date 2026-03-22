package com.atlas.backend.service;

import com.atlas.backend.annotation.Auditable;
import com.atlas.backend.dto.FacultyRequest;
import com.atlas.backend.entity.Faculty;
import com.atlas.backend.entity.Room;
import com.atlas.backend.repository.FacultyRepository;
import com.atlas.backend.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final RoomRepository roomRepository;

    public FacultyService(FacultyRepository facultyRepository, RoomRepository roomRepository) {
        this.facultyRepository = facultyRepository;
        this.roomRepository = roomRepository;
    }

    // --- CRUD ---
    @Auditable(action = "CREATE", entityType = "Faculty")
    public FacultyRequest create(FacultyRequest dto) {
        Faculty faculty = new Faculty();
        mapDtoToEntity(dto, faculty);
        return mapEntityToDto(facultyRepository.save(faculty));
    }

    public FacultyRequest getById(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Faculty not found: " + id));
        return mapEntityToDto(faculty);
    }

    public List<FacultyRequest> getAll() {
        return facultyRepository.findAll()
                .stream().map(this::mapEntityToDto).collect(Collectors.toList());
    }

    @Auditable(action = "UPDATE", entityType = "Faculty")
    public FacultyRequest update(Long id, FacultyRequest dto) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Faculty not found: " + id));
        mapDtoToEntity(dto, faculty);
        return mapEntityToDto(facultyRepository.save(faculty));
    }

    @Auditable(action = "DELETE", entityType = "Faculty")
    public void delete(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Faculty not found: " + id));
        // unlink room before deleting
        faculty.setRoom(null);
        facultyRepository.save(faculty);
        facultyRepository.delete(faculty);
    }
    // -- room faculty --/
    public List<FacultyRequest> getByRoomId(Long roomId) {
        return facultyRepository.findByRoomId(roomId)
        .stream()
        .map(this::mapEntityToDto)
        .toList();
    }

    // --- Room Mapping ---
    @Auditable(action = "UPDATE", entityType = "Faculty")
    public FacultyRequest assignRoom(Long facultyId, Long roomId) {
    Faculty faculty = facultyRepository.findById(facultyId)
            .orElseThrow(() -> new RuntimeException("Faculty not found: " + facultyId));

    Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));

    if (!"faculty office".equalsIgnoreCase(room.getCategory())) {
        throw new RuntimeException("Room category must be 'faculty office'");
    }

    faculty.setRoom(room);
    return mapEntityToDto(facultyRepository.save(faculty));
}

    @Auditable(action = "UPDATE", entityType = "Faculty")
    public FacultyRequest unassignRoom(Long facultyId) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found: " + facultyId));
        faculty.setRoom(null);
        return mapEntityToDto(facultyRepository.save(faculty));
    }

    // --- Helpers ---

    private void mapDtoToEntity(FacultyRequest dto, Faculty faculty) {
        faculty.setName(dto.getName());
        faculty.setDesignation(dto.getDesignation());
        faculty.setDepartment(dto.getDepartment());
        faculty.setEmail(dto.getEmail());
        faculty.setPhone(dto.getPhone());
        faculty.setDescription(dto.getDescription());
        faculty.setProfileImageUrl(dto.getProfileImageUrl());
        faculty.setTags(dto.getTags());

        if (dto.getRoomId() != null) {
            Room room = roomRepository.findById(dto.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found: " + dto.getRoomId()));
            faculty.setRoom(room);
        } else {
            faculty.setRoom(null);
        }
    }

    private FacultyRequest mapEntityToDto(Faculty faculty) {
        FacultyRequest dto = new FacultyRequest();
        dto.setId(faculty.getId());
        dto.setName(faculty.getName());
        dto.setDesignation(faculty.getDesignation());
        dto.setDepartment(faculty.getDepartment());
        dto.setEmail(faculty.getEmail());
        dto.setPhone(faculty.getPhone());
        dto.setDescription(faculty.getDescription());
        dto.setProfileImageUrl(faculty.getProfileImageUrl());
        dto.setTags(faculty.getTags());

        if (faculty.getRoom() != null) {
            dto.setRoomId(faculty.getRoom().getId());
            dto.setRoomNo(faculty.getRoom().getRoomNo());
            dto.setRoomName(faculty.getRoom().getName());
            if (faculty.getRoom().getBuilding() != null) {
                dto.setBuildingId(faculty.getRoom().getBuilding().getId());
                dto.setBuildingName(faculty.getRoom().getBuilding().getName());
            }
        }

        return dto;
    }
}