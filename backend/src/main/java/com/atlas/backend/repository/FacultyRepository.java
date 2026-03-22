package com.atlas.backend.repository;

import com.atlas.backend.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    List<Faculty> findByDepartment(String department);
    List<Faculty> findByRoomIsNull();
    List<Faculty> findByRoomIsNotNull();

    List<Faculty> findByRoomId(Long roomId);
    
}