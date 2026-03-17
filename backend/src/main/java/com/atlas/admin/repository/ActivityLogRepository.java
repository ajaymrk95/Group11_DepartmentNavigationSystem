package com.atlas.admin.repository;

import com.atlas.admin.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<ActivityLog> findByActionOrderByCreatedAtDesc(ActivityLog.LogAction action, Pageable pageable);
    Page<ActivityLog> findByEntityOrderByCreatedAtDesc(ActivityLog.LogEntity entity, Pageable pageable);
}
