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

    // Include building bounds
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
  primary: "#f97316",
  secondary: "#eab308",
  tertiary: "#84cc16",
  footway: "#22d3ee",
  path: "#a78bfa",
  service: "#94a3b8",
  corridor: "#818cf8",
  stairs: "#fb923c",
  default: "#60a5fa",
};

const ROOM_CATEGORY_COLORS: Record<string, { fill: string; stroke: string }> = {
  classroom: { fill: "#3b82f6", stroke: "#60a5fa" },
  lab: { fill: "#8b5cf6", stroke: "#a78bfa" },
  office: { fill: "#f59e0b", stroke: "#fbbf24" },
  restroom: { fill: "#06b6d4", stroke: "#22d3ee" },
  corridor: { fill: "#374151", stroke: "#4b5563" },
  stairs: { fill: "#d97706", stroke: "#f59e0b" },
  default: { fill: "#1e3a5f", stroke: "#2563eb" },
};

const ROAD_TYPES = Object.keys(ROAD_COLORS).filter((k) => k !== "default");

function roadColor(type: string) {
  return ROAD_COLORS[type] ?? ROAD_COLORS.default;
}

function roomColor(category: string, accessible: boolean) {
  if (!accessible) return { fill: "#3f1515", stroke: "#ef4444" };
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
      const res = await fetch("http://localhost:8080/api/paths/outdoor", {
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
          <span className="modal-title">＋ Add Outdoor Path</span>
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
      const res = await fetch("http://localhost:8080/api/paths/indoor", {
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
          <span className="modal-title">＋ Add Indoor Path</span>
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

// ─── Building Card Selector ───────────────────────────────────────────────────

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
    <div className="bld-selector" ref={ref}>
      <button className="bld-trigger" onClick={() => setOpen(!open)}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="1" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
        <span className="bld-name">{selected?.name ?? "Select building"}</span>
        {selected && (
          <span className="bld-meta">{selected.floors}F · {selected.isAccessible ? "♿" : "⛔"}</span>
        )}
        <svg className={`bld-chevron ${open ? "open" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="bld-dropdown">
          {buildings.map((b) => (
            <button
              key={b.id}
              className={`bld-option ${selected?.id === b.id ? "active" : ""}`}
              onClick={() => { onSelect(b); setOpen(false); }}
            >
              <div className="bld-opt-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="1" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div className="bld-opt-info">
                <span className="bld-opt-name">{b.name}</span>
                <span className="bld-opt-meta">{b.floors} floors · ID {b.id}</span>
              </div>
              {b.isAccessible && <span className="bld-accessible-badge">♿</span>}
              {selected?.id === b.id && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{color:"#22d3ee",flexShrink:0}}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
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

  const listItemRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // ── Fetch outdoor paths ───────────────────────────────────────────────────
  const fetchOutdoor = useCallback(() => {
    setLoadingOutdoor(true);
    fetch("http://localhost:8080/api/paths?outdoor=true")
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
    fetch("http://localhost:8080/api/buildings")
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
      fetch(`http://localhost:8080/api/paths?buildingId=${selectedBuilding.id}&floor=${selectedFloor}`).then((r) => r.json()),
      fetch(`http://localhost:8080/api/rooms?buildingId=${selectedBuilding.id}&floor=${selectedFloor}`).then((r) => r.json()),
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
      await fetch(`http://localhost:8080/api/paths/${path.id}/accessible`, {
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

  // Indoor map uses light blueprint theme
  const indoorTileUrl = "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";
  const outdoorTileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="paths-root">
      {showAddOutdoor && <AddOutdoorModal onClose={() => setShowAddOutdoor(false)} onSaved={fetchOutdoor} />}
      {showAddIndoor && selectedBuilding && (
        <AddIndoorModal buildingId={selectedBuilding.id} floor={selectedFloor}
          onClose={() => setShowAddIndoor(false)} onSaved={fetchIndoor} />
      )}

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <div className="topbar-title">PATH MANAGER</div>
            <div className="topbar-sub">
              {displayPaths.length} paths · {displayPaths.filter((p) => p.isAccessible).length} accessible
            </div>
          </div>
        </div>

        <div className="topbar-center">
          <div className="mode-toggle">
            <button className={`mode-btn ${mode === "outdoor" ? "active" : ""}`}
              onClick={() => { setMode("outdoor"); setSelectedPathId(null); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 17l5-10 4 6 3-4 6 8H3z" />
              </svg>
              Outdoor
            </button>
            <button className={`mode-btn ${mode === "indoor" ? "active" : ""}`}
              onClick={() => { setMode("indoor"); setSelectedPathId(null); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18M3 9h18M3 15h18" />
              </svg>
              Indoor
            </button>
          </div>
        </div>

        <div className="topbar-right">
          {mode === "indoor" && buildings.length > 0 && (
            <BuildingSelector
              buildings={buildings}
              selected={selectedBuilding}
              onSelect={(b) => { setSelectedBuilding(b); setSelectedFloor(1); setSelectedPathId(null); }}
            />
          )}
          <button className="add-path-btn"
            onClick={() => mode === "outdoor" ? setShowAddOutdoor(true) : setShowAddIndoor(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Path
          </button>
        </div>
      </header>

      {/* ── Indoor sub-bar: building card + floor tabs ─────────────────────── */}
      {mode === "indoor" && selectedBuilding && (
        <div className="indoor-subbar">
          {/* Building info card */}
          <div className="building-card">
            <div className="building-card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="14" rx="1" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div className="building-card-info">
              <div className="building-card-name">{selectedBuilding.name}</div>
              <div className="building-card-meta">
                <span>{selectedBuilding.floors} floors</span>
                <span className="dot" />
                <span>ID #{selectedBuilding.id}</span>
                <span className="dot" />
                <span className={selectedBuilding.isAccessible ? "accessible-tag" : "blocked-tag"}>
                  {selectedBuilding.isAccessible ? "♿ Accessible" : "⛔ Not accessible"}
                </span>
              </div>
            </div>
            <div className="building-card-stats">
              <div className="bc-stat">
                <div className="bc-stat-val">{indoorPaths.length}</div>
                <div className="bc-stat-label">paths</div>
              </div>
              <div className="bc-stat">
                <div className="bc-stat-val">{rooms.length}</div>
                <div className="bc-stat-label">rooms</div>
              </div>
            </div>
          </div>

          {/* Floor tabs */}
          <div className="floor-strip">
            <span className="floor-strip-label">FLOOR</span>
            <div className="floor-tabs">
              {Array.from({ length: selectedBuilding.floors }, (_, i) => i + 1).map((f) => (
                <button key={f}
                  className={`floor-tab ${selectedFloor === f ? "active" : ""}`}
                  onClick={() => { setSelectedFloor(f); setSelectedPathId(null); }}>
                  <span className="floor-num">{f}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="body">
        {/* ── Map ──────────────────────────────────────────────────────────── */}
        <div className={`map-wrapper ${mode === "indoor" ? "indoor-mode" : ""}`}>
          {loading && (
            <div className="map-loading">
              <span className="spinner" />
              Loading…
            </div>
          )}

          {mode === "indoor" ? (
            <MapContainer
              key={`indoor-map-${selectedBuilding?.id}-${selectedFloor}`}
              center={NITC_CENTER}
              zoom={20}
              className="the-map"
              zoomControl={true}
              attributionControl={false}
              maxZoom={22}
              minZoom={20}
              zoomSnap={0.5}
              wheelPxPerZoomLevel={120}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                opacity={0.3}
              />

              {/* ── Indoor: building outline (thick blueprint border) ── */}
              {selectedBuilding?.geom &&
                polygonCoords(selectedBuilding.geom).map((ring, i) => (
                  <Polygon key={`bldg-outer-${i}`} positions={ring}
                    pathOptions={{
                      color: "#1d4ed8",
                      fillColor: "#eff6ff",
                      fillOpacity: 0.4,
                      weight: 3,
                      dashArray: undefined,
                    }} />
                ))}

              {/* ── Indoor: rooms with category colors ── */}
              {rooms.map((room) => {
                if (!room.geometry) return null;
                const polys = polygonCoords(room.geometry);
                const { fill, stroke } = roomColor(room.category, room.isAccessible);
                const isHovered = hoveredRoomId === room.id;
                return polys.map((ring, i) => (
                  <Polygon key={`room-${room.id}-${i}`} positions={ring}
                    pathOptions={{
                      color: stroke,
                      fillColor: fill,
                      fillOpacity: isHovered ? 0.55 : 0.3,
                      weight: isHovered ? 2.5 : 1.5,
                    }}
                    eventHandlers={{
                      mouseover: () => setHoveredRoomId(room.id),
                      mouseout: () => setHoveredRoomId(null),
                    }}>
                    <Tooltip direction="center" permanent={false}>
                      <div style={{ fontWeight: 600 }}>{room.name || room.roomNo}</div>
                      <div style={{ fontSize: "0.85em", opacity: 0.8 }}>
                        Floor {room.floor} · {room.category}
                        {!room.isAccessible && " · ⛔"}
                      </div>
                    </Tooltip>
                  </Polygon>
                ));
              })}

              {/* ── Indoor paths (drawn above rooms) ── */}
              {indoorPaths.map((path) => {
                if (!path.geom) return null;
                const lines = geomToLatLngs(path.geom);
                const isSelected = selectedPathId === path.id;
                return lines.map((latlngs, i) => (
                  <Polyline key={`ip-${path.id}-${i}`} positions={latlngs}
                    pathOptions={{
                      color: isSelected ? "#f0f" : path.isAccessible ? roadColor(path.roadType) : "#ef4444",
                      weight: isSelected ? 7 : 4,
                      opacity: isSelected ? 1 : path.isAccessible ? 0.95 : 0.35,
                      dashArray: path.isAccessible ? undefined : "5 5",
                      lineCap: "round",
                      lineJoin: "round",
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

              <FitBounds
                paths={displayPaths}
                rooms={rooms}
                buildingGeom={selectedBuilding?.geom}
              />
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
              <TileLayer
                maxNativeZoom={19}
                maxZoom={24}
                url={outdoorTileUrl}
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />

              {/* ── Outdoor paths ── */}
              {outdoorPaths.map((path) => {
                if (!path.geom) return null;
                const lines = geomToLatLngs(path.geom);
                const isSelected = selectedPathId === path.id;
                return lines.map((latlngs, i) => (
                  <Polyline key={`${path.id}-${i}`} positions={latlngs}
                    pathOptions={{
                      color: isSelected ? "#fff" : path.isAccessible ? roadColor(path.roadType) : "#ef4444",
                      weight: isSelected ? 7 : path.isAccessible ? 4 : 2,
                      opacity: isSelected ? 1 : path.isAccessible ? 0.9 : 0.4,
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

              <FitBounds
                paths={displayPaths}
              />
            </MapContainer>
          )}

          {/* Map mode badge */}
          <div className="map-mode-badge">
            {mode === "indoor" ? (
              <><span className="badge-dot indoor" />2D Floor Plan · Floor {selectedFloor}</>
            ) : (
              <><span className="badge-dot outdoor" />Outdoor Map</>
            )}
          </div>

          {/* Legend */}
          <div className="legend">
            {mode === "indoor" ? (
              <>
                <div className="legend-title">ROOMS</div>
                {Object.entries(ROOM_CATEGORY_COLORS).filter(([k]) => k !== "default").map(([cat, { fill }]) => (
                  <div className="legend-row" key={cat}>
                    <span className="swatch-box" style={{ background: fill, opacity: 0.7 }} />
                    <span style={{ textTransform: "capitalize" }}>{cat}</span>
                  </div>
                ))}
                <div className="legend-divider" />
                <div className="legend-title">PATHS</div>
                <div className="legend-row">
                  <span className="swatch" style={{ background: "#818cf8" }} />Corridor
                </div>
                <div className="legend-row">
                  <span className="swatch" style={{ background: "#ef4444", opacity: 0.5 }} />Blocked
                </div>
              </>
            ) : (
              <>
                <div className="legend-title">PATH TYPES</div>
                {Object.entries(ROAD_COLORS).filter(([k]) => k !== "default").map(([type, color]) => (
                  <div className="legend-row" key={type}>
                    <span className="swatch" style={{ background: color }} />
                    <span style={{ textTransform: "capitalize" }}>{type}</span>
                  </div>
                ))}
                <div className="legend-divider" />
                <div className="legend-row">
                  <span className="swatch" style={{ background: "#ef4444", opacity: 0.4 }} />Inaccessible
                </div>
              </>
            )}
            <div className="legend-hint">Click path to select</div>
          </div>
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div>
              <div className="sidebar-title">
                {mode === "outdoor" ? "Outdoor Paths" : `Floor ${selectedFloor} Paths`}
              </div>
              {mode === "indoor" && selectedBuilding && (
                <div className="sidebar-subtitle">{selectedBuilding.name}</div>
              )}
            </div>
            <span className="badge">{displayPaths.length}</span>
          </div>

          {selectedPathId !== null && (
            <div className="selected-banner">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Path #{selectedPathId} selected
              <button className="clear-sel" onClick={() => setSelectedPathId(null)}>✕</button>
            </div>
          )}

          <div className="path-list">
            {displayPaths.length === 0 && !loading && (
              <div className="empty-state">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{opacity:0.3}}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <div>No paths found</div>
              </div>
            )}
            {displayPaths.map((path) => {
              const isSelected = selectedPathId === path.id;
              return (
                <div key={path.id}
                  ref={(el) => { listItemRefs.current[path.id] = el; }}
                  className={`path-row${!path.isAccessible ? " inaccessible" : ""}${isSelected ? " selected" : ""}`}
                  onClick={() => setSelectedPathId(isSelected ? null : path.id)}>
                  <div className="path-left">
                    <span className="road-swatch" style={{ background: roadColor(path.roadType) }} />
                    <div>
                      <div className="path-name">{path.name || `Path #${path.id}`}</div>
                      <div className="path-meta">
                        {path.roadType}
                        {path.isOneway && " · ↗"}
                        {path.floor != null && ` · F${path.floor}`}
                      </div>
                    </div>
                  </div>
                  <button
                    className={`toggle-btn ${path.isAccessible ? "on" : "off"}`}
                    onClick={(e) => { e.stopPropagation(); togglePath(path); }}
                    disabled={togglingId === path.id}
                    title={path.isAccessible ? "Click to block" : "Click to unblock"}>
                    {togglingId === path.id ? <span className="spinner sm" /> : path.isAccessible ? "Open" : "Blocked"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Room list when indoor */}
          {mode === "indoor" && rooms.length > 0 && (
            <>
              <div className="sidebar-header" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="sidebar-title">Rooms</div>
                <span className="badge" style={{ background: "var(--accent2)", color: "#0c0f14" }}>{rooms.length}</span>
              </div>
              <div className="room-list">
                {rooms.map((room) => {
                  const { fill } = roomColor(room.category, room.isAccessible);
                  return (
                    <div key={room.id}
                      className={`room-row ${hoveredRoomId === room.id ? "hovered" : ""}`}
                      onMouseEnter={() => setHoveredRoomId(room.id)}
                      onMouseLeave={() => setHoveredRoomId(null)}>
                      <span className="room-dot" style={{ background: fill }} />
                      <div>
                        <div className="room-name">{room.name || room.roomNo}</div>
                        <div className="room-meta">{room.category} {!room.isAccessible && "· ⛔"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </aside>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');


        .paths-root {
          --bg: #0a0d12;
          --surface: #111621;
          --surface2: #161d2a;
          --border: #1e2a3a;
          --text: #e1e7f0;
          --muted: #556070;
          --accent: #2563eb;
          --accent2: #22d3ee;
          --on: #34d399;
          --off: #f87171;
          font-family: 'IBM Plex Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ── Topbar ── */
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          height: 52px;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
          gap: 12px;
        }
        .topbar-brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .brand-icon {
          width: 32px; height: 32px;
          background: var(--accent);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: #fff; flex-shrink: 0;
        }
        .topbar-title {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.15em; color: var(--accent2);
        }
        .topbar-sub { font-size: 10px; color: var(--muted); margin-top: 1px; }
        .topbar-center { display: flex; align-items: center; }
        .topbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        /* ── Mode toggle ── */
        .mode-toggle {
          display: flex;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 3px;
          gap: 2px;
        }
        .mode-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 14px; font-size: 12px; font-weight: 500;
          background: transparent; border: none; color: var(--muted);
          cursor: pointer; border-radius: 6px; transition: all 0.15s;
          font-family: 'IBM Plex Sans', sans-serif;
        }
        .mode-btn.active { background: var(--accent); color: #fff; }
        .mode-btn:hover:not(.active) { color: var(--text); background: var(--surface2); }

        /* ── Building dropdown ── */
        .bld-selector { position: relative; }
        .bld-trigger {
          display: flex; align-items: center; gap: 8px;
          background: var(--bg); border: 1px solid var(--border);
          color: var(--text); border-radius: 8px; padding: 5px 10px;
          font-size: 12px; font-family: 'IBM Plex Sans', sans-serif;
          cursor: pointer; transition: border-color 0.15s; white-space: nowrap;
          min-width: 160px; max-width: 220px;
        }
        .bld-trigger:hover { border-color: var(--accent2); }
        .bld-name { font-weight: 600; flex: 1; overflow: hidden; text-overflow: ellipsis; }
        .bld-meta { font-size: 10px; color: var(--muted); flex-shrink: 0; }
        .bld-chevron { color: var(--muted); flex-shrink: 0; transition: transform 0.2s; }
        .bld-chevron.open { transform: rotate(180deg); }
        .bld-dropdown {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; z-index: 9999; overflow: hidden;
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
          min-width: 220px;
        }
        .bld-option {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 12px;
          background: transparent; border: none; border-bottom: 1px solid var(--border);
          color: var(--text); cursor: pointer; text-align: left;
          font-family: 'IBM Plex Sans', sans-serif; transition: background 0.1s;
        }
        .bld-option:last-child { border-bottom: none; }
        .bld-option:hover, .bld-option.active { background: var(--surface2); }
        .bld-opt-icon { color: var(--muted); flex-shrink: 0; }
        .bld-opt-info { flex: 1; min-width: 0; }
        .bld-opt-name { font-size: 13px; font-weight: 500; }
        .bld-opt-meta { font-size: 10px; color: var(--muted); margin-top: 1px; font-family: 'IBM Plex Mono', monospace; }
        .bld-accessible-badge { font-size: 12px; flex-shrink: 0; }

        /* ── Add path button ── */
        .add-path-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px;
          background: var(--accent); color: #fff;
          border: none; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: opacity 0.15s; white-space: nowrap;
          font-family: 'IBM Plex Sans', sans-serif;
        }
        .add-path-btn:hover { opacity: 0.85; }

        /* ── Indoor subbar ── */
        .indoor-subbar {
          display: flex; align-items: center; gap: 12px;
          padding: 8px 16px;
          background: var(--surface2);
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
          overflow-x: auto;
        }

        /* Building card */
        .building-card {
          display: flex; align-items: center; gap: 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 8px 14px;
          flex-shrink: 0;
          border-left: 3px solid var(--accent);
        }
        .building-card-icon {
          width: 36px; height: 36px;
          background: rgba(37,99,235,0.15);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: var(--accent); flex-shrink: 0;
        }
        .building-card-info { min-width: 0; }
        .building-card-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
        .building-card-meta {
          display: flex; align-items: center; gap: 6px;
          font-size: 10px; color: var(--muted); margin-top: 2px;
          font-family: 'IBM Plex Mono', monospace;
        }
        .dot { width: 3px; height: 3px; background: var(--muted); border-radius: 50%; }
        .accessible-tag { color: var(--on); }
        .blocked-tag { color: var(--off); }
        .building-card-stats { display: flex; gap: 16px; margin-left: 8px; }
        .bc-stat { text-align: center; }
        .bc-stat-val { font-size: 18px; font-weight: 700; font-family: 'IBM Plex Mono', monospace; color: var(--accent2); line-height: 1; }
        .bc-stat-label { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }

        /* Floor strip */
        .floor-strip { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .floor-strip-label { font-size: 9px; color: var(--muted); font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.1em; font-weight: 600; }
        .floor-tabs { display: flex; gap: 4px; }
        .floor-tab {
          width: 34px; height: 34px;
          border-radius: 8px;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--muted);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .floor-tab.active { background: var(--accent2); color: #0a0d12; border-color: var(--accent2); }
        .floor-tab:hover:not(.active) { border-color: var(--accent2); color: var(--text); }
        .floor-num {}

        /* ── Body ── */
        .body { flex: 1; display: flex; overflow: hidden; }

        /* ── Map ── */
        .map-wrapper { flex: 1; position: relative; }
        .map-wrapper.indoor-mode .the-map { filter: none; }
        .the-map { width: 100%; height: 100%; background: #0a0d12; }

        .map-loading {
          position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
          z-index: 1000; background: var(--surface); border: 1px solid var(--border);
          padding: 7px 14px; border-radius: 8px; font-size: 12px;
          display: flex; align-items: center; gap: 8px;
        }

        /* Map mode badge */
        .map-mode-badge {
          position: absolute; top: 12px; left: 12px; z-index: 999;
          background: rgba(17,22,33,0.9); border: 1px solid var(--border);
          padding: 5px 12px; border-radius: 20px;
          font-size: 11px; font-family: 'IBM Plex Mono', monospace;
          display: flex; align-items: center; gap: 7px;
          backdrop-filter: blur(6px);
        }
        .badge-dot { width: 7px; height: 7px; border-radius: 50%; }
        .badge-dot.indoor { background: var(--accent2); box-shadow: 0 0 6px var(--accent2); }
        .badge-dot.outdoor { background: #f97316; box-shadow: 0 0 6px #f97316; }

        /* Legend */
        .legend {
          position: absolute; bottom: 16px; left: 12px; z-index: 999;
          background: rgba(17,22,33,0.93); border: 1px solid var(--border);
          border-radius: 10px; padding: 10px 12px;
          display: flex; flex-direction: column; gap: 5px;
          backdrop-filter: blur(6px); max-height: 300px; overflow-y: auto;
        }
        .legend-title { font-size: 9px; color: var(--muted); font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 2px; }
        .legend-divider { height: 1px; background: var(--border); margin: 4px 0; }
        .legend-row { display: flex; align-items: center; gap: 7px; font-size: 11px; color: var(--text); }
        .legend-hint { font-size: 9px; color: var(--muted); margin-top: 3px; font-style: italic; }
        .swatch { width: 16px; height: 4px; border-radius: 2px; flex-shrink: 0; }
        .swatch-box { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }

        /* ── Sidebar ── */
        .sidebar {
          width: 290px; background: var(--surface);
          border-left: 1px solid var(--border);
          display: flex; flex-direction: column; overflow: hidden;
        }
        .sidebar-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 14px; border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .sidebar-title { font-size: 12px; font-weight: 600; letter-spacing: 0.02em; }
        .sidebar-subtitle { font-size: 10px; color: var(--muted); margin-top: 1px; font-family: 'IBM Plex Mono', monospace; }
        .badge {
          background: var(--accent); color: #fff;
          font-size: 10px; font-family: 'IBM Plex Mono', monospace;
          border-radius: 999px; padding: 2px 8px;
        }

        .selected-banner {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px;
          background: rgba(34,211,238,0.06);
          border-bottom: 1px solid var(--border);
          font-size: 11px; color: var(--accent2); flex-shrink: 0;
          font-family: 'IBM Plex Mono', monospace;
        }
        .clear-sel {
          margin-left: auto; background: transparent; border: none;
          color: var(--muted); cursor: pointer; font-size: 11px;
          padding: 2px 5px; border-radius: 3px;
        }
        .clear-sel:hover { color: var(--text); background: var(--border); }

        .path-list { flex: 1; overflow-y: auto; padding: 5px; }
        .path-list::-webkit-scrollbar { width: 3px; }
        .path-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

        .empty-state {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          text-align: center; color: var(--muted);
          padding: 36px 20px; font-size: 12px;
        }

        .path-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 10px; border-radius: 8px; margin-bottom: 2px;
          background: transparent; border: 1px solid transparent;
          transition: all 0.1s; cursor: pointer;
        }
        .path-row:hover { background: var(--bg); border-color: var(--border); }
        .path-row.inaccessible { opacity: 0.6; }
        .path-row.selected { background: rgba(34,211,238,0.06) !important; border-color: rgba(34,211,238,0.3) !important; }

        .path-left { display: flex; align-items: center; gap: 9px; min-width: 0; }
        .road-swatch { width: 4px; height: 32px; border-radius: 2px; flex-shrink: 0; }
        .path-name { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px; }
        .path-meta { font-size: 10px; color: var(--muted); margin-top: 1px; font-family: 'IBM Plex Mono', monospace; }

        /* Toggle button */
        .toggle-btn {
          flex-shrink: 0; padding: 4px 10px; border-radius: 5px;
          font-size: 10px; font-weight: 600;
          font-family: 'IBM Plex Mono', monospace;
          border: none; cursor: pointer; transition: all 0.15s;
          min-width: 54px; display: flex; align-items: center; justify-content: center;
        }
        .toggle-btn.on { background: rgba(52,211,153,0.12); color: var(--on); border: 1px solid rgba(52,211,153,0.25); }
        .toggle-btn.on:hover { background: rgba(52,211,153,0.22); }
        .toggle-btn.off { background: rgba(248,113,113,0.12); color: var(--off); border: 1px solid rgba(248,113,113,0.25); }
        .toggle-btn.off:hover { background: rgba(248,113,113,0.22); }
        .toggle-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Room list */
        .room-list { overflow-y: auto; max-height: 180px; padding: 5px; flex-shrink: 0; }
        .room-list::-webkit-scrollbar { width: 3px; }
        .room-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        .room-row {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 10px; border-radius: 6px; margin-bottom: 2px;
          cursor: default; border: 1px solid transparent; transition: all 0.1s;
        }
        .room-row.hovered { background: var(--bg); border-color: var(--border); }
        .room-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
        .room-name { font-size: 11px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
        .room-meta { font-size: 10px; color: var(--muted); font-family: 'IBM Plex Mono', monospace; margin-top: 1px; }

        /* Spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid var(--border); border-top-color: var(--accent2);
          border-radius: 50%; animation: spin 0.6s linear infinite;
        }
        .spinner.sm { width: 11px; height: 11px; }

        /* ── Modal ── */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          z-index: 10000; display: flex; align-items: center; justify-content: center;
        }
        .modal {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 12px; width: 480px; max-width: 95vw;
          display: flex; flex-direction: column;
          box-shadow: 0 24px 64px rgba(0,0,0,0.6);
        }
        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; border-bottom: 1px solid var(--border);
        }
        .modal-title {
          font-size: 13px; font-weight: 600; color: var(--accent2);
          font-family: 'IBM Plex Mono', monospace;
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
        .field-label {
          font-size: 10px; font-weight: 600; color: var(--muted);
          letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 2px; display: block;
          font-family: 'IBM Plex Mono', monospace;
        }
        .field-check {
          display: flex; align-items: center; gap: 8px; cursor: pointer;
          text-transform: none; letter-spacing: 0; font-size: 12px; color: var(--text);
          font-family: 'IBM Plex Sans', sans-serif;
        }
        .field-row-info {
          display: flex; gap: 16px; font-size: 12px; color: var(--muted);
          padding: 8px 10px; background: var(--bg); border-radius: 6px; border: 1px solid var(--border);
          font-family: 'IBM Plex Mono', monospace;
        }
        .field-row-info b { color: var(--accent2); }
        .field-input {
          width: 100%; background: var(--bg); border: 1px solid var(--border);
          color: var(--text); border-radius: 6px; padding: 8px 10px;
          font-size: 12px; font-family: 'IBM Plex Sans', sans-serif;
          outline: none; transition: border-color 0.15s;
        }
        .field-input:focus { border-color: var(--accent2); }
        .field-textarea {
          min-height: 88px; resize: vertical;
          font-family: 'IBM Plex Mono', monospace; font-size: 11px; line-height: 1.5;
        }
        .field-error {
          font-size: 11px; color: var(--off); padding: 6px 10px;
          background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); border-radius: 5px;
        }
        .optional { font-weight: 400; text-transform: none; letter-spacing: 0; font-size: 10px; }
        .required { color: var(--off); }
        .btn-cancel {
          background: transparent; border: 1px solid var(--border); color: var(--muted);
          border-radius: 6px; padding: 7px 16px; font-size: 12px; cursor: pointer;
          font-family: 'IBM Plex Sans', sans-serif; transition: all 0.15s;
        }
        .btn-cancel:hover { color: var(--text); border-color: var(--muted); }
        .btn-save {
          background: var(--accent); color: #fff; border: none;
          border-radius: 6px; padding: 7px 18px; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'IBM Plex Sans', sans-serif;
          display: flex; align-items: center; gap: 6px; min-width: 88px; justify-content: center;
          transition: opacity 0.15s;
        }
        .btn-save:hover:not(:disabled) { opacity: 0.85; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Leaflet tooltip override for indoor */
        .leaflet-tooltip {
          background: var(--surface) !important;
          border: 1px solid var(--border) !important;
          color: var(--text) !important;
          font-family: 'IBM Plex Sans', sans-serif !important;
          font-size: 12px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
          border-radius: 6px !important;
          padding: 6px 10px !important;
        }
        .leaflet-tooltip-top::before { border-top-color: var(--border) !important; }
      `}</style>
    </div>
  );
}