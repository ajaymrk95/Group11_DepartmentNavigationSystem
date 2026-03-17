export interface Building {
  id?: string;
  code: string;
  name: string;
  fullName: string;
  institute: string;
  location: string;
  yearBuilt: number;
  totalFloors: number;
  coordinates?: [number, number];   // Frontend friendly field
  longitude?: number;               // Backend mapping
  latitude?: number;                // Backend mapping
  description: string;
  outline?: object | null;          // Frontend friendly field
  outlineGeoJson?: object | null;   // Backend mapping
}

export interface Floor {
  id: string;
  buildingId: string;
  level: number;
  name: string;
  description: string;
  pathGeoJSON: object | null;
  poiGeoJSON: object | null;
  unitsGeoJSON: object | null;
  pathToggles: Record<string, boolean>;
}

export type RoomCategory = 'classroom' | 'lab' | 'hall' | 'office' | 'faculty' | 'toilet' | 'stairs' | 'corridor' | 'other';

export interface Room {
  id: string;
  buildingId: string;
  floorId: string;
  roomNo: string;
  name: string;
  category: RoomCategory;
  level: number;
  capacity?: number;
  description?: string;
  accessible: boolean;
  featureId?: number;
  facultyName?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  entity: 'Building' | 'Floor' | 'Room' | 'Path' | 'POI' | 'Auth';
  entityId?: string;
  entityName?: string;
  details: string;
}
