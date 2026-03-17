import { createContext, useContext, useState } from "react";
import { initialBuildings, initialFloors, initialRooms, initialLogs } from "../data";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [buildings, setBuildings] = useState(initialBuildings);
  const [floors, setFloors] = useState(initialFloors);
  const [rooms, setRooms] = useState(initialRooms);
  const [logs, setLogs] = useState(initialLogs);
  const [currentUser] = useState("admin");

  const addLog = (action, entity, entityId, details, severity = "info") => {
    setLogs((prev) => [{ id: `l${Date.now()}`, timestamp: new Date().toISOString(), user: currentUser, action, entity, entityId, details, severity }, ...prev]);
  };

  const addBuilding = (b) => { const nb = { ...b, id: `b_${Date.now()}` }; setBuildings((p) => [...p, nb]); addLog("CREATE", "Building", nb.name, `Created building ${nb.name}`, "success"); };
  const updateBuilding = (building) => {
  setBuildings((prev) =>
    prev.map((b) => (b.id === building.id ? building : b))
  );
};
const deleteBuilding = (id) => { const b = buildings.find((x) => x.id === id); setBuildings((p) => p.filter((b) => b.id !== id)); setFloors((p) => p.filter((f) => f.buildingId !== id)); setRooms((p) => p.filter((r) => r.buildingId !== id)); addLog("DELETE", "Building", b?.name || id, "Deleted building and all associated data", "warning"); };

  const addFloor = (f) => { const nf = { ...f, id: `f_${Date.now()}` }; setFloors((p) => [...p, nf]); addLog("CREATE", "Floor", `${f.buildingId} L${f.level}`, `Added floor ${f.name}`, "success"); };
  const updateFloor = (floor) => {
  setFloors((prev) =>
    prev.map((f) => (f.id === floor.id ? floor : f))
  );
};
const deleteFloor = (id) => { const f = floors.find((x) => x.id === id); setFloors((p) => p.filter((f) => f.id !== id)); setRooms((p) => p.filter((r) => r.floorId !== id)); addLog("DELETE", "Floor", f?.name || id, "Deleted floor", "warning"); };

  const addRoom = (r) => { const nr = { ...r, id: `r_${Date.now()}` }; setRooms((p) => [...p, nr]); addLog("CREATE", "Room", nr.name, `Added room ${nr.name}`, "success"); };
  const updateRoom = (room) => {
  setRooms((p) => p.map((r) => r.id === room.id ? room : r));
}; 
const deleteRoom = (id) => { const r = rooms.find((x) => x.id === id); setRooms((p) => p.filter((r) => r.id !== id)); addLog("DELETE", "Room", r?.name || id, "Deleted room", "warning"); };

  return (
    <AppContext.Provider value={{ buildings, floors, rooms, logs, addLog, addBuilding, updateBuilding, deleteBuilding, addFloor, updateFloor, deleteFloor, addRoom, updateRoom, deleteRoom }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
