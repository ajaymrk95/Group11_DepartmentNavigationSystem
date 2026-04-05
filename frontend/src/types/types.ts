import type { GeoJsonObject } from "geojson";

export interface FloorData {
    buildingOutline: GeoJsonObject | null;
    units: GeoJsonObject | null;
    paths: GeoJsonObject | null;
}

export type FloorNumber = 1 | 2;

export type PathType = "entry" | "stairs" | "rentry" | "c";

export type POIType = "entry" | "rentry" | "room" | "stairs";

export type UnitCategory = "toilet" | "classroom" | "office" | "lab";

export type RouteLatLngs = [number, number][];

export interface IndoorMapProps {
    building: string | undefined;
    floorNo?: number;
    /** Rendered as a highlighted polyline when provided */
    route?: RouteLatLngs | null;
    /** Called once whenever floor data finishes loading */
    onDataLoad?: (data: FloorData) => void;
    /** Slot for extra UI rendered inside the header (e.g. route controls) */
    headerSlot?: React.ReactNode;
}

export interface RouteControlsProps {
    from: string;
    to: string;
    noRouteFound: boolean;
    setFrom: (value: string) => void;
    setTo: (value: string) => void;
    onFindPath: (fromCoords: [number, number], toCoords: [number, number]) => void;
    buildingId: number;
    buildingEntries: [number, number][];
}

export interface FloorToggleProps {
    currentFloor: number;
    onChange: (floor: number) => void;
    floors: number;
}

export interface MapLayersProps extends FloorData {
    floor: number;
}

export interface MapBoundsControllerProps {
    geojsonData: GeoJsonObject[];
}


export interface BuildingData {
    id: number;
    name: string;
    floors: number;
    isAccessible: boolean;
    tags: string[];
    outline: GeoJsonObject;
    entries: object | null;   // ← add this
}

export interface FloorLayerData {
    units: GeoJsonObject | null;
    paths: GeoJsonObject | null;
    loading: boolean;
    error: string | null;
}


export type Location = {
    id: number;
    name: string;
    category: string | null;
    room: string | null;
    latitude: number | null;
    longitude: number | null;
    tag: string[];
    floor: number | null;
    description: string | null;
    locationType?: "ROOM" | "BUILDING";  // add this
    buildingName?: string | null;
}

export type Room = {
    id: number;
  name: string;
  roomNo: string | null;
  category: string;
  floor: number;
  isAccessible: boolean;
  description: string | null;
  tags: string[];
  buildingId: number;
  buildingName: string;
}
