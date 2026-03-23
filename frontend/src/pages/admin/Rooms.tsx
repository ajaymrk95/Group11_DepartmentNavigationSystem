"use client";
import { useEffect, useState } from "react";
import { DoorOpen, Plus, Search, Loader2, Building2, Layers, Eye, Pencil } from "lucide-react";

import { S, catColor, defaultCat } from "./room/constants";
import { fetchRooms, fetchBuildings, patchAccessible } from "./room/api";
import Toggle       from "./room/Toggle";
import DetailModal  from "./room/DetailModal";
import RoomFormModal from "./room/RoomFormModal";

import type { Room } from "../../types/types";

export default function Rooms() {
  const [rooms,        setRooms]        = useState<Room[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [catFilter,    setCatFilter]    = useState("all");
  const [floorFilter,  setFloorFilter]  = useState("all");
  const [hoveredRow,   setHoveredRow]   = useState<number | null>(null);
  const [togglingId,   setTogglingId]   = useState<number | null>(null);
  const [showAdd,      setShowAdd]      = useState(false);
  const [editRoom,     setEditRoom]     = useState<Room | null>(null);
  const [detailRoom,   setDetailRoom]   = useState<Room | null>(null);
  const [buildings,    setBuildings]    = useState<{ id: number; name: string }[]>([]);

  // ── Data fetching ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetchBuildings().then(setBuildings);
  }, []);

  const loadRooms = () => {
    setLoading(true);
    fetchRooms().then(setRooms).finally(() => setLoading(false));
  };

  useEffect(() => { loadRooms(); }, []);

  // ── Accessible toggle ───────────────────────────────────────────────────────
  const handleToggleAccessible = async (room: Room) => {
    setTogglingId(room.id);
    setRooms((prev) =>
      prev.map((r) => (r.id === room.id ? { ...r, isAccessible: !r.isAccessible } : r))
    );
    try {
      await patchAccessible(room.id, !room.isAccessible);
    } catch {
      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, isAccessible: room.isAccessible } : r))
      );
    } finally {
      setTogglingId(null);
    }
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  const categories  = ["all", ...Array.from(new Set(rooms.map((r) => r.category)))];
  const floors      = ["all", ...Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b).map(String)];
  const catCounts   = rooms.reduce((acc, r) => { acc[r.category] = (acc[r.category] ?? 0) + 1; return acc; }, {} as Record<string, number>);
  const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const filtered = rooms.filter((r) => {
    const matchSearch = !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.roomNo?.includes(search) ||
      r.buildingName.toLowerCase().includes(search.toLowerCase());
    const matchCat   = catFilter   === "all" || r.category === catFilter;
    const matchFloor = floorFilter === "all" || r.floor.toString() === floorFilter;
    return matchSearch && matchCat && matchFloor;
  });

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.hdr}>
        <div style={S.hdrLeft}>
          <DoorOpen size={22} strokeWidth={1.8} />
          <div>
            <h1 style={S.h1}>Rooms</h1>
            <p style={S.sub}>Manage rooms and categories</p>
          </div>
        </div>
        <button style={S.addBtn} onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Room
        </button>
      </div>

      {/* Stats row */}
      {!loading && (
        <div style={S.statsRow}>
          <div style={S.statCard}>
            <span style={S.statNum}>{rooms.length}</span>
            <span style={S.statLabel}>Total Rooms</span>
          </div>
          <div style={S.statCard}>
            <span style={S.statNum}>{Object.keys(catCounts).length}</span>
            <span style={S.statLabel}>Categories</span>
          </div>
          <div style={S.statCard}>
            <span style={S.statNum}>{floors.length - 1}</span>
            <span style={S.statLabel}>Floors</span>
          </div>
          <div style={S.statCard}>
            <span style={{ ...S.statNum, fontSize: 16, paddingTop: 4, textTransform: "capitalize" }}>
              {topCategory}
            </span>
            <span style={S.statLabel}>Top Category</span>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div style={S.filterBar}>
        <div style={S.searchWrap}>
          <Search size={15} color="#547792" />
          <input
            style={S.searchInput}
            placeholder="Search by name, room no, building..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select style={S.select} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
          ))}
        </select>
        <select style={S.select} value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)}>
          {floors.map((f) => (
            <option key={f} value={f}>{f === "all" ? "All Floors" : `Floor ${f}`}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={S.empty}><Loader2 size={20} /></div>
      ) : filtered.length === 0 ? (
        <div style={S.empty}>No rooms found.</div>
      ) : (
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                {["Room", "Room No", "Building", "Floor", "Category", "Tags", "Accessible", "Actions"].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((room) => {
                const cat = catColor[room.category?.toLowerCase()] ?? defaultCat;
                return (
                  <tr
                    key={room.id}
                    style={hoveredRow === room.id ? S.trHover : {}}
                    onMouseEnter={() => setHoveredRow(room.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={S.td}><span style={{ fontWeight: 600 }}>{room.name}</span></td>
                    <td style={S.td}>{room.roomNo ?? <span style={{ color: "#c0cdd8" }}>—</span>}</td>
                    <td style={S.td}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Building2 size={13} color="#547792" /> {room.buildingName}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span style={S.floorBadge}><Layers size={11} /> {room.floor}</span>
                    </td>
                    <td style={S.td}>
                      <span style={{ ...S.catBadge, background: cat.bg, color: cat.color }}>
                        {room.category}
                      </span>
                    </td>
                    <td style={S.td}>
                      {room.tags?.slice(0, 2).map((t) => (
                        <span key={t} style={S.tag}>{t}</span>
                      ))}
                      {room.tags?.length > 2 && (
                        <span style={S.tag}>+{room.tags.length - 2}</span>
                      )}
                    </td>
                    <td style={S.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Toggle
                          checked={room.isAccessible}
                          loading={togglingId === room.id}
                          onChange={() => handleToggleAccessible(room)}
                        />
                        <span style={{ fontSize: 12, color: room.isAccessible ? "#34c759" : "#ff3b30", fontWeight: 600 }}>
                          {room.isAccessible ? "Yes" : "No"}
                        </span>
                      </div>
                    </td>
                    <td style={S.td}>
                      <div style={S.actionRow}>
                        <button
                          title="View details"
                          style={{ ...S.iconBtn, background: "#f0f4f9", color: "#547792" }}
                          onClick={() => setDetailRoom(room)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          title="Edit"
                          style={{ ...S.iconBtn, background: "#eef2ff", color: "#4361ee" }}
                          onClick={() => setEditRoom(room)}
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <RoomFormModal
          buildings={buildings}
          existingCategories={categories.filter((c) => c !== "all")}
          onClose={() => setShowAdd(false)}
          onSaved={loadRooms}
        />
      )}
      {editRoom && (
        <RoomFormModal
          buildings={buildings}
          existingCategories={categories.filter((c) => c !== "all")}
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