import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Building, Floor, Room, LogEntry } from '../types';
import { BUILDINGS } from '../data/buildings';
import { FLOORS } from '../data/floors';
import { ROOMS } from '../data/rooms';
import { INITIAL_LOGS } from '../data/logs';

interface AppContextType {
  buildings: Building[];
  floors: Floor[];
  rooms: Room[];
  logs: LogEntry[];
  currentAdmin: string;
  addBuilding: (b: Building) => void;
  updateBuilding: (b: Building) => void;
  deleteBuilding: (id: string) => void;
  addFloor: (f: Floor) => void;
  updateFloor: (f: Floor) => void;
  deleteFloor: (id: string) => void;
  addRoom: (r: Room) => void;
  updateRoom: (r: Room) => void;
  deleteRoom: (id: string) => void;
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp' | 'admin'>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [buildings, setBuildings] = useState<Building[]>(BUILDINGS);
  const [floors, setFloors] = useState<Floor[]>(FLOORS);
  const [rooms, setRooms] = useState<Room[]>(ROOMS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const currentAdmin = 'admin@nitc.ac.in';

  const addLog = (entry: Omit<LogEntry, 'id' | 'timestamp' | 'admin'>) => {
    const log: LogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      admin: currentAdmin,
    };
    setLogs(prev => [log, ...prev]);
  };

  const addBuilding = (b: Building) => { setBuildings(p => [...p, b]); addLog({ action: 'CREATE', entity: 'Building', entityId: b.id, entityName: b.name, details: `Created building ${b.fullName}` }); };
  const updateBuilding = (b: Building) => { setBuildings(p => p.map(x => x.id === b.id ? b : x)); addLog({ action: 'UPDATE', entity: 'Building', entityId: b.id, entityName: b.name, details: `Updated building ${b.name}` }); };
  const deleteBuilding = (id: string) => { const b = buildings.find(x => x.id === id); setBuildings(p => p.filter(x => x.id !== id)); if (b) addLog({ action: 'DELETE', entity: 'Building', entityId: id, entityName: b.name, details: `Deleted building ${b.name}` }); };

  const addFloor = (f: Floor) => { setFloors(p => [...p, f]); addLog({ action: 'CREATE', entity: 'Floor', entityId: f.id, entityName: f.name, details: `Added floor ${f.name}` }); };
  const updateFloor = (f: Floor) => { setFloors(p => p.map(x => x.id === f.id ? f : x)); addLog({ action: 'UPDATE', entity: 'Floor', entityId: f.id, entityName: f.name, details: `Updated floor ${f.name}` }); };
  const deleteFloor = (id: string) => { const f = floors.find(x => x.id === id); setFloors(p => p.filter(x => x.id !== id)); if (f) addLog({ action: 'DELETE', entity: 'Floor', entityId: id, entityName: f.name, details: `Deleted floor ${f.name}` }); };

  const addRoom = (r: Room) => { setRooms(p => [...p, r]); addLog({ action: 'CREATE', entity: 'Room', entityId: r.id, entityName: r.name, details: `Added room ${r.name}` }); };
  const updateRoom = (r: Room) => { setRooms(p => p.map(x => x.id === r.id ? r : x)); addLog({ action: 'UPDATE', entity: 'Room', entityId: r.id, entityName: r.name, details: `Updated room ${r.name}` }); };
  const deleteRoom = (id: string) => { const r = rooms.find(x => x.id === id); setRooms(p => p.filter(x => x.id !== id)); if (r) addLog({ action: 'DELETE', entity: 'Room', entityId: id, entityName: r.name, details: `Deleted room ${r.name}` }); };

  return (
    <AppContext.Provider value={{ buildings, floors, rooms, logs, currentAdmin, addBuilding, updateBuilding, deleteBuilding, addFloor, updateFloor, deleteFloor, addRoom, updateRoom, deleteRoom, addLog }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
