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
    onDataLoad: (data: FloorData) => void;
    findPath: () => void;
}

export function useNavigation(
    initialFrom = "entry1",
    initialTo = "entry1"
): NavigationState {
    const [from, setFrom] = useState(initialFrom);
    const [to, setTo] = useState(initialTo);
    const [floorData, setFloorData] = useState<FloorData | null>(null);
    const [route, setRoute] = useState<RouteLatLngs | null>(null);
    const [noRouteFound, setNoRouteFound] = useState(false);

    const onDataLoad = useCallback((data: FloorData) => {
        setFloorData(data);
    }, []);

    const graph = useMemo(
        () => floorData?.paths ? buildGraph(floorData.paths as FeatureCollection) : null,
        [floorData?.paths]
    );

    const findPath = useCallback(() => {
        if (!graph || !floorData?.pois) {
            setRoute(null);
            setNoRouteFound(true);
            return;
        }

        const startNode = getPOINode(floorData.pois as FeatureCollection, from);
        const endNode = getPOINode(floorData.pois as FeatureCollection, to);

        if (!startNode || !endNode) {
            setRoute(null);
            setNoRouteFound(true);
            return;
        }

        const result = dijkstra(graph, startNode, endNode);

        if (result) {
            setRoute(nodesToLatLngs(result.nodes));
            setNoRouteFound(false);
        } else {
            setRoute(null);
            setNoRouteFound(true);
        }
    }, [graph, floorData?.pois, from, to]);

    return { from, to, route, noRouteFound, setFrom, setTo, onDataLoad, findPath };
}