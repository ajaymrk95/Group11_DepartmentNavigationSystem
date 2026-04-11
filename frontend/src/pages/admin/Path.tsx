"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
  Polyline,
  Polygon,
  Tooltip,
  ImageOverlay,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PathFeature {
  id: number;
  name: string;
  roadType: string;
  isAccessible: boolean;
  isOneway: boolean;
  floor: number | null;
  buildingId: number | null;
  geom: GeoJSON.Geometry | null;
}

interface Building {
  id: number;
  name: string;
  floors: number;
  isAccessible: boolean;
  geom: GeoJSON.Geometry | null;
  entries: GeoJSON.Geometry | null;
}

interface Room {
  id: number;
  roomNo: string;
  name: string;
  floor: number;
  category: string;
  isAccessible: boolean;
  geometry: GeoJSON.Geometry | null;
}

// ─── Map Auto-fit ─────────────────────────────────────────────────────────────

function FitBounds({ paths, rooms, buildingGeom }: { paths: PathFeature[]; rooms?: Room[]; buildingGeom?: GeoJSON.Geometry | null }) {
  const map = useMap();
  const fitted = useRef(false);
  const prevKey = useRef("");

  const key = paths.map(p => p.id).join(",") + (buildingGeom ? "b" : "");

  useEffect(() => {
    if (key === prevKey.current) return;
    prevKey.current = key;

    const coords: [number, number][] = [];

    if (buildingGeom) {
      const extractPoly = (g: GeoJSON.Geometry) => {
        if (g.type === "Polygon") {
          (g.coordinates as [number, number][][]).forEach(ring =>
            ring.forEach(([lng, lat]) => coords.push([lat, lng]))
          );
        } else if (g.type === "MultiPolygon") {
          g.coordinates.forEach((poly: [number, number][][][]) =>
            poly.forEach(ring => ring.forEach(([lng, lat]) => coords.push([lat, lng])))
          );
        }
      };
      extractPoly(buildingGeom);
    }

    paths.forEach((p) => {
      if (!p.geom) return;
      const extract = (g: GeoJSON.Geometry) => {
        if (g.type === "LineString") {
          (g.coordinates as [number, number][]).forEach(([lng, lat]) => coords.push([lat, lng]));
        } else if (g.type === "MultiLineString") {
          g.coordinates.forEach((ls: [number, number][]) =>
            ls.forEach(([lng, lat]) => coords.push([lat, lng]))
          );
        }
      };
      extract(p.geom);
    });

    if (coords.length > 0) {
      map.fitBounds(L.latLngBounds(coords), { padding: [60, 60], maxZoom: 22 });
    }
  }, [key, map, buildingGeom]);

  return null;
}

// ─── Color helpers ────────────────────────────────────────────────────────────

const ROAD_COLORS: Record<string, string> = {
  primary: "#e8a838",
  secondary: "#e8a838",
  tertiary: "#1e3a5f",
  footway: "#1e3a5f",
  path: "#1e3a5f",
  service: "#6b7fa3",
  corridor: "#1e3a5f",
  stairs: "#c0392b",
  default: "#1e3a5f",
};

const ROOM_CATEGORY_COLORS: Record<string, { fill: string; stroke: string }> = {
  classroom: { fill: "#dce8f5", stroke: "#4a7ba7" },
  lab: { fill: "#e8ddf5", stroke: "#7b68ae" },
  office: { fill: "#f5ead8", stroke: "#d9823e" },
  restroom: { fill: "#d8eef5", stroke: "#4a9fb9" },
  corridor: { fill: "#eceef0", stroke: "#8a96a8" },
  stairs: { fill: "#f5ddd8", stroke: "#c0392b" },
  default: { fill: "#e8eaec", stroke: "#6b8fb9" },
};

const ROAD_TYPES = Object.keys(ROAD_COLORS).filter((k) => k !== "default");

function roadColor(type: string) {
  return ROAD_COLORS[type] ?? ROAD_COLORS.default;
}

function roomColor(category: string, accessible: boolean) {
  if (!accessible) return { fill: "#f5dcd7", stroke: "#c0392b" };
  return ROOM_CATEGORY_COLORS[category?.toLowerCase()] ?? ROOM_CATEGORY_COLORS.default;
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function geomToLatLngs(geom: GeoJSON.Geometry): [number, number][][] {
  if (geom.type === "LineString") {
    return [(geom.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng])];
  }
  if (geom.type === "MultiLineString") {
    return geom.coordinates.map((ls: [number, number][]) => ls.map(([lng, lat]) => [lat, lng]));
  }
  return [];
}

