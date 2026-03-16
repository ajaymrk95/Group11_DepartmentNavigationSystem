// utils/buildGraph.ts
import type { FeatureCollection, MultiLineString } from "geojson";

export type NodeId = string; // "lng,lat" rounded to 8dp

export interface GraphEdge {
    to: NodeId;
    weight: number; // Euclidean distance in degrees (fine for relative cost)
    featureId: number;
    type: string;
}

export type Graph = Map<NodeId, GraphEdge[]>;

function toNodeId(coord: number[]): NodeId {
    return `${coord[0].toFixed(8)},${coord[1].toFixed(8)}`;
}

function distance(a: number[], b: number[]): number {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return Math.sqrt(dx * dx + dy * dy);
}

export function buildGraph(pathsGeoJSON: FeatureCollection): Graph {
    const graph: Graph = new Map();

    const addEdge = (from: NodeId, to: NodeId, weight: number, featureId: number, type: string) => {
        if (!graph.has(from)) graph.set(from, []);
        graph.get(from)!.push({ to, weight, featureId, type });
    };

    for (const feature of pathsGeoJSON.features) {
        if (feature.properties?.navigable !== "y") continue;

        const geom = feature.geometry as MultiLineString;
        const featureId = feature.properties?.id;
        const type = feature.properties?.type;

        for (const line of geom.coordinates) {
            // Walk each consecutive pair of coordinates in the line
            for (let i = 0; i < line.length - 1; i++) {
                const from = toNodeId(line[i]);
                const to = toNodeId(line[i + 1]);
                const w = distance(line[i], line[i + 1]);

                addEdge(from, to, w, featureId, type); // bidirectional
                addEdge(to, from, w, featureId, type);
            }
        }
    }

    return graph;
}