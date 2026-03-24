import { useState, useCallback } from "react";
import type { FloorData, RouteLatLngs } from "../types/types";

const BASE_URL = "http://localhost:8080/api";

export interface NavigationState {
    from: string;
    to: string;
    route: RouteLatLngs | null;
    noRouteFound: boolean;
    setFrom: (name: string) => void;
    setTo: (name: string) => void;
    onDataLoad: (data: FloorData) => void;
    findPath: (fromCoords: [number, number], toCoords: [number, number]) => void;
}

export function useNavigation(
    initialFrom = "",
    initialTo = ""
): NavigationState {
    const [from, setFrom] = useState(initialFrom);
    const [to, setTo] = useState(initialTo);
    const [route, setRoute] = useState<RouteLatLngs | null>(null);
    const [noRouteFound, setNoRouteFound] = useState(false);
    const [buildingId, setBuildingId] = useState<number | null>(null);
    const [floor, setFloor] = useState<number>(1);

    const onDataLoad = useCallback((data: FloorData) => {
        // Extract buildingId and floor from loaded data
        const outline = data.buildingOutline as any;
        if (outline?.features?.[0]?.properties) {
            setBuildingId(outline.features[0].properties.id);
        }
    }, []);

    const findPath = useCallback(async (
        fromCoords: [number, number],
        toCoords: [number, number]
    ) => {
        if (!buildingId) {
            setNoRouteFound(true);
            return;
        }

        try {
            const url = `${BASE_URL}/routes/indoor?buildingId=${buildingId}&floor=${floor}` +
                `&startLng=${fromCoords[0]}&startLat=${fromCoords[1]}` +
                `&endLng=${toCoords[0]}&endLat=${toCoords[1]}`;

            const res = await fetch(url);

            if (!res.ok) {
                setRoute(null);
                setNoRouteFound(true);
                return;
            }

            const data = await res.json();

            if (data.coordinates && data.coordinates.length > 0) {
                // Convert [lng, lat] → [lat, lng] for Leaflet
                const latLngs: [number, number][] = data.coordinates.map(
                    ([lng, lat]: [number, number]) => [lat, lng]
                );
                setRoute(latLngs);
                setNoRouteFound(false);
            } else {
                setRoute(null);
                setNoRouteFound(true);
            }
        } catch (err) {
            console.error("Routing failed:", err);
            setRoute(null);
            setNoRouteFound(true);
        }
    }, [buildingId, floor]);

    return { from, to, route, noRouteFound, setFrom, setTo, onDataLoad, findPath };
}