function polygonCoords(geom: GeoJSON.Geometry): [number, number][][] {
  if (geom.type === "Polygon") {
    return (geom.coordinates as [number, number][][]).map((ring) =>
      ring.map(([lng, lat]) => [lat, lng])
    );
  }
  if (geom.type === "MultiPolygon") {
    return geom.coordinates.flatMap((poly: [number, number][][][]) =>
      poly.map((ring) => ring.map(([lng, lat]) => [lat, lng]))
    );
  }
  return [];
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({
  path,
  onClose,
  onDeleted,
}: {
  path: PathFeature;
  onClose: () => void;
  onDeleted: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/paths/${path.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Server error");
      onDeleted(path.id);
      onClose();
    } catch {
      setError("Failed to delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Delete Path</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="delete-warning-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="1.8">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <p className="delete-confirm-text">
            Are you sure you want to delete <strong>"{path.name || `Path ${path.id}`}"</strong>?
          </p>
          <p className="delete-confirm-sub">This action cannot be undone.</p>
          {error && <div className="field-error">{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button className="btn-delete" onClick={handleDelete} disabled={deleting}>
            {deleting ? <span className="spinner sm" /> : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Outdoor Modal ────────────────────────────────────────────────────────

function AddOutdoorModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [roadType, setRoadType] = useState("footway");
  const [isOneway, setIsOneway] = useState(false);
  const [geomText, setGeomText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!geomText.trim()) { setError("GeoJSON geometry is required."); return; }
    let geom: object;
    try { geom = JSON.parse(geomText); } catch { setError("Invalid JSON for geometry."); return; }
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/paths/outdoor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, roadType, isOneway, geom }),
      });
      if (!res.ok) throw new Error("Server error");
      onSaved();
      onClose();
    } catch {
      setError("Failed to save. Check server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add Outdoor Path</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <label className="field-label">Name <span className="optional">(optional)</span></label>
          <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Main walkway" />
          <label className="field-label">Road Type</label>
          <select className="field-input" value={roadType} onChange={(e) => setRoadType(e.target.value)}>
            {ROAD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <label className="field-label field-check">
            <input type="checkbox" checked={isOneway} onChange={(e) => setIsOneway(e.target.checked)} />
            One-way
          </label>
          <label className="field-label">Geometry <span className="required">*</span> — GeoJSON LineString / MultiLineString</label>
          <textarea className="field-input field-textarea" value={geomText} onChange={(e) => setGeomText(e.target.value)}
            placeholder={'{"type":"LineString","coordinates":[[75.933,11.321],[75.935,11.323]]}'}
          />
          {error && <div className="field-error">{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={submit} disabled={saving}>
            {saving ? <span className="spinner sm" /> : "Save Path"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Indoor Modal ─────────────────────────────────────────────────────────

function AddIndoorModal({ buildingId, floor, onClose, onSaved }: {
  buildingId: number; floor: number; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [roadType, setRoadType] = useState("corridor");
  const [isOneway, setIsOneway] = useState(false);
  const [geomText, setGeomText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!geomText.trim()) { setError("GeoJSON geometry is required."); return; }
    let geom: object;
    try { geom = JSON.parse(geomText); } catch { setError("Invalid JSON for geometry."); return; }
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/paths/indoor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, roadType, isOneway, buildingId, floor, geom }),
      });
      if (!res.ok) throw new Error("Server error");
      onSaved();
      onClose();
    } catch {
      setError("Failed to save. Check server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add Indoor Path</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="field-row-info">
            <span>Building ID: <b>{buildingId}</b></span>
            <span>Floor: <b>{floor}</b></span>
          </div>
          <label className="field-label">Name <span className="optional">(optional)</span></label>
          <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Corridor A" />
          <label className="field-label">Road Type</label>
          <select className="field-input" value={roadType} onChange={(e) => setRoadType(e.target.value)}>
            {ROAD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <label className="field-label field-check">
            <input type="checkbox" checked={isOneway} onChange={(e) => setIsOneway(e.target.checked)} />
            One-way
          </label>
          <label className="field-label">Geometry <span className="required">*</span> — GeoJSON LineString / MultiLineString</label>
          <textarea className="field-input field-textarea" value={geomText} onChange={(e) => setGeomText(e.target.value)}
            placeholder={'{"type":"LineString","coordinates":[[75.933,11.321],[75.935,11.323]]}'}
          />
          {error && <div className="field-error">{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={submit} disabled={saving}>
            {saving ? <span className="spinner sm" /> : "Save Path"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Building Dropdown ────────────────────────────────────────────────────────

function BuildingSelector({ buildings, selected, onSelect }: {
  buildings: Building[];
  selected: Building | null;
  onSelect: (b: Building) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="atlas-dropdown" ref={ref}>
      <button className="atlas-dropdown-trigger" onClick={() => setOpen(!open)}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="1" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
        <span>{selected?.name ?? "Select building"}</span>
        <svg className={`chevron ${open ? "open" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="atlas-dropdown-menu">
          {buildings.map((b) => (
            <button
              key={b.id}
              className={`atlas-dropdown-item ${selected?.id === b.id ? "active" : ""}`}
              onClick={() => { onSelect(b); setOpen(false); }}
            >
              <span>{b.name}</span>
              <span className="item-meta">{b.floors}F · ID {b.id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PathsPage() {
  const [mode, setMode] = useState<"outdoor" | "indoor">("outdoor");

  // Outdoor
  const [outdoorPaths, setOutdoorPaths] = useState<PathFeature[]>([]);
  const [loadingOutdoor, setLoadingOutdoor] = useState(false);

  // Indoor
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [indoorPaths, setIndoorPaths] = useState<PathFeature[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingIndoor, setLoadingIndoor] = useState(false);

  // Shared UI state
  const [selectedPathId, setSelectedPathId] = useState<number | null>(null);
  const [hoveredRoomId, setHoveredRoomId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [showAddOutdoor, setShowAddOutdoor] = useState(false);
  const [showAddIndoor, setShowAddIndoor] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PathFeature | null>(null);
  const [activeTab, setActiveTab] = useState<"paths" | "rooms">("paths");

  const listItemRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // ── Fetch outdoor paths ───────────────────────────────────────────────────
  const fetchOutdoor = useCallback(() => {
    setLoadingOutdoor(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/paths?outdoor=true`)
      .then((r) => r.json())
      .then((data: PathFeature[]) => setOutdoorPaths(data))
      .catch(console.error)
      .finally(() => setLoadingOutdoor(false));
  }, []);

  useEffect(() => {
    if (mode !== "outdoor") return;
    fetchOutdoor();
  }, [mode, fetchOutdoor]);

  // ── Fetch buildings ───────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== "indoor") return;
    fetch(`${import.meta.env.VITE_API_URL}/api/buildings`)
      .then((r) => r.json())
      .then((data: any[]) => {
        const parsedBuildings: Building[] = data.map(b => ({
          ...b,
          geom: typeof b.geom === 'string' ? JSON.parse(b.geom) : b.geom,
          entries: typeof b.entries === 'string' ? JSON.parse(b.entries) : b.entries,
        }));
        setBuildings(parsedBuildings);
        if (parsedBuildings.length > 0 && !selectedBuilding) {
          setSelectedBuilding(parsedBuildings[0]);
          setSelectedFloor(1);
        }
      })
      .catch(console.error);
  }, [mode]);

  // ── Fetch indoor paths + rooms ────────────────────────────────────────────
  const fetchIndoor = useCallback(() => {
    if (!selectedBuilding) return;
    setLoadingIndoor(true);
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/paths?buildingId=${selectedBuilding.id}&floor=${selectedFloor}`).then((r) => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/rooms?buildingId=${selectedBuilding.id}&floor=${selectedFloor}`).then((r) => r.json()),
    ])
      .then(([paths, roomsGeoJson]) => {
        setIndoorPaths(paths as PathFeature[]);
        const feats = (roomsGeoJson?.features ?? []) as Array<{ properties: Room; geometry: GeoJSON.Geometry }>;
        setRooms(feats.map((f) => ({ ...f.properties, geometry: f.geometry })));
        setSelectedPathId(null);
      })
      .catch(console.error)
      .finally(() => setLoadingIndoor(false));
  }, [selectedBuilding, selectedFloor]);

  useEffect(() => { fetchIndoor(); }, [fetchIndoor]);

  // ── Toggle accessibility ──────────────────────────────────────────────────
  const togglePath = useCallback(async (path: PathFeature) => {
    setTogglingId(path.id);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/paths/${path.id}/accessible`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAccessible: !path.isAccessible }),
      });
      const update = (p: PathFeature) => p.id === path.id ? { ...p, isAccessible: !p.isAccessible } : p;
      if (mode === "outdoor") setOutdoorPaths((prev) => prev.map(update));
      else setIndoorPaths((prev) => prev.map(update));
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingId(null);
    }
  }, [mode]);

  // ── Delete path ───────────────────────────────────────────────────────────
  const handleDeleted = useCallback((id: number) => {
    if (mode === "outdoor") {
      setOutdoorPaths((prev) => prev.filter((p) => p.id !== id));
    } else {
      setIndoorPaths((prev) => prev.filter((p) => p.id !== id));
    }
    if (selectedPathId === id) setSelectedPathId(null);
  }, [mode, selectedPathId]);

  const handlePathClick = useCallback((id: number) => {
    setSelectedPathId(id);
    setTimeout(() => {
      const el = listItemRefs.current[id];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }, []);

  const displayPaths = mode === "outdoor" ? outdoorPaths : indoorPaths;
  const loading = mode === "outdoor" ? loadingOutdoor : loadingIndoor;

  const NITC_CENTER: [number, number] = [11.3218, 75.9337];
  const outdoorTileUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="atlas-root">
      {showAddOutdoor && <AddOutdoorModal onClose={() => setShowAddOutdoor(false)} onSaved={fetchOutdoor} />}
      {showAddIndoor && selectedBuilding && (
        <AddIndoorModal buildingId={selectedBuilding.id} floor={selectedFloor}
          onClose={() => setShowAddIndoor(false)} onSaved={fetchIndoor} />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          path={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Floor Layout</h1>
          <p className="page-subtitle">Hover over map elements to preview · click for details</p>
        </div>

        <div className="page-header-controls">
          {/* Building selector (indoor only) */}
          {mode === "indoor" && buildings.length > 0 && (
            <BuildingSelector
              buildings={buildings}
              selected={selectedBuilding}
              onSelect={(b) => { setSelectedBuilding(b); setSelectedFloor(1); setSelectedPathId(null); }}
            />
          )}

          {/* Mode toggle (outdoor shows "Outdoor" pill, indoor shows floor dropdown + level tabs) */}
          {mode === "indoor" && selectedBuilding ? (
            <>
              {/* Level label dropdown */}
              <div className="atlas-dropdown">
                <button className="atlas-dropdown-trigger">
                  Level {selectedFloor} — {selectedFloor === 1 ? "Ground Floor" : `Floor ${selectedFloor}`}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
              {/* Level tabs */}
              <div className="level-tabs">
                {Array.from({ length: selectedBuilding.floors }, (_, i) => i + 1).map((f) => (
                  <button
                    key={f}
                    className={`level-tab ${selectedFloor === f ? "active" : ""}`}
                    onClick={() => { setSelectedFloor(f); setSelectedPathId(null); }}
                  >
                    L{f}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="level-tabs">
              <button className="level-tab active">Outdoor</button>
            </div>
          )}

          {/* Outdoor / Indoor toggle */}
          <div className="mode-tabs">
            <button
              className={`mode-tab ${mode === "outdoor" ? "active" : ""}`}
              onClick={() => { setMode("outdoor"); setSelectedPathId(null); }}
            >Outdoor</button>
            <button
              className={`mode-tab ${mode === "indoor" ? "active" : ""}`}
              onClick={() => { setMode("indoor"); setSelectedPathId(null); }}
            >Indoor</button>
          </div>
        </div>
      </div>

      {/* ── Main body ────────────────────────────────────────────────────── */}
      <div className="atlas-body">
        {/* ── Map area ─────────────────────────────────────────────────── */}
        <div className="map-area">
          {/* Breadcrumb overlay */}
          <div className="map-breadcrumb">
            {mode === "indoor" && selectedBuilding
              ? `${selectedBuilding.name} · LEVEL ${selectedFloor} — ${selectedFloor === 1 ? "GROUND FLOOR" : `FLOOR ${selectedFloor}`}`
              : "OUTDOOR · CAMPUS MAP"}
          </div>

          {loading && (
            <div className="map-loading">
              <span className="spinner" /> Loading…
            </div>
          )}

          {mode === "indoor" ? (
            <MapContainer
              key={`indoor-map-${selectedBuilding?.id}-${selectedFloor}`}
              center={NITC_CENTER}
              zoom={20}
              className="the-map"
              zoomControl={true}
              attributionControl={true}
              maxZoom={22}
              minZoom={20}
              zoomSnap={0.5}
              wheelPxPerZoomLevel={120}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" opacity={0.15} />

              {selectedBuilding?.geom &&
                polygonCoords(selectedBuilding.geom).map((ring, i) => (
                  <Polygon key={`bldg-outer-${i}`} positions={ring}
                    pathOptions={{ color: "#1e3a5f", fillColor: "#e8eef5", fillOpacity: 0.3, weight: 2.5 }} />
                ))}

              {rooms.map((room) => {
                if (!room.geometry) return null;
                const polys = polygonCoords(room.geometry);
                const { fill, stroke } = roomColor(room.category, room.isAccessible);
                const isHovered = hoveredRoomId === room.id;
                return polys.map((ring, i) => (
                  <Polygon key={`room-${room.id}-${i}`} positions={ring}
                    pathOptions={{ color: stroke, fillColor: fill, fillOpacity: isHovered ? 0.5 : 0.35, weight: isHovered ? 2 : 1.5 }}
                    eventHandlers={{ mouseover: () => setHoveredRoomId(room.id), mouseout: () => setHoveredRoomId(null) }}>
                    <Tooltip direction="center" permanent={false}>
                      <div style={{ fontWeight: 600 }}>{room.name || room.roomNo}</div>
                      <div style={{ fontSize: "0.85em", opacity: 0.8 }}>Floor {room.floor} · {room.category}{!room.isAccessible && " · ⛔"}</div>
                    </Tooltip>
                  </Polygon>
                ));
              })}

              {indoorPaths.map((path) => {
                if (!path.geom) return null;
                const lines = geomToLatLngs(path.geom);
                const isSelected = selectedPathId === path.id;
                return lines.map((latlngs, i) => (
                  <Polyline key={`ip-${path.id}-${i}`} positions={latlngs}
                    pathOptions={{
                      color: isSelected ? "#e8a838" : path.isAccessible ? roadColor(path.roadType) : "#c0392b",
                      weight: isSelected ? 6 : 4,
                      opacity: isSelected ? 1 : path.isAccessible ? 0.9 : 0.4,
                      dashArray: path.isAccessible ? undefined : "5 5",
                      lineCap: "round", lineJoin: "round",
                    }}
                    eventHandlers={{ click: () => handlePathClick(path.id) }}>
                    <Tooltip sticky>
                      <strong>{path.name || path.roadType}</strong><br />
                      Floor {path.floor} · {path.isAccessible ? "✅ Open" : "🚫 Blocked"}
                      {path.isOneway && <><br />↗ One-way</>}
                    </Tooltip>
                  </Polyline>
                ));
              })}

              <FitBounds paths={displayPaths} rooms={rooms} buildingGeom={selectedBuilding?.geom} />
            </MapContainer>
          ) : (
            <MapContainer
              key="outdoor-map"
              center={NITC_CENTER}
              zoom={16}
              maxZoom={24}
              className="the-map"
              zoomControl={true}
            >
              <TileLayer maxNativeZoom={19} maxZoom={24} url={outdoorTileUrl} attribution='&copy; <a href="https://carto.com/">CARTO</a>' />

              {outdoorPaths.map((path) => {
                if (!path.geom) return null;
                const lines = geomToLatLngs(path.geom);
                const isSelected = selectedPathId === path.id;
                return lines.map((latlngs, i) => (
                  <Polyline key={`${path.id}-${i}`} positions={latlngs}
                    pathOptions={{
                      color: isSelected ? "#e8a838" : path.isAccessible ? roadColor(path.roadType) : "#c0392b",
                      weight: isSelected ? 6 : path.isAccessible ? 4 : 2,
                      opacity: isSelected ? 1 : path.isAccessible ? 0.85 : 0.4,
                      dashArray: path.isAccessible ? undefined : "6 4",
                    }}
                    eventHandlers={{ click: () => handlePathClick(path.id) }}>
                    <Tooltip sticky>
                      <strong>{path.name || path.roadType}</strong><br />
                      {path.isAccessible ? "✅ Accessible" : "🚫 Inaccessible"}
                      {path.isOneway && <><br />↗ One-way</>}
                    </Tooltip>
                  </Polyline>
                ));
              })}

              <FitBounds paths={displayPaths} />
            </MapContainer>
          )}

          {/* Legend */}
          <div className="atlas-legend">
            <div className="legend-title">LEGEND</div>
            {mode === "outdoor" ? (
              <>
                <div className="legend-row"><span className="leg-line" style={{ background: "#e8a838" }} /><span>Entry</span></div>
                <div className="legend-row"><span className="leg-line" style={{ background: "#1e3a5f" }} /><span>Path</span></div>
                <div className="legend-row"><span className="leg-line" style={{ background: "#c0392b" }} /><span>Stairs</span></div>
                <div className="legend-row"><span className="leg-line leg-dashed" style={{ borderColor: "#6b7fa3" }} /><span>Room entry</span></div>
              </>
            ) : (
              <>
                <div className="legend-row"><span className="leg-line" style={{ background: "#e8a838" }} /><span>Entry</span></div>
                <div className="legend-row"><span className="leg-line" style={{ background: "#1e3a5f" }} /><span>Corridor</span></div>
                <div className="legend-row"><span className="leg-line" style={{ background: "#c0392b" }} /><span>Stairs</span></div>
                <div className="legend-row"><span className="leg-line leg-dashed" style={{ borderColor: "#6b7fa3" }} /><span>Room entry</span></div>
              </>
            )}
          </div>
        </div>

        {/* ── Right panel ──────────────────────────────────────────────── */}
        <aside className="right-panel">
          {/* Tab bar */}
          <div className="panel-tabs">
            <button
              className={`panel-tab ${activeTab === "paths" ? "active" : ""}`}
              onClick={() => setActiveTab("paths")}
            >PATHS</button>
            {mode === "indoor" && (
              <button
                className={`panel-tab ${activeTab === "rooms" ? "active" : ""}`}
                onClick={() => setActiveTab("rooms")}
              >ROOMS</button>
            )}
          </div>

          {/* Section header */}
          {activeTab === "paths" && (
            <div className="panel-section-header">
              <div className="panel-section-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <span className="panel-section-title">NAVIGATION PATHS</span>
              <span className="panel-count">{displayPaths.length}</span>
            </div>
          )}
          {activeTab === "rooms" && (
            <div className="panel-section-header">
              <div className="panel-section-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 3v18M3 9h18" />
                </svg>
              </div>
              <span className="panel-section-title">ROOMS</span>
              <span className="panel-count">{rooms.length}</span>
            </div>
          )}

          {/* Content */}
          <div className="panel-list">
            {activeTab === "paths" && (
              <>
                {displayPaths.length === 0 && !loading && (
                  <div className="panel-empty">No paths found</div>
                )}
                {displayPaths.map((path) => {
                  const isSelected = selectedPathId === path.id;
                  const typeLabel = path.roadType === "corridor" ? "C" :
                    path.roadType === "stairs" ? "S" :
                    path.roadType === "footway" ? "F" :
                    path.roadType === "primary" ? "P" : path.roadType[0]?.toUpperCase();
                  return (
                    <div
                      key={path.id}
                      ref={(el) => { listItemRefs.current[path.id] = el; }}
                      className={`panel-item ${isSelected ? "selected" : ""} ${!path.isAccessible ? "inaccessible" : ""}`}
                      onClick={() => setSelectedPathId(isSelected ? null : path.id)}
                    >
                      <div className="panel-item-left">
                        <span
                          className="path-dot"
                          style={{ background: path.isAccessible ? roadColor(path.roadType) : "#c0392b" }}
                        />
                        <div className="panel-item-info">
                          <div className="panel-item-name">
                            {path.name || `Path ${path.id} · p${path.id}`}
                          </div>
                          <div className="panel-item-meta">
                            {typeLabel}{path.isOneway ? " · ↗" : ""}{path.floor != null ? ` · F${path.floor}` : ""}
                          </div>
                        </div>
                      </div>
                      <div className="panel-item-actions">
                        <button
                          className={`toggle-pill ${path.isAccessible ? "on" : "off"}`}
                          onClick={(e) => { e.stopPropagation(); togglePath(path); }}
                          disabled={togglingId === path.id}
                          title={path.isAccessible ? "Click to block" : "Click to unblock"}
                        >
                          {togglingId === path.id ? (
                            <span className="spinner sm" />
                          ) : (
                            <span className={`pill-thumb ${path.isAccessible ? "on" : "off"}`} />
                          )}
                        </button>
                        <button
                          className="delete-icon-btn"
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(path); }}
                          title="Delete path"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {activeTab === "rooms" && mode === "indoor" && (
              <>
                {rooms.length === 0 && (
                  <div className="panel-empty">No rooms found</div>
                )}
                {rooms.map((room) => {
                  const { fill } = roomColor(room.category, room.isAccessible);
                  return (
                    <div
                      key={room.id}
                      className={`panel-item ${hoveredRoomId === room.id ? "selected" : ""}`}
                      onMouseEnter={() => setHoveredRoomId(room.id)}
                      onMouseLeave={() => setHoveredRoomId(null)}
                    >
                      <div className="panel-item-left">
                        <span className="path-dot" style={{ background: fill, border: "1px solid #ccc" }} />
                        <div className="panel-item-info">
                          <div className="panel-item-name">{room.name || room.roomNo}</div>
                          <div className="panel-item-meta">{room.category}{!room.isAccessible ? " · ⛔" : ""}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer stats */}
          <div className="panel-footer">
            <div className="footer-stat">
              <span className="footer-stat-val">{displayPaths.length}</span>
              <span className="footer-stat-label">PATHS</span>
            </div>
            {mode === "indoor" && (
              <div className="footer-stat">
                <span className="footer-stat-val">{rooms.length}</span>
                <span className="footer-stat-label">ROOMS</span>
              </div>
            )}
            <div className="footer-stat">
              <span className="footer-stat-val">{displayPaths.filter(p => p.isAccessible).length}</span>
              <span className="footer-stat-label">OPEN</span>
            </div>
            <button
              className="add-btn"
              onClick={() => mode === "outdoor" ? setShowAddOutdoor(true) : setShowAddIndoor(true)}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add
            </button>
          </div>
        </aside>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        html, body, #root {
  height: 100%;
  margin: 0;
  background: #F8FAFC !important;
}
        .atlas-root {
          --navy: #1a2d4a;
          --navy-dark: #142239;
          --navy-light: #243d60;
          --gold: #e8a838;
          --gold-light: #f5c46a;
          --bg: #F8FAFC;
          --surface: transparent;
          --border: #e2e6ec;
          --text: #1a2d4a;
          --muted: #7a8aa0;
          --red: #c0392b;
          --green: #27ae60;
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ── Page header ── */
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px 10px;
          background: transparent;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
          gap: 16px;
        }
        .page-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          line-height: 1.2;
        }
        .page-subtitle {
          font-size: 11px;
          color: var(--muted);
          margin: 2px 0 0;
        }
        .page-header-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* ── Atlas dropdown ── */
        .atlas-dropdown { position: relative; }
        .atlas-dropdown-trigger {
          display: flex; align-items: center; gap: 7px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          color: var(--text);
          cursor: pointer;
          white-space: nowrap;
          transition: border-color 0.15s;
        }
        .atlas-dropdown-trigger:hover { border-color: var(--navy); }
        .atlas-dropdown-trigger .chevron { color: var(--muted); transition: transform 0.2s; }
        .atlas-dropdown-trigger .chevron.open { transform: rotate(180deg); }
        .atlas-dropdown-menu {
          position: absolute; top: calc(100% + 4px); left: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          z-index: 9999;
          min-width: 200px;
          overflow: hidden;
        }
        .atlas-dropdown-item {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; padding: 9px 14px;
          background: transparent; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 12px;
          color: var(--text); cursor: pointer; text-align: left;
          border-bottom: 1px solid var(--border); transition: background 0.1s;
        }
        .atlas-dropdown-item:last-child { border-bottom: none; }
        .atlas-dropdown-item:hover, .atlas-dropdown-item.active { background: #f7f9fc; }
        .item-meta { font-size: 10px; color: var(--muted); font-family: 'DM Mono', monospace; }

        /* ── Level tabs ── */
        .level-tabs {
          display: flex; gap: 2px;
          background: #f0f2f5;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 2px;
        }
        .level-tab {
          padding: 4px 10px;
          background: transparent; border: none;
          font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
          color: var(--muted); cursor: pointer; border-radius: 4px;
          transition: all 0.15s;
        }
        .level-tab.active {
          background: var(--navy);
          color: #fff;
        }
        .level-tab:hover:not(.active) { color: var(--text); background: var(--border); }

        /* ── Mode tabs ── */
        .mode-tabs {
          display: flex;
          border: 1px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
        }
        .mode-tab {
          padding: 5px 14px;
          background: var(--surface); border: none;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
          color: var(--muted); cursor: pointer;
          transition: all 0.15s;
          border-right: 1px solid var(--border);
        }
        .mode-tab:last-child { border-right: none; }
        .mode-tab.active { background: var(--gold); color: #fff; font-weight: 600; }
        .mode-tab:hover:not(.active) { background: #f7f9fc; color: var(--text); }

        /* ── Body ── */
        .atlas-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        /* ── Map area ── */
        .map-area {
          flex: 1;
          position: relative;
          overflow: hidden;
        }
        .the-map {
          width: 100%;
          height: 100%;
          background: #e8edf3;
        }
        .map-breadcrumb {
          position: absolute; top: 12px; left: 12px; z-index: 999;
          background: rgba(255,255,255,0.92);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 6px 14px;
          font-size: 11px;
          font-family: 'DM Mono', monospace;
          font-weight: 500;
          color: var(--navy);
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .map-loading {
          position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
          z-index: 1000;
          background: var(--surface); border: 1px solid var(--border);
          padding: 7px 14px; border-radius: 6px;
          font-size: 12px;
          display: flex; align-items: center; gap: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        /* Legend */
        .atlas-legend {
          position: absolute; bottom: 16px; left: 12px; z-index: 999;
          background: rgba(255,255,255,0.95);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 14px;
          min-width: 130px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          backdrop-filter: blur(8px);
        }
        .legend-title {
          font-size: 9px; font-weight: 600;
          font-family: 'DM Mono', monospace;
          color: var(--muted); letter-spacing: 0.12em;
          margin-bottom: 8px;
        }
        .legend-row {
          display: flex; align-items: center; gap: 9px;
          font-size: 11px; color: var(--text);
          margin-bottom: 5px;
        }
        .legend-row:last-child { margin-bottom: 0; }
        .leg-line {
          display: inline-block;
          width: 22px; height: 3px;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .leg-line.leg-dashed {
          background: transparent !important;
          border-bottom: 2px dashed;
          height: 0;
          border-radius: 0;
        }

        /* ── Right panel ── */
        .right-panel {
          width: 260px;
           background: transparent;
          border-left: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Tab bar */
        .panel-tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .panel-tab {
          flex: 1; padding: 11px 0;
          background: transparent; border: none;
          font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
          color: var(--muted); cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.15s;
          letter-spacing: 0.06em;
        }
        .panel-tab.active {
          color: var(--navy);
          border-bottom-color: var(--gold);
          font-weight: 600;
        }
        .panel-tab:hover:not(.active) { color: var(--text); }

        /* Section header */
        .panel-section-header {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .panel-section-icon {
          width: 24px; height: 24px;
          background: #f0f4f9;
          border-radius: 5px;
          display: flex; align-items: center; justify-content: center;
          color: var(--navy); flex-shrink: 0;
        }
        .panel-section-title {
          flex: 1;
          font-family: 'DM Mono', monospace; font-size: 10px;
          font-weight: 600; letter-spacing: 0.1em;
          color: var(--muted);
        }
        .panel-count {
          font-family: 'DM Mono', monospace; font-size: 11px;
          font-weight: 600; color: var(--muted);
          background: #f0f2f5; border-radius: 10px;
          padding: 1px 8px;
        }

        /* List */
        .panel-list {
          flex: 1; overflow-y: auto; padding: 4px 0;
        }
        .panel-list::-webkit-scrollbar { width: 3px; }
        .panel-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

        .panel-empty {
          text-align: center; color: var(--muted);
          padding: 32px 20px; font-size: 12px;
        }

        .panel-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 9px 14px;
          border-bottom: 1px solid #f5f5f7;
          cursor: pointer; transition: background 0.1s;
        }
        .panel-item:hover { background: #f7f9fc; }
        .panel-item:hover .delete-icon-btn { opacity: 1; }
        .panel-item.selected { background: #f0f5fb; }
        .panel-item.inaccessible { opacity: 0.55; }

        .panel-item-left { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
        .path-dot {
          width: 10px; height: 10px; border-radius: 50%;
          flex-shrink: 0;
        }
        .panel-item-info { min-width: 0; }
        .panel-item-name {
          font-size: 12px; font-weight: 500;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 110px; color: var(--text);
        }
        .panel-item-meta {
          font-size: 10px; color: var(--muted);
          font-family: 'DM Mono', monospace; margin-top: 1px;
        }

        /* Panel item actions group */
        .panel-item-actions {
          display: flex; align-items: center; gap: 6px; flex-shrink: 0;
        }

        /* Delete icon button */
        .delete-icon-btn {
          width: 26px; height: 26px;
          display: flex; align-items: center; justify-content: center;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 5px;
          cursor: pointer;
          color: var(--muted);
          opacity: 0;
          transition: opacity 0.15s, background 0.15s, color 0.15s, border-color 0.15s;
          flex-shrink: 0;
        }
        .delete-icon-btn:hover {
          background: rgba(192,57,43,0.08);
          border-color: rgba(192,57,43,0.25);
          color: var(--red);
        }

        /* Toggle pill */
        .toggle-pill {
          flex-shrink: 0;
          width: 36px; height: 20px;
          border-radius: 10px;
          border: none; cursor: pointer;
          display: flex; align-items: center; padding: 0 3px;
          transition: background 0.2s;
          position: relative;
        }
        .toggle-pill.on { background: rgba(39, 174, 96, 0.15); border: 1.5px solid rgba(39,174,96,0.3); }
        .toggle-pill.off { background: rgba(192, 57, 43, 0.1); border: 1.5px solid rgba(192,57,43,0.25); }
        .toggle-pill:disabled { opacity: 0.5; cursor: not-allowed; }
        .pill-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          transition: transform 0.2s;
          flex-shrink: 0;
        }
        .pill-thumb.on { background: #27ae60; transform: translateX(16px); }
        .pill-thumb.off { background: #c0392b; transform: translateX(0); }

        /* Footer */
        .panel-footer {
          display: flex; align-items: center;
          padding: 10px 14px;
          border-top: 1px solid var(--border);
          gap: 12px;
          flex-shrink: 0;
          background: transparent;
        }
        .footer-stat { display: flex; flex-direction: column; align-items: center; }
        .footer-stat-val {
          font-family: 'DM Mono', monospace; font-size: 15px; font-weight: 600;
          color: var(--navy); line-height: 1;
        }
        .footer-stat-label {
          font-size: 8px; color: var(--muted);
          letter-spacing: 0.1em; font-family: 'DM Mono', monospace; margin-top: 2px;
        }
        .add-btn {
          margin-left: auto;
          display: flex; align-items: center; gap: 5px;
          padding: 6px 12px;
          background: var(--gold); color: #fff;
          border: none; border-radius: 6px;
          font-size: 11px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: opacity 0.15s;
        }
        .add-btn:hover { opacity: 0.85; }

        /* Spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid var(--border); border-top-color: var(--navy);
          border-radius: 50%; animation: spin 0.6s linear infinite;
        }
        .spinner.sm { width: 10px; height: 10px; }

        /* ── Modal ── */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(26,45,74,0.35);
          z-index: 10000; display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(2px);
        }
        .modal {
          background: #fff; border: 1px solid var(--border);
          border-radius: 10px; width: 480px; max-width: 95vw;
          display: flex; flex-direction: column;
          box-shadow: 0 20px 60px rgba(26,45,74,0.18);
        }
        .modal.modal-sm {
          width: 380px;
        }
        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; border-bottom: 1px solid var(--border);
        }
        .modal-title {
          font-size: 14px; font-weight: 600; color: var(--navy);
        }
        .modal-close {
          background: transparent; border: none; color: var(--muted);
          font-size: 14px; cursor: pointer; padding: 4px 8px; border-radius: 4px;
        }
        .modal-close:hover { background: var(--bg); color: var(--text); }
        .modal-body {
          padding: 20px; display: flex; flex-direction: column; gap: 10px;
          max-height: 60vh; overflow-y: auto;
        }
        .modal-footer {
          display: flex; justify-content: flex-end; gap: 10px;
          padding: 14px 20px; border-top: 1px solid var(--border);
        }

        /* Delete modal specifics */
        .delete-warning-icon {
          display: flex; justify-content: center;
          padding: 8px 0 4px;
        }
        .delete-confirm-text {
          font-size: 13px; color: var(--text); text-align: center; margin: 0;
          line-height: 1.5;
        }
        .delete-confirm-sub {
          font-size: 11px; color: var(--muted); text-align: center; margin: 2px 0 0;
        }

        .field-label {
          font-size: 10px; font-weight: 600; color: var(--muted);
          letter-spacing: 0.08em; text-transform: uppercase;
          margin-bottom: 2px; display: block;
          font-family: 'DM Mono', monospace;
        }
        .field-check {
          display: flex; align-items: center; gap: 8px; cursor: pointer;
          text-transform: none; letter-spacing: 0; font-size: 12px; color: var(--text);
          font-family: 'DM Sans', sans-serif;
        }
        .field-row-info {
          display: flex; gap: 16px; font-size: 12px; color: var(--muted);
          padding: 8px 10px; background: #f7f9fc; border-radius: 6px;
          border: 1px solid var(--border); font-family: 'DM Mono', monospace;
        }
        .field-row-info b { color: var(--navy); }
        .field-input {
          width: 100%; background: #fafbfc; border: 1px solid var(--border);
          color: var(--text); border-radius: 6px; padding: 8px 10px;
          font-size: 12px; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.15s; box-sizing: border-box;
        }
        .field-input:focus { border-color: var(--navy); }
        .field-textarea {
          min-height: 88px; resize: vertical;
          font-family: 'DM Mono', monospace; font-size: 11px; line-height: 1.5;
        }
        .field-error {
          font-size: 11px; color: var(--red); padding: 6px 10px;
          background: rgba(192,57,43,0.07); border: 1px solid rgba(192,57,43,0.2); border-radius: 5px;
        }
        .optional { font-weight: 400; text-transform: none; letter-spacing: 0; font-size: 10px; }
        .required { color: var(--red); }
        .btn-cancel {
          background: transparent; border: 1px solid var(--border); color: var(--muted);
          border-radius: 6px; padding: 7px 16px; font-size: 12px; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .btn-cancel:hover:not(:disabled) { color: var(--text); border-color: var(--muted); }
        .btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-save {
          background: var(--navy); color: #fff; border: none;
          border-radius: 6px; padding: 7px 18px; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 6px;
          min-width: 88px; justify-content: center;
          transition: opacity 0.15s;
        }
        .btn-save:hover:not(:disabled) { opacity: 0.85; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-delete {
          background: var(--red); color: #fff; border: none;
          border-radius: 6px; padding: 7px 18px; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 6px;
          min-width: 88px; justify-content: center;
          transition: opacity 0.15s;
        }
        .btn-delete:hover:not(:disabled) { opacity: 0.85; }
        .btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Leaflet tooltip override */
        .leaflet-tooltip {
          background: var(--surface) !important;
          border: 1px solid var(--border) !important;
          color: var(--text) !important;
          font-family: 'DM Sans', sans-serif !important;
          font-size: 12px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
          border-radius: 6px !important;
          padding: 6px 10px !important;
        }
        .leaflet-tooltip-top::before { border-top-color: var(--border) !important; }

        /* Leaflet zoom control */
        .leaflet-control-zoom {
          border: 1px solid var(--border) !important;
          border-radius: 6px !important;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
        }
        .leaflet-control-zoom a {
          background: var(--surface) !important;
          color: var(--navy) !important;
          border-bottom: 1px solid var(--border) !important;
          font-weight: 600 !important;
          width: 28px !important; height: 28px !important;
          line-height: 28px !important;
          font-size: 15px !important;
        }
        .leaflet-control-zoom a:hover { background: #f0f4f9 !important; }
      `}</style>
    </div>
  );
}