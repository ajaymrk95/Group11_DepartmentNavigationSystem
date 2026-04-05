import { useState, useCallback, useEffect } from "react";
import type { FloorData, RouteLatLngs } from "../types/types";
import { useFloor } from "../context/FloorContext";

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

export function useNavigation(initialFrom = "", initialTo = ""): NavigationState {
    const [from, setFrom] = useState(initialFrom);
    const [to, setTo] = useState(initialTo);
    const [noRouteFound, setNoRouteFound] = useState(false);
    const [buildingId, setBuildingId] = useState<number | null>(null);
    const [routes, setRoutes] = useState<Record<number, RouteLatLngs | null>>({});
    const { floor } = useFloor();

    // Current floor's route
    const route = routes[floor] ?? null;

    const onDataLoad = useCallback((data: FloorData) => {
        // Extract buildingId and floor from loaded data
        const outline = data.buildingOutline as any;
        if (outline?.features?.[0]?.properties) {
            setBuildingId(outline.features[0].properties.id);
        }
    }, []);

    useEffect(() => {
        setNoRouteFound(false);
    }, [floor]);

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
                setRoutes(prev => ({ ...prev, [floor]: null }));
                setNoRouteFound(true);
                return;
            }

            const data = await res.json();

            if (data.coordinates && data.coordinates.length > 0) {
                const latLngs: [number, number][] = data.coordinates.map(
                    ([lng, lat]: [number, number]) => [lat, lng]
                );
                setRoutes(prev => ({ ...prev, [floor]: latLngs }));
                setNoRouteFound(false);
            } else {
                setRoutes(prev => ({ ...prev, [floor]: null }));
                setNoRouteFound(true);
            }
        } catch (err) {
            console.error("Routing failed:", err);
            setRoutes(prev => ({ ...prev, [floor]: null }));
            setNoRouteFound(true);
        }
    }, [buildingId, floor]);

    return { from, to, route, noRouteFound, setFrom, setTo, onDataLoad, findPath };
}