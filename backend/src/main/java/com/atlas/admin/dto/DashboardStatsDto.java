package com.atlas.admin.dto;

import java.util.Map;

public class DashboardStatsDto {
    private long buildingCount;
    private long floorCount;
    private long roomCount;
    private long locationCount;
    private long logCount;
    private Map<String, Long> roomsByCategory;
    private Map<String, Long> locationsByType;

    public DashboardStatsDto() {}
    public DashboardStatsDto(long buildingCount, long floorCount, long roomCount,
                              long locationCount, long logCount,
                              Map<String, Long> roomsByCategory, Map<String, Long> locationsByType) {
        this.buildingCount = buildingCount; this.floorCount = floorCount;
        this.roomCount = roomCount; this.locationCount = locationCount;
        this.logCount = logCount; this.roomsByCategory = roomsByCategory;
        this.locationsByType = locationsByType;
    }
    public long getBuildingCount() { return buildingCount; }
    public long getFloorCount() { return floorCount; }
    public long getRoomCount() { return roomCount; }
    public long getLocationCount() { return locationCount; }
    public long getLogCount() { return logCount; }
    public Map<String, Long> getRoomsByCategory() { return roomsByCategory; }
    public Map<String, Long> getLocationsByType() { return locationsByType; }
}
