package com.atlas.backend.repository;

import com.atlas.backend.entity.Log;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LogRepository extends JpaRepository<Log, Long> {
    List<Log> findAllByOrderByTimestampDesc();
    List<Log> findByEntityTypeOrderByTimestampDesc(String entityType);
}