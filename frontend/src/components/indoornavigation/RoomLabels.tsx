import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { GeoJsonObject } from "geojson";
import { createRoomLabelIcon } from "../../utils/indoornavigation/mapIcons";

interface RoomLabelsProps {
    units: GeoJsonObject | null;
}

interface LabelConfig {
    text: string;
    color: string;
    fontSize: string;
}

function getLabelConfig(props: Record<string, unknown>): LabelConfig | null {
    if (props.category === "toilet") {
        return { text: String(props.name ?? "Toilet"), color: "#dc2626", fontSize: "12px" };
    }
    if (props.room_no) {
        return { text: `Room ${props.room_no}`, color: "#1f2937", fontSize: "14px" };
    }
    if (props.name) {
        return { text: String(props.name), color: "#1f2937", fontSize: "14px" };
    }
    return null;
}

function calcCentroid(coords: number[][]): [number, number] {
    const pointCount = coords.length - 1; // exclude closing point
    let latSum = 0;
    let lngSum = 0;
    for (let i = 0; i < pointCount; i++) {
        lngSum += coords[i][0];
        latSum += coords[i][1];
    }
    return [latSum / pointCount, lngSum / pointCount];
}

/**
 * Renders centroid labels for each room/unit polygon.
 */
export function RoomLabels({ units }: RoomLabelsProps) {
    const map = useMap();

    useEffect(() => {
        if (!units) return;

        const labels: L.Marker[] = [];

        (units as any).features?.forEach((feature: any) => {
            const { geometry, properties } = feature;
            if (geometry?.type !== "MultiPolygon") return;

            const labelConfig = getLabelConfig(properties ?? {});
            if (!labelConfig) return;

            const outerRing: number[][] = geometry.coordinates[0][0];
            const [lat, lng] = calcCentroid(outerRing);

            const marker = L.marker([lat, lng], {
                icon: createRoomLabelIcon(labelConfig.text, labelConfig.color, labelConfig.fontSize),
                interactive: false,
                zIndexOffset: 1000,
            });

            marker.addTo(map);
            labels.push(marker);
        });

        return () => labels.forEach((label) => map.removeLayer(label));
    }, [map, units]);

    return null;
}