import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoJsonObject } from "geojson";

import type { IndoorMapProps } from "../../types/types";
import { useBuildingData } from "../../hooks/useBuildingData";
import { useFloorData } from "../../hooks/useFloorData";
import { routeStyle } from "../../utils/indoormap/mapStyles";
import { MapBoundsController } from "./MapBoundsController";
import { RoomLabels } from "./RoomLabels";
import FloorToggle from "./FloorToggle";
import { MapLayers } from "./MapLayers";

const MAP_CENTER: [number, number] = [11.322591, 75.93372];

export function IndoorMap({ building, floorNo, route, onDataLoad }: IndoorMapProps) {
    if (!building) return null;

    const [floor, setFloor] = useState<number>(floorNo ?? 1);

    const { data: buildingData, loading: buildingLoading, error: buildingError } =
        useBuildingData(building);

    const { units, paths, pois, loading: floorLoading, error: floorError } =
        useFloorData(buildingData?.id ?? null, floor, building);

    const loading = buildingLoading || floorLoading;
    const error = buildingError || floorError;

    useEffect(() => {
        if (!loading && !error && buildingData) {
            onDataLoad?.({
                buildingOutline: buildingData.outline,
                units,
                paths,
                pois,
            });
        }
    }, [buildingData, units, paths, pois, loading, error, onDataLoad]);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-xl text-gray-600">Loading floor plan…</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-xl text-red-500">{error}</div>
            </div>
        );
    }

    const allLayers = [buildingData?.outline, units, paths, pois].filter(
        Boolean
    ) as GeoJsonObject[];

    return (
        <div className="h-full w-full rounded-lg shadow-lg overflow-hidden">
            <MapContainer
                center={MAP_CENTER}
                zoom={20}
                className="h-full w-full"
                zoomControl
                attributionControl={false}
                maxZoom={22}
                minZoom={20}
                zoomSnap={0.5}
                wheelPxPerZoomLevel={120}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    opacity={0.3}
                />
                <MapLayers
                    floor={floor}
                    buildingOutline={buildingData?.outline ?? null}
                    units={units}
                    paths={paths}
                    pois={pois}
                />
                <RoomLabels key={`labels-${floor}`} units={units} />
                <MapBoundsController geojsonData={allLayers} />
                <FloorToggle currentFloor={floor} onChange={setFloor} />
                {route && route.length > 0 && (
                    <Polyline positions={route} pathOptions={routeStyle} />
                )}
            </MapContainer>
        </div>
    );
}

export default IndoorMap;