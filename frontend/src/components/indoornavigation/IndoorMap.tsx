import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoJsonObject } from "geojson";

import { useFloorData } from "../../hooks/useFloorData";
import { MapBoundsController } from "./MapBoundsController";
import { RoomLabels } from "./RoomLabels";
import { FloorToggle } from "./FloorToggle";
import { MapLayers } from "./MapLayers";

const MAP_CENTER: [number, number] = [11.322591, 75.93372];

export function IndoorMap() {
    const [floor, setFloor] = useState<number>(1);
    const { buildingOutline, units, paths, pois, loading, error } = useFloorData(floor, "elhc");

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-100">
                <div className="text-xl text-gray-600">Loading floor plan...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-100">
                <div className="text-xl text-red-500">{error}</div>
            </div>
        );
    }

    const allLayers = [buildingOutline, units, paths, pois].filter(
        Boolean
    ) as GeoJsonObject[];

    return (
        <div className="w-full h-screen flex flex-col bg-gray-100">
            {/* ── Header ─────────────────────────────────────────────── */}
            <header className="bg-white shadow-md p-4 z-10 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                    ELHC — Floor {floor} Indoor Navigation
                </h1>
                <FloorToggle currentFloor={floor} onChange={setFloor} />
            </header>

            {/* ── Map ────────────────────────────────────────────────── */}
            <div className="flex-1 p-4 min-h-0">
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
                            buildingOutline={buildingOutline}
                            units={units}
                            paths={paths}
                            pois={pois}
                        />

                        <RoomLabels key={`labels-${floor}`} units={units} />

                        <MapBoundsController geojsonData={allLayers} />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}

export default IndoorMap;