import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoJsonObject } from "geojson";
import { AnimatedPolyline } from "../../utils/indoormap/mapStyles";

import type { IndoorMapProps } from "../../types/types";
import { useBuildingData } from "../../hooks/useBuildingData";
import { useFloorData } from "../../hooks/useFloorData";
import { routeStyle } from "../../utils/indoormap/mapStyles";
import { MapBoundsController } from "./MapBoundsController";
import { RoomLabels } from "./RoomLabels";
import { stairIcon, startIcon, endIcon } from "../../utils/indoormap/mapIcons";
import FloorToggle from "./FloorToggle";
import { MapLayers } from "./MapLayers";
import { useFloor } from "../../context/FloorContext";


export function IndoorMap({ building, route, routeSegments, fromCoords, toCoords, fromFloor, toFloor, onDataLoad }: IndoorMapProps) {
    if (!building) return null;

    const { floor, setFloor } = useFloor();

    const { data: buildingData, loading: buildingLoading, error: buildingError } =
        useBuildingData(building);

    const { units, paths, loading: floorLoading, error: floorError } =
        useFloorData(buildingData?.id ?? null, floor, building);

    const loading = buildingLoading || floorLoading;
    const error = buildingError || floorError;

    useEffect(() => {
        if (!loading && !error && buildingData) {
            onDataLoad?.({
                buildingOutline: buildingData.outline,
                units,
                paths,
            });
        }
    }, [buildingData, units, paths, loading, error, onDataLoad]);

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

    const allLayers = [buildingData?.outline, units, paths].filter(
        Boolean
    ) as GeoJsonObject[];

    return (
        <div className="h-full w-full rounded-lg shadow-lg overflow-hidden">
            <MapContainer
                center={[0, 0]}
                zoom={2}
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
                />
                <RoomLabels key={`labels-${floor}`} units={units} />
                <MapBoundsController geojsonData={allLayers} />
                <FloorToggle
                    currentFloor={floor}
                    onChange={setFloor}
                    floors={buildingData?.floors ?? 1}
                />

                {route && route.length > 0 && (
                    <AnimatedPolyline positions={route} />
                )}

                {/* {route && route.length > 0 && (
                    <Polyline positions={route} pathOptions={routeStyle} />
                )} */}

                {fromCoords && fromFloor === floor && (
                    <Marker
                        position={[fromCoords[1], fromCoords[0]]}
                        icon={startIcon()}
                    />
                )}

                {toCoords && toFloor === floor && (
                    <Marker
                        position={[toCoords[1], toCoords[0]]}
                        icon={endIcon()}
                    />
                )}

                {routeSegments && routeSegments[floor] && routeSegments[floor + 1] && (
                    <Marker
                        position={routeSegments[floor][routeSegments[floor].length - 1]}
                        icon={stairIcon("up")}
                    />
                )}
                {routeSegments && routeSegments[floor] && routeSegments[floor - 1] && (
                    <Marker
                        position={routeSegments[floor][0]}
                        icon={stairIcon("down")}
                    />
                )}
            </MapContainer>
        </div>
    );
}

export default IndoorMap;