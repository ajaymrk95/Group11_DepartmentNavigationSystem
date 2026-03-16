import type { Feature } from "geojson";
import type { PathOptions } from "leaflet";

export const buildingOutlineStyle: PathOptions = {
    fillColor: "#E8E2DB",
    fillOpacity: 0.4,
    color: "#1f2937",
    weight: 4,
    opacity: 1,
};

export const routeStyle: PathOptions = {
    color: "#ef4444",
    weight: 5,
    opacity: 0.8,
    lineCap: "round" as const,
    lineJoin: "round" as const,
};

export function getUnitStyle(feature: Feature | undefined): PathOptions {
    const category = feature?.properties?.category;

    switch (category) {
        case "toilet":
            return {
                fillColor: "#fee2e2",
                fillOpacity: 0.7,
                color: "#000000",
                weight: 2,
                opacity: 1,
            };
        case "classroom":
            return {
                fillColor: "#dbeafe",
                fillOpacity: 0.6,
                color: "#000000",
                weight: 2,
                opacity: 1,
            };
        default:
            return {
                fillColor: "#f3f4f6",
                fillOpacity: 0.6,
                color: "#000000",
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
                color: "#616569",
                weight: 5,
                opacity: 0.9,
                lineCap: "round",
                lineJoin: "round",
            };
        case "stairs":
            return {
                color: "#000000",
                weight: 5,
                opacity: 0.9,
                lineCap: "round",
                lineJoin: "round",
                dashArray: "8, 8",
            };
        case "rentry":
            return {
                color: "#616569",
                weight: 3,
                opacity: 0.7,
                lineCap: "round",
                lineJoin: "round",
                dashArray: "4, 4",
            };
        case "c":
        default:
            return {
                color: "#616569",
                weight: 4,
                opacity: 0.8,
                lineCap: "round",
                lineJoin: "round",
            };
    }
}