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
    findPath: (fromCoords: [number, number], toCoords: [number, number], fromFloor: number,
        toFloor: number) => void;
}

export function useNavigation(initialFrom = "", initialTo = ""): NavigationState {
    const [from, setFrom] = useState(initialFrom);
    const [to, setTo] = useState(initialTo);
    const [noRouteFound, setNoRouteFound] = useState(false);
    const [buildingId, setBuildingId] = useState<number | null>(null);
    const [routeSegments, setRouteSegments] = useState<Record<number, RouteLatLngs>>({});
    const { floor } = useFloor();

    // Current floor's route
    const route = routeSegments[floor] ?? null;

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
        toCoords: [number, number],
        fromFloor: number,
        toFloor: number
    ) => {
        if (!buildingId) { setNoRouteFound(true); return; }

        try {
            const url = `${BASE_URL}/routes/indoor?buildingId=${buildingId}` +
                `&startLng=${fromCoords[0]}&startLat=${fromCoords[1]}&startFloor=${fromFloor}` +
                `&endLng=${toCoords[0]}&endLat=${toCoords[1]}&endFloor=${toFloor}`;
                console.log(url);

            const res = await fetch(url);
            if (!res.ok) { setRouteSegments({}); setNoRouteFound(true); return; }

            const data = await res.json();

            if (data.segments && data.segments.length > 0) {
                const segments: Record<number, RouteLatLngs> = {};
                data.segments.forEach((seg: any) => {
                    segments[seg.floor] = seg.coordinates.map(
                        ([lng, lat]: [number, number]) => [lat, lng]
                    );
                });
                setRouteSegments(segments);
                setNoRouteFound(false);
            } else {
                setRouteSegments({});
                setNoRouteFound(true);
            }
        } catch (err) {
            console.error("Routing failed:", err);
            setRouteSegments({});
            setNoRouteFound(true);
        }
    }, [buildingId]);

    return { from, to, route, noRouteFound, setFrom, setTo, onDataLoad, findPath };
}