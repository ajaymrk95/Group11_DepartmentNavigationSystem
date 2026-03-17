import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Building, Floor, Room } from '../types';

/* ─── API CONFIG ─────────────────────────────────── */
const API = 'http://localhost:8080/api';
const token = () => localStorage.getItem('atlas_token') ?? '';

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token()}`,
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? `Error ${res.status}`);

  return data as T;
}

/* ─── CONTEXT TYPE ───────────────────────────────── */
interface AppContextType {
  buildings: Building[];
  floors: Floor[];
  rooms: Room[];

  refresh: () => Promise<void>;

  addBuilding: (b: Building) => Promise<void>;
  updateBuilding: (b: Building) => Promise<void>;
  deleteBuilding: (id: string) => Promise<void>;

  addFloor: (f: Floor) => Promise<void>;
  updateFloor: (f: Floor) => Promise<void>;
  deleteFloor: (id: string) => Promise<void>;

  addRoom: (r: Room) => Promise<void>;
  updateRoom: (r: Room) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

/* ─── PROVIDER ───────────────────────────────────── */
export function AppProvider({ children }: { children: ReactNode }) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  /* ─── LOAD ALL DATA ───────────────────────────── */
  const refresh = async () => {
    try {
      const bs = await apiFetch<Building[]>('/buildings');
      setBuildings(bs);

      const floorArrays = await Promise.all(
        bs.map(b => apiFetch<Floor[]>(`/buildings/${b.id}/floors`))
      );
      const allFloors = floorArrays.flat();
      setFloors(allFloors);

      const rs = await apiFetch<Room[]>('/rooms');
      setRooms(rs);

    } catch (e) {
      console.error("Failed loading data", e);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  /* ─── BUILDING CRUD ───────────────────────────── */
  const addBuilding = async (b: Building) => {
    await apiFetch('/buildings', {
      method: 'POST',
      body: JSON.stringify(b),
    });
    await refresh();
  };

  const updateBuilding = async (b: Building) => {
    await apiFetch(`/buildings/${b.id}`, {
      method: 'PUT',
      body: JSON.stringify(b),
    });
    await refresh();
  };

  const deleteBuilding = async (id: string) => {
    await apiFetch(`/buildings/${id}`, { method: 'DELETE' });
    await refresh();
  };

  /* ─── FLOOR CRUD ─────────────────────────────── */
  const addFloor = async (f: Floor) => {
    await apiFetch('/floors', {
      method: 'POST',
      body: JSON.stringify(f),
    });
    await refresh();
  };

  const updateFloor = async (f: Floor) => {
    await apiFetch(`/floors/${f.id}`, {
      method: 'PUT',
      body: JSON.stringify(f),
    });
    await refresh();
  };

  const deleteFloor = async (id: string) => {
    await apiFetch(`/floors/${id}`, { method: 'DELETE' });
    await refresh();
  };

  /* ─── ROOM CRUD ─────────────────────────────── */
  const addRoom = async (r: Room) => {
    await apiFetch('/rooms', {
      method: 'POST',
      body: JSON.stringify(r),
    });
    await refresh();
  };

  const updateRoom = async (r: Room) => {
    await apiFetch(`/rooms/${r.id}`, {
      method: 'PUT',
      body: JSON.stringify(r),
    });
    await refresh();
  };

  const deleteRoom = async (id: string) => {
    await apiFetch(`/rooms/${id}`, { method: 'DELETE' });
    await refresh();
  };

  return (
    <AppContext.Provider value={{
      buildings,
      floors,
      rooms,
      refresh,
      addBuilding,
      updateBuilding,
      deleteBuilding,
      addFloor,
      updateFloor,
      deleteFloor,
      addRoom,
      updateRoom,
      deleteRoom
    }}>
      {children}
    </AppContext.Provider>
  );
}

/* ─── HOOK ─────────────────────────────────────── */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}