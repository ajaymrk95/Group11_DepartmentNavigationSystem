import { API } from "./constants";
import type { Room } from "../../../types/types";

// ─── Buildings ────────────────────────────────────────────────────────────────
export const fetchBuildings = (): Promise<{ id: number; name: string }[]> =>
  fetch(`${import.meta.env.VITE_API_URL}/api/buildings`).then((r) => r.json());

// ─── Rooms ────────────────────────────────────────────────────────────────────
export const fetchRooms = (): Promise<Room[]> =>
  fetch(`${API}/admin`).then((r) => r.json());

// ─── Toggle accessible ────────────────────────────────────────────────────────
export const patchAccessible = (id: number, accessible: boolean): Promise<void> =>
  fetch(`${API}/${id}/accessible`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessible }),
  }).then((r) => {
    if (!r.ok) throw new Error("Failed to update accessibility");
  });

// ─── Create / Update room ─────────────────────────────────────────────────────
export const saveRoom = (payload: Record<string, any>, id?: number): Promise<void> =>
  fetch(id ? `${API}/${id}` : API, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => {
    if (!r.ok) throw new Error("Request failed");
  });