import type { GeoJsonObject } from "geojson";

export interface FloorData {
    buildingOutline: GeoJsonObject | null;
    units: GeoJsonObject | null;
    paths: GeoJsonObject | null;
    pois: GeoJsonObject | null;
}

export type FloorNumber = 1 | 2;

export type PathType = "entry" | "stairs" | "rentry" | "c";

export type POIType = "entry" | "rentry" | "room" | "stairs";

export type UnitCategory = "toilet" | "classroom" | "office" | "lab";

export type RouteLatLngs = [number, number][];

export interface IndoorMapProps {
    /** Rendered as a highlighted polyline when provided */
    route?: RouteLatLngs | null;
    /** Called once whenever floor data finishes loading */
    onDataLoad?: (data: FloorData) => void;
    /** Slot for extra UI rendered inside the header (e.g. route controls) */
    headerSlot?: React.ReactNode;
}

export type Location = {
    id: number;
    name: string;
    type: "building" | "lab" | "room" | "custom";
    category: "INDOOR" | "OUTDOOR";
    coords: [number, number];
    parentLocationName?: string;
    floor?: number;
    room?: string;
    tag?: string[];
    description?: string;
  }

// descriptionMap.ts
// description.ts
export const defaultDescription = "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi.";