package com.atlas.admin.service;

import com.atlas.admin.dto.ActivityLogDto;
import com.atlas.admin.dto.PagedResponse;
import com.atlas.admin.entity.ActivityLog;
import com.atlas.admin.entity.ActivityLog.*;
import com.atlas.admin.repository.ActivityLogRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class LogQueryService {
    private final ActivityLogRepository logRepo;
    public LogQueryService(ActivityLogRepository logRepo) { this.logRepo = logRepo; }

    public PagedResponse<ActivityLogDto> getLogs(int page, int size, String action, String entity) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityLog> result;
        if (action != null && !action.isBlank())
            result = logRepo.findByActionOrderByCreatedAtDesc(LogAction.valueOf(action), pageable);
        else if (entity != null && !entity.isBlank())
            result = logRepo.findByEntityOrderByCreatedAtDesc(LogEntity.valueOf(entity), pageable);
        else
            result = logRepo.findAllByOrderByCreatedAtDesc(pageable);

        return new PagedResponse<>(
            result.getContent().stream().map(this::toDto).collect(Collectors.toList()),
            page, size, result.getTotalElements(), result.getTotalPages());
    }

    private ActivityLogDto toDto(ActivityLog l) {
        ActivityLogDto dto = new ActivityLogDto();
        dto.setId(l.getId());
        dto.setAdmin(l.getAdminEmail());
        dto.setAction(l.getAction());
        dto.setEntity(l.getEntity());
        dto.setEntityId(l.getEntityId());
        dto.setEntityName(l.getEntityName());
        dto.setDetails(l.getDetails());
        dto.setTimestamp(l.getCreatedAt());
        return dto;
    }
}
