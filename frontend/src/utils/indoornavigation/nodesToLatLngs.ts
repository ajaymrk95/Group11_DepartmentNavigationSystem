// utils/nodesToLatLngs.ts
import type { NodeId } from "./buildGraph";

export function nodesToLatLngs(nodes: NodeId[]): [number, number][] {
    return nodes.map((id) => {
        const [lng, lat] = id.split(",").map(Number);
        return [lat, lng]; // Leaflet is [lat, lng]
    });
}