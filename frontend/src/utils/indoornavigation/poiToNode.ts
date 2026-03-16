// utils/poiToNode.ts
import type { FeatureCollection } from "geojson";

export function getPOINode(poisGeoJSON: FeatureCollection, poiName: string): string | null {
    const feature = poisGeoJSON.features.find(
        (f) => f.properties?.name === poiName
    );
    if (!feature || feature.geometry.type !== "Point") return null;

    const [lng, lat] = (feature.geometry as any).coordinates;
    return `${lng.toFixed(8)},${lat.toFixed(8)}`;
}