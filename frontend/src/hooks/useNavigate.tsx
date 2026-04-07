import { useState, useCallback, useEffect } from "react";
import type { FloorData, RouteLatLngs } from "../types/types";
import { useFloor } from "../context/FloorContext";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export interface NavigationState {
    from: string;
    to: string;
    route: RouteLatLngs | null;
    routeSegments: Record<number, RouteLatLngs>;
    noRouteFound: boolean;
    fromCoords: [number, number] | null;
    toCoords: [number, number] | null;
    fromFloor: number | null;
    toFloor: number | null;
    setFrom: (name: string) => void;
    setTo: (name: string) => void;
    onDataLoad: (data: FloorData) => void;
    findPath: (fromCoords: [number, number], toCoords: [number, number],
        fromFloor: number, toFloor: number, overrideBuildingId?: number) => void;
}

export function useNavigation(initialFrom = "", initialTo = ""): NavigationState {
    const [from, setFrom] = useState(initialFrom);
    const [to, setTo] = useState(initialTo);
    const [noRouteFound, setNoRouteFound] = useState(false);
    const [buildingId, setBuildingId] = useState<number | null>(null);
    const [routeSegments, setRouteSegments] = useState<Record<number, RouteLatLngs>>({});
    const [fromCoords, setFromCoords] = useState<[number, number] | null>(null); 
    const [toCoords, setToCoords] = useState<[number, number] | null>(null);     
    const [fromFloor, setFromFloor] = useState<number | null>(null);
    const [toFloor, setToFloor] = useState<number | null>(null);


    const { floor } = useFloor();

    const route = routeSegments[floor] ?? null;

    const onDataLoad = useCallback((data: FloorData) => {
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
        toFloor: number,
        overrideBuildingId?: number 
    ) => {
        const idToUse = overrideBuildingId || buildingId;

        if (!idToUse) {
            console.error("No building ID available for routing");
            return;
        }

        setFromCoords(fromCoords);
        setToCoords(toCoords);
        setFromFloor(fromFloor);
        setToFloor(toFloor);


        try {
            const url = `${BASE_URL}/routes/indoor?buildingId=${idToUse}` +
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

    return {
        from, to, route, routeSegments,
        noRouteFound, fromCoords, toCoords, fromFloor, toFloor,
        setFrom, setTo, onDataLoad, findPath,
    };
}