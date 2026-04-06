"use client";
import { useEffect, useState } from "react";
import { DoorOpen, Plus, Search, Loader2, Building2, Layers, Eye, Pencil } from "lucide-react";

import { fetchRooms, fetchBuildings, patchAccessible } from "./room/api";
import Toggle        from "./room/Toggle";
import DetailModal   from "./room/DetailModal";
import RoomFormModal from "./room/RoomFormModal";

import type { Room } from "../../types/types";

const catColor: Record<string, { bg: string; color: string }> = {
  classroom:      { bg: "#e8f4fd", color: "#1a73e8" },
  lab:            { bg: "#e6f4ea", color: "#1e8e3e" },
  toilet:         { bg: "#fce8e6", color: "#d93025" },
  "seminar hall": { bg: "#fef7e0", color: "#f29900" },
  office:         { bg: "#f3e8fd", color: "#8430ce" },
};
const defaultCat = { bg: "#f0f4f9", color: "#547792" };

export default function Rooms() {
  const [rooms,       setRooms]       = useState<Room[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [catFilter,   setCatFilter]   = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [hoveredRow,  setHoveredRow]  = useState<number | null>(null);
  const [togglingId,  setTogglingId]  = useState<number | null>(null);
  const [showAdd,     setShowAdd]     = useState(false);
  const [editRoom,    setEditRoom]    = useState<Room | null>(null);
  const [detailRoom,  setDetailRoom]  = useState<Room | null>(null);
  const [buildings,   setBuildings]   = useState<{ id: number; name: string }[]>([]);

  useEffect(() => { fetchBuildings().then(setBuildings); }, []);

  const loadRooms = () => {
    setLoading(true);
    fetchRooms().then(setRooms).finally(() => setLoading(false));
  };
  useEffect(() => { loadRooms(); }, []);

  const handleToggleAccessible = async (room: Room) => {
    setTogglingId(room.id);
    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, isAccessible: !r.isAccessible } : r));
    try {
      await patchAccessible(room.id, !room.isAccessible);
    } catch {
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, isAccessible: room.isAccessible } : r));
    } finally {
      setTogglingId(null);
    }
  };

  const categories  = ["all", ...Array.from(new Set(rooms.map(r => r.category)))];
  const floors      = ["all", ...Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => a - b).map(String)];
  const catCounts   = rooms.reduce((acc, r) => { acc[r.category] = (acc[r.category] ?? 0) + 1; return acc; }, {} as Record<string, number>);
  const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const filtered = rooms.filter(r => {
    const matchSearch = !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.roomNo?.includes(search) ||
      r.buildingName.toLowerCase().includes(search.toLowerCase());
    return matchSearch &&
      (catFilter   === "all" || r.category === catFilter) &&
      (floorFilter === "all" || r.floor.toString() === floorFilter);
  });

  return (
    // Changed: p-7 to p-4 md:p-7 for better mobile padding
    <div className="font-[Outfit] text-[#1A3263] p-4 md:p-7 w-full box-border">

      {/* ── Header ── */}
      {/* Changed: flex-col on mobile, flex-row on larger screens */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <DoorOpen size={22} strokeWidth={1.8} color="#1A3263" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight m-0 leading-none">Rooms</h1>
            <p className="text-[13px] text-[#547792] mt-0.5 m-0">Manage rooms and categories</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex w-full sm:w-auto justify-center items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#1A3263] text-[#F6E7BC] text-[13px] font-bold border-none cursor-pointer transition-all duration-200 hover:bg-[#FAB95B] hover:text-[#1A3263]"
        >
          <Plus size={15} strokeWidth={2.5} /> Add Room
        </button>
      </div>

      {/* ── Stats ── */}
      {/* Changed: Used CSS Grid to create a 2x2 grid on mobile, and a 1x4 row on large screens */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            { num: rooms.length,                  label: "Total Rooms" },
            { num: Object.keys(catCounts).length, label: "Categories" },
            { num: floors.length - 1,             label: "Floors" },
            { num: topCategory,                   label: "Top Category", small: true },
          ].map(({ num, label, small }) => (
            <div key={label} className="bg-white rounded-xl px-4 py-3.5 shadow-[0_1px_4px_rgba(26,50,99,0.07)] flex flex-col gap-0.5 min-w-0">
              <span className={`font-bold text-[#1A3263] truncate ${small ? "text-base pt-1 capitalize" : "text-[22px]"}`}>{num}</span>
              <span className="text-xs text-[#547792] truncate">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      {/* Changed: flex-col on mobile, row on md screens */}
      <div className="flex flex-col md:flex-row gap-2.5 mb-5">
        <div className="flex items-center gap-2 bg-white border border-[rgba(26,50,99,0.12)] rounded-full px-4 py-2.5 flex-1 w-full">
          <Search size={15} color="#547792" className="shrink-0" />
          <input
            className="border-none outline-none text-sm text-[#1A3263] bg-transparent w-full font-[Outfit] placeholder-[#9aafbf]"
            placeholder="Search by name, room no, building..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto shrink-0">
          <select
            className="w-full sm:w-auto bg-white border border-[rgba(26,50,99,0.12)] rounded-full px-4 py-2.5 text-sm text-[#1A3263] outline-none font-[Outfit] cursor-pointer"
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
          </select>
          <select
            className="w-full sm:w-auto bg-white border border-[rgba(26,50,99,0.12)] rounded-full px-4 py-2.5 text-sm text-[#1A3263] outline-none font-[Outfit] cursor-pointer"
            value={floorFilter}
            onChange={e => setFloorFilter(e.target.value)}
          >
            {floors.map(f => <option key={f} value={f}>{f === "all" ? "All Floors" : `Floor ${f}`}</option>)}
          </select>
        </div>
      </div>

      {/* ── States ── */}
      {loading && (
        <div className="bg-white rounded-2xl py-14 flex items-center justify-center shadow-sm">
          <Loader2 size={20} className="text-[#547792] animate-spin" />
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl py-14 text-center text-[#9aafbf] text-sm shadow-sm">
          {search || catFilter !== "all" || floorFilter !== "all" ? "No rooms match your filters." : "No rooms added yet."}
        </div>
      )}

      {/* ── Table ── */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(26,50,99,0.07)] relative w-full border border-gray-100">
          {/* Changed: overflow-x-auto handles the horizontal scroll on small devices */}
          <div className="overflow-x-auto w-full rounded-2xl">
            <table className="w-full border-collapse text-sm text-left">
              <thead>
                <tr>
                  {["Room", "Room No", "Building", "Floor", "Category", "Tags", "Accessible", "Actions"].map(h => (
                    // Changed: added whitespace-nowrap
                    <th key={h} className="whitespace-nowrap px-5 py-3.5 bg-[#f4f7fb] text-[#547792] font-semibold text-[11px] uppercase tracking-wide border-b border-[#eaf0f7]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(room => {
                  const cat = catColor[room.category?.toLowerCase()] ?? defaultCat;
                  const isHovered = hoveredRow === room.id;
                  return (
                    <tr
                      key={room.id}
                      className={`transition-colors duration-100 ${isHovered ? "bg-[#f9fbfd]" : "bg-white"}`}
                      onMouseEnter={() => setHoveredRow(room.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      {/* Name */}
                      {/* Changed: added whitespace-nowrap to cells */}
                      <td className="whitespace-nowrap px-5 py-4 border-b border-[#f0f4f9] align-middle">
                        <span className="font-semibold text-[#1A3263]">{room.name}</span>
                      </td>

                      {/* Room No */}
                      <td className="whitespace-nowrap px-5 py-4 border-b border-[#f0f4f9] align-middle text-[#547792]">
                        {room.roomNo ?? <span className="text-[#c0cdd8]">—</span>}
                      </td>

                      {/* Building */}
                      <td className="whitespace-nowrap px-5 py-4 border-b border-[#f0f4f9] align-middle">
                        <span className="flex items-center gap-1.5 text-[#547792]">
                          <Building2 size={13} color="#9aafbf" /> {room.buildingName}
                        </span>
                      </td>

                      {/* Floor */}
                      <td className="whitespace-nowrap px-5 py-4 border-b border-[#f0f4f9] align-middle">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[rgba(26,50,99,0.07)] text-[#1A3263]">
                          <Layers size={11} /> {room.floor}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="whitespace-nowrap px-5 py-4 border-b border-[#f0f4f9] align-middle">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                          style={{ background: cat.bg, color: cat.color }}
                        >
                          {room.category}
                        </span>
                      </td>

                      {/* Tags */}
                      <td className="whitespace-nowrap px-5 py-4 border-b border-[#f0f4f9] align-middle">
                        <div className="flex flex-wrap gap-1 w-max">
                          {room.tags?.slice(0, 2).map(t => (
                            <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(26,50,99,0.06)] text-[#547792] border border-[rgba(26,50,99,0.08)]">{t}</span>
                          ))}
                          {room.tags?.length > 2 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(26,50,99,0.06)] text-[#547792] border border-[rgba(26,50,99,0.08)]">+{room.tags.length - 2}</span>
                          )}
                        </div>
                      </td>

                      {/* Accessible */}
                      <td className="whitespace-nowrap px-5 py-4 border-b border-[#f0f4f9] align-middle">
                        <div className="flex items-center gap-2">
                          <Toggle
                            checked={room.isAccessible}
                            loading={togglingId === room.id}
                            onChange={() => handleToggleAccessible(room)}
                          />
                          <span className={`text-xs font-semibold ${room.isAccessible ? "text-[#34c759]" : "text-[#ff3b30]"}`}>
                            {room.isAccessible ? "Yes" : "No"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-5 py-4 border-b border-[#f0f4f9] align-middle">
                        <div className="flex items-center gap-1.5">
                          <button
                            title="View details"
                            onClick={() => setDetailRoom(room)}
                            className="w-8 h-8 rounded-lg border-none flex items-center justify-center cursor-pointer bg-[rgba(26,50,99,0.06)] text-[#547792] transition-colors duration-150 hover:bg-[rgba(26,50,99,0.12)]"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            title="Edit"
                            onClick={() => setEditRoom(room)}
                            className="w-8 h-8 rounded-lg border-none flex items-center justify-center cursor-pointer bg-[rgba(9,146,194,0.08)] text-[#0992C2] transition-colors duration-150 hover:bg-[rgba(9,146,194,0.16)]"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {showAdd && (
        <RoomFormModal
          buildings={buildings}
          existingCategories={categories.filter(c => c !== "all")}
          onClose={() => setShowAdd(false)}
          onSaved={loadRooms}
        />
      )}
      {editRoom && (
        <RoomFormModal
          buildings={buildings}
          existingCategories={categories.filter(c => c !== "all")}
          room={editRoom}
          onClose={() => setEditRoom(null)}
          onSaved={loadRooms}
        />
      )}
      {detailRoom && (
        <DetailModal room={detailRoom} onClose={() => setDetailRoom(null)} />
      )}
    </div>
  );
}