import type { Feature } from "geojson";
import type { PathOptions } from "leaflet";

export const buildingOutlineStyle: PathOptions = {
    fillColor: "#f9fafb",
    fillOpacity: 0.4,
    color: "#1f2937",
    weight: 3,
    opacity: 1,
};

export function getUnitStyle(feature: Feature | undefined): PathOptions {
    const category = feature?.properties?.category;

    switch (category) {
        case "toilet":
            return {
                fillColor: "#fee2e2",
                fillOpacity: 0.7,
                color: "#ef4444",
                weight: 2,
                opacity: 1,
            };
        case "classroom":
            return {
                fillColor: "#dbeafe",
                fillOpacity: 0.6,
                color: "#3b82f6",
                weight: 2,
                opacity: 1,
            };
        default:
            return {
                fillColor: "#f3f4f6",
                fillOpacity: 0.6,
                color: "#6b7280",
                weight: 2,
                opacity: 1,
            };
    }
}

export function getPathStyle(feature: Feature | undefined): PathOptions {
    const type = feature?.properties?.type;

    switch (type) {
        case "entry":
            return {
                color: "#10b981",
                weight: 5,
                opacity: 0.9,
                lineCap: "round",
                lineJoin: "round",
            };
        case "stairs":
            return {
                color: "#f59e0b",
                weight: 5,
                opacity: 0.9,
                lineCap: "round",
                lineJoin: "round",
                dashArray: "8, 4",
            };
        case "rentry":
            return {
                color: "#8b5cf6",
                weight: 3,
                opacity: 0.7,
                lineCap: "round",
                lineJoin: "round",
                dashArray: "4, 4",
            };
        case "c":
        default:
            return {
                color: "#3b82f6",
                weight: 4,
                opacity: 0.8,
                lineCap: "round",
                lineJoin: "round",
            };
    }
}