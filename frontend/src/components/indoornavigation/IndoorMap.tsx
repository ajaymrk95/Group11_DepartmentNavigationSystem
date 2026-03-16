import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoJsonObject } from "geojson";

import type { IndoorMapProps } from "../../types/types";
import { useFloorData } from "../../hooks/useFloorData";
import { MapBoundsController } from "./MapBoundsController";
import { RoomLabels } from "./RoomLabels";
import { FloorToggle } from "./FloorToggle";
import { MapLayers } from "./MapLayers";

const MAP_CENTER: [number, number] = [11.322591, 75.93372];

const ROUTE_STYLE = {
    color: "#ef4444",
    weight: 5,
    dashArray: "10, 6",
    lineCap: "round" as const,
    lineJoin: "round" as const,
};

/**
 * Reusable indoor map component.
 *
 * - Standalone (no props): simple floor-plan viewer.
 * - With `route`:          renders a highlighted navigation path.
 * - With `onDataLoad`:     exposes loaded GeoJSON so the parent can run
 *                          pathfinding without reaching into internals.
 * - With `headerSlot`:     injects extra controls into the header bar.
 */
export function IndoorMap({ route, onDataLoad, headerSlot }: IndoorMapProps) {
    const [floor, setFloor] = useState<number>(1);
    const { buildingOutline, units, paths, pois, loading, error } =
        useFloorData(floor, "elhc");

    // Notify parent whenever fresh data arrives
    useEffect(() => {
        if (!loading && !error) {
            onDataLoad?.({ buildingOutline, units, paths, pois });
        }
    }, [buildingOutline, units, paths, pois, loading, error, onDataLoad]);

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-100">
                <div className="text-xl text-gray-600">Loading floor plan…</div>
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
            {/* ── Header ──────────────────────────────────────────────── */}
            <header className="bg-white shadow-md p-4 z-10 flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800 shrink-0">
                    ELHC — Floor {floor}
                </h1>

                {/* Parent-injected controls (e.g. route selectors) */}
                {headerSlot && <div className="flex-1">{headerSlot}</div>}

                <FloorToggle currentFloor={floor} onChange={setFloor} />
            </header>

            {/* ── Map ─────────────────────────────────────────────────── */}
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

                        {/* Route overlay — only rendered when a path is provided */}
                        {route && route.length > 0 && (
                            <Polyline positions={route} pathOptions={ROUTE_STYLE} />
                        )}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}

export default IndoorMap;