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