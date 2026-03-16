import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { GeoJsonObject } from "geojson";

interface MapBoundsControllerProps {
    geojsonData: GeoJsonObject[];
}

/**
 * Fits the map to the given GeoJSON layers and restricts panning beyond them.
 */
export function MapBoundsController({ geojsonData }: MapBoundsControllerProps) {
    const map = useMap();

    useEffect(() => {
        const validData = geojsonData.filter(Boolean);
        if (validData.length === 0) return;

        const group = L.featureGroup(validData.map((data) => L.geoJSON(data)));
        const bounds = group.getBounds();

        map.setMaxBounds(bounds.pad(0.2));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 21 });
    }, [geojsonData, map]);

    return null;
}