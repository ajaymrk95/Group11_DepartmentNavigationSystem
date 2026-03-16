import { useMemo, useState, useCallback } from "react";
import type { FeatureCollection } from "geojson";
import type { FloorData, RouteLatLngs } from "../types/types";
import { buildGraph } from "../utils/indoornavigation/buildGraph";
import { dijkstra } from "../utils/indoornavigation/dijkstra";
import { getPOINode } from "../utils/indoornavigation/poiToNode";
import { nodesToLatLngs } from "../utils/indoornavigation/nodesToLatLngs";

export interface NavigationState {
    from: string;
    to: string;
    route: RouteLatLngs | null;
    noRouteFound: boolean;
    setFrom: (name: string) => void;
    setTo: (name: string) => void;
    /** Call this when IndoorMap's onDataLoad fires */
    onDataLoad: (data: FloorData) => void;
}

/**
 * Encapsulates all pathfinding state and logic.
 * The component just calls setFrom/setTo and reads `route`.
 */
export function useNavigation(
    initialFrom = "entry1",
    initialTo = "102entry1"
): NavigationState {
    const [from, setFrom] = useState(initialFrom);
    const [to, setTo] = useState(initialTo);
    const [floorData, setFloorData] = useState<FloorData | null>(null);

    const onDataLoad = useCallback((data: FloorData) => {
        setFloorData(data);
    }, []);

    const graph = useMemo(
        () =>
            floorData?.paths
                ? buildGraph(floorData.paths as FeatureCollection)
                : null,
        [floorData?.paths]
    );

    const { route, noRouteFound } = useMemo(() => {
        if (!graph || !floorData?.pois) return { route: null, noRouteFound: false };

        const startNode = getPOINode(floorData.pois as FeatureCollection, from);
        const endNode = getPOINode(floorData.pois as FeatureCollection, to);

        if (!startNode || !endNode) return { route: null, noRouteFound: true };

        const result = dijkstra(graph, startNode, endNode);

        return result
            ? { route: nodesToLatLngs(result.nodes), noRouteFound: false }
            : { route: null, noRouteFound: true };
    }, [graph, floorData?.pois, from, to]);

    return { from, to, route, noRouteFound, setFrom, setTo, onDataLoad };
}