package com.atlas.backend.service;

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

    public FacultyRequest update(Long id, FacultyRequest dto) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Faculty not found: " + id));
        mapDtoToEntity(dto, faculty);
        return mapEntityToDto(facultyRepository.save(faculty));
    }

    public void delete(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Faculty not found: " + id));
        // unlink room before deleting
        faculty.setRoom(null);
        facultyRepository.save(faculty);
        facultyRepository.delete(faculty);
    }

    // --- Room Mapping ---

    public FacultyRequest assignRoom(Long facultyId, Long roomId) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found: " + facultyId));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));

        if (!"faculty office".equalsIgnoreCase(room.getCategory())) {
            throw new RuntimeException("Room category must be 'faculty office'");
        }

        // ensure no other faculty is already assigned to this room
        if (facultyRepository.findByRoomIsNotNull().stream()
                .anyMatch(f -> !f.getId().equals(facultyId)
                        && f.getRoom() != null
                        && f.getRoom().getId().equals(roomId))) {
            throw new RuntimeException("Room is already assigned to another faculty");
        }

        faculty.setRoom(room);
        return mapEntityToDto(facultyRepository.save(faculty));
    }

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