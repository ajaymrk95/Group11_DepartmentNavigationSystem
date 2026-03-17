import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  MapPin, Tag, Hash, Save, CheckCircle2, ChevronRight,
  MousePointer2, X, AlertCircle, Building2, Navigation,
Trash2, List, Clock, ExternalLink,
} from "lucide-react";

import { GLOBAL_STYLES, MAP_CENTER } from "../components/floormap/constants";
import { SelectBox } from "../components/floormap/ui";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type LocationType = "building" | "entrance" | "parking" | "landmark" | "emergency" | "other";

interface PickedPoint { lat: number; lng: number }
interface FormState {
  name: string; shortCode: string; locType: LocationType;
  description: string; navigable: boolean;
}
interface SavedLocation extends FormState {
  id: number; point: PickedPoint; savedAt: string;
}

/* ─── Hardcoded seed data ────────────────────────────────────────────────── */

const SEED_LOCATIONS: SavedLocation[] = [
  {
    id: 1, name: "ELHC Block", shortCode: "ELHC", locType: "building",
    description: "Electronics & Hardware Lab Complex, main entrance on west side.",
    navigable: true, savedAt: "2025-03-10 09:14",
    point: { lat: 11.32258, lng: 75.93370 },
  },
  {
    id: 2, name: "Main Gate", shortCode: "GATE-1", locType: "entrance",
    description: "Primary campus entrance, open 6 AM – 10 PM.",
    navigable: true, savedAt: "2025-03-10 09:22",
    point: { lat: 11.32310, lng: 75.93290 },
  },
  {
    id: 3, name: "Staff Parking A", shortCode: "PKG-A", locType: "parking",
    description: "Reserved for faculty. 40 slots.",
    navigable: false, savedAt: "2025-03-11 11:05",
    point: { lat: 11.32195, lng: 75.93420 },
  },
  {
    id: 4, name: "Central Fountain", shortCode: "", locType: "landmark",
    description: "Iconic campus landmark near the admin block.",
    navigable: true, savedAt: "2025-03-12 14:30",
    point: { lat: 11.32270, lng: 75.93350 },
  },
  {
    id: 5, name: "Medical Centre", shortCode: "MED", locType: "emergency",
    description: "First aid and health services. Open 24 hours.",
    navigable: true, savedAt: "2025-03-13 08:00",
    point: { lat: 11.32240, lng: 75.93400 },
  },
];

/* ─── Constants ─────────────────────────────────────────────────────────── */

const LOCATION_TYPES: {
  value: LocationType; label: string; desc: string; color: string; icon: string;
}[] = [
  { value: "building",  label: "Building",       desc: "Academic or admin block", color: "#547792", icon: "🏛"  },
  { value: "entrance",  label: "Campus Entrance", desc: "Gate or access point",    color: "#FAB95B", icon: "🚪" },
  { value: "parking",   label: "Parking",         desc: "Vehicle parking area",    color: "#6366f1", icon: "🅿"  },
  { value: "landmark",  label: "Landmark",        desc: "Notable campus feature",  color: "#10b981", icon: "📍" },
  { value: "emergency", label: "Emergency",       desc: "Medical, fire, security", color: "#e74c3c", icon: "🚨" },
  { value: "other",     label: "Other",           desc: "General outdoor point",   color: "#9ca3af", icon: "📌" },
];

function typeInfo(v: LocationType) { return LOCATION_TYPES.find((t) => t.value === v)!; }

/* ─── Pin icon ───────────────────────────────────────────────────────────── */

function makePinIcon(color: string, emoji: string, small = false) {
  const w = small ? 24 : 36, h = small ? 30 : 44, cx = small ? 12 : 18, cy = small ? 11 : 16, r = small ? 4.5 : 7;
  return L.divIcon({
    className: "",
    iconAnchor: [w / 2, h],
    iconSize: [w, h],
    html: `<div style="position:relative;width:${w}px;height:${h}px">
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <filter id="dsf"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000040"/></filter>
        <path d="M${cx} 2C${cx - 7.7} 2 ${cx - 14} ${cy - 7.7} ${cx - 14} ${cy}
          c0 ${cy - 3} ${cx - 3} ${h - cy - 5} ${cx - 14} ${h - cy - 5}
          S${w - 2} ${cy + cy - 3} ${w - 2} ${cy}C${w - 2} ${cy - 7.7} ${cx + 7.7} 2 ${cx} 2z"
          fill="${color}" filter="url(#dsf)"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="white" opacity="0.95"/>
      </svg>
      <div style="position:absolute;top:${small ? 4 : 7}px;left:50%;transform:translateX(-50%);
        font-size:${small ? 8 : 11}px;line-height:1">${emoji}</div>
    </div>`,
  });
}

/* ─── Step dots ──────────────────────────────────────────────────────────── */

function Steps({ step }: { step: number }) {
  return (
    <div className="flex items-center">
      {["Pin", "Details", "Review"].map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px]
              font-black border-2 transition-all duration-300 flex-shrink-0
              ${step > i + 1 ? "bg-emerald-500 border-emerald-500 text-white"
               : step === i + 1 ? "bg-zinc-800 border-zinc-800 text-white scale-110"
               : "bg-white border-zinc-200 text-zinc-400"}`}
            >
              {step > i + 1 ? <CheckCircle2 size={13} /> : i + 1}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest whitespace-nowrap
              ${step === i + 1 ? "text-zinc-800" : step > i + 1 ? "text-emerald-600" : "text-zinc-300"}`}>
              {label}
            </span>
          </div>
          {i < 2 && (
            <div className={`w-10 h-0.5 mb-4 mx-1.5 rounded transition-colors duration-500
              ${step > i + 1 ? "bg-emerald-400" : "bg-zinc-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Field ──────────────────────────────────────────────────────────────── */

function Field({ label, icon, required, children }: {
  label: string; icon: React.ReactNode; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
        <span className="text-zinc-400">{icon}</span>{label}
        {required && <span className="text-amber-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = `w-full bg-white border border-zinc-200 text-zinc-800 text-xs font-medium
  rounded-lg px-3 py-2.5 shadow-sm placeholder:text-zinc-300
  focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-all`;

/* ─── Saved location card ────────────────────────────────────────────────── */

function SavedCard({
  loc, onDelete, onFlyTo,
}: { loc: SavedLocation; onDelete: (id: number) => void; onFlyTo: (loc: SavedLocation) => void }) {
  const t = typeInfo(loc.locType);
  return (
    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden
      hover:shadow-md hover:border-zinc-200 transition-all group">
      {/* Color bar */}
      <div className="h-1 w-full" style={{ background: t.color }} />

      <div className="p-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg leading-none flex-shrink-0">{t.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-800 truncate">{loc.name}</p>
              {loc.shortCode && (
                <span className="text-[9px] font-black text-zinc-400 bg-zinc-100
                  px-1.5 py-0.5 rounded tracking-wider">{loc.shortCode}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onFlyTo(loc)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all"
              title="Fly to">
              <ExternalLink size={11} />
            </button>
            <button onClick={() => onDelete(loc.id)}
              className="p-1 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all"
              title="Delete">
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {/* Type + navigable */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full capitalize"
            style={{ background: t.color + "18", color: t.color, border: `1px solid ${t.color}40` }}>
            {t.label}
          </span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border
            ${loc.navigable
              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
              : "bg-zinc-100 text-zinc-400 border-zinc-200"}`}>
            {loc.navigable ? "Navigable" : "Non-nav"}
          </span>
        </div>

        {/* Coordinates */}
        <div className="flex items-center gap-1.5 bg-zinc-50 rounded-lg px-2.5 py-1.5 mb-2">
          <MapPin size={9} className="text-zinc-400 flex-shrink-0" />
          <p className="text-[10px] font-mono text-zinc-600">
            {loc.point.lat.toFixed(6)}, {loc.point.lng.toFixed(6)}
          </p>
        </div>

        {/* Description */}
        {loc.description && (
          <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-2 mb-2">
            {loc.description}
          </p>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-1 text-[9px] text-zinc-300">
          <Clock size={8} />
          <span>{loc.savedAt}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Saved panel (slide-in over map) ───────────────────────────────────── */

function SavedPanel({
  locations, onDelete, onFlyTo, onClose,
}: {
  locations: SavedLocation[];
  onDelete: (id: number) => void;
  onFlyTo: (loc: SavedLocation) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-0 left-0 bottom-0 z-[1002] w-72
      bg-white/98 backdrop-blur-sm border-r border-zinc-200 shadow-2xl
      flex flex-col animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <List size={14} className="text-zinc-400" />
          <span className="text-xs font-black text-zinc-700 uppercase tracking-widest">
            Saved Locations
          </span>
          <span className="bg-zinc-100 text-zinc-500 text-[10px] font-bold
            px-2 py-0.5 rounded-full">{locations.length}</span>
        </div>
        <button onClick={onClose}
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all">
          <X size={14} />
        </button>
      </div>

      {/* Stats strip */}
      <div className="flex border-b border-zinc-100">
        {[
          { label: "Buildings",  val: locations.filter(l => l.locType === "building").length,  color: "#547792" },
          { label: "Entrances",  val: locations.filter(l => l.locType === "entrance").length,  color: "#FAB95B" },
          { label: "Others",     val: locations.filter(l => !["building","entrance"].includes(l.locType)).length, color: "#9ca3af" },
        ].map(({ label, val, color }) => (
          <div key={label} className="flex-1 flex flex-col items-center py-2.5 border-r last:border-r-0 border-zinc-100">
            <span className="text-base font-black" style={{ color }}>{val}</span>
            <span className="text-[8px] text-zinc-400 uppercase tracking-widest">{label}</span>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <MapPin size={24} className="text-zinc-200" />
            <p className="text-xs text-zinc-400">No locations saved yet</p>
          </div>
        ) : (
          locations.map((loc) => (
            <SavedCard key={loc.id} loc={loc} onDelete={onDelete} onFlyTo={onFlyTo} />
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Toast ──────────────────────────────────────────────────────────────── */

function Toast({ loc, onClose }: { loc: SavedLocation; onClose: () => void }) {
  const t = typeInfo(loc.locType);
  useEffect(() => { const id = setTimeout(onClose, 3500); return () => clearTimeout(id); }, []);
  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[1003]
      bg-white rounded-2xl shadow-2xl border border-zinc-100 px-4 py-3
      flex items-center gap-3 min-w-[260px] pointer-events-none">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: t.color + "18", border: `1px solid ${t.color}30` }}>
        {t.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <CheckCircle2 size={11} className="text-emerald-500 flex-shrink-0" />
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Saved</p>
        </div>
        <p className="text-xs font-bold text-zinc-800 truncate">{loc.name}</p>
        <p className="text-[10px] font-mono text-zinc-400">
          {loc.point.lat.toFixed(5)}, {loc.point.lng.toFixed(5)}
        </p>
      </div>
      <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: t.color }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function AddLocation() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef    = useRef<L.Map | null>(null);
  const pinRef    = useRef<L.Marker | null>(null);
  const savedMarkersRef = useRef<Map<number, L.Marker>>(new Map());

  const [step,           setStep]          = useState(1);
  const [picking,        setPicking]       = useState(false);
  const [pickedPoint,    setPickedPoint]   = useState<PickedPoint | null>(null);
  const [hoverCoords,    setHoverCoords]   = useState<PickedPoint | null>(null);
  const [toast,          setToast]         = useState<SavedLocation | null>(null);
  const [showSaved,      setShowSaved]     = useState(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(SEED_LOCATIONS);
  const [errors,         setErrors]        = useState<Partial<Record<"name" | "point", string>>>({});
  const [form, setForm] = useState<FormState>({
    name: "", shortCode: "", locType: "building", description: "", navigable: true,
  });

  const currentType = typeInfo(form.locType);

  // ── Build map ───────────────────────────────────────────────────
  useEffect(() => {
    const el = mapDivRef.current;
    if (!el) return;
    if (mapRef.current) { mapRef.current.off(); mapRef.current.remove(); mapRef.current = null; }
    (el as any)._leaflet_id = undefined;

    const map = L.map(el, { zoomControl: false }).setView(MAP_CENTER, 17);
    mapRef.current = map;
    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 22, attribution: "© OpenStreetMap",
    }).addTo(map);

    map.on("mousemove", (e: L.LeafletMouseEvent) =>
      setHoverCoords({ lat: e.latlng.lat, lng: e.latlng.lng })
    );
    map.on("mouseout", () => setHoverCoords(null));

    // Place seed markers
    SEED_LOCATIONS.forEach((loc) => placeSavedMarker(map, loc));

    return () => { map.off(); map.remove(); mapRef.current = null; (el as any)._leaflet_id = undefined; };
  }, []);

  // ── Click to pick ───────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const el = mapDivRef.current;
    if (el) el.style.cursor = picking ? "crosshair" : "";
    map.off("click");
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (!picking) return;
      placeNewPin(map, e.latlng.lat, e.latlng.lng);
      setPicking(false);
      setErrors((p) => ({ ...p, point: undefined }));
    });
  }, [picking]);

  // ── Update new pin icon when type changes ───────────────────────
  useEffect(() => {
    if (pinRef.current) pinRef.current.setIcon(makePinIcon(currentType.color, currentType.icon));
  }, [form.locType]);

  function placeSavedMarker(map: L.Map, loc: SavedLocation) {
    const t = typeInfo(loc.locType);
    const m = L.marker([loc.point.lat, loc.point.lng], {
      icon: makePinIcon(t.color, t.icon, true),
      zIndexOffset: 500,
    }).addTo(map);
    m.bindTooltip(`<b>${loc.name}</b><br/><span style="font-size:10px;color:#64748b">${t.label}</span>`, {
      className: "leaflet-custom-tooltip", direction: "top", offset: [0, -28],
    });
    savedMarkersRef.current.set(loc.id, m);
  }

  function placeNewPin(map: L.Map, lat: number, lng: number) {
    setPickedPoint({ lat, lng });
    if (pinRef.current) {
      pinRef.current.setLatLng([lat, lng]);
    } else {
      pinRef.current = L.marker([lat, lng], {
        icon: makePinIcon(currentType.color, currentType.icon),
        draggable: true, zIndexOffset: 1000,
      }).addTo(map);
      pinRef.current.on("dragend", (ev: any) => {
        const p = ev.target.getLatLng();
        setPickedPoint({ lat: p.lat, lng: p.lng });
      });
    }
    map.panTo([lat, lng], { animate: true, duration: 0.4 });
  }

  function clearNewPin() {
    if (pinRef.current && mapRef.current) { mapRef.current.removeLayer(pinRef.current); pinRef.current = null; }
    setPickedPoint(null); setPicking(false);
  }

  function handleDelete(id: number) {
    const m = savedMarkersRef.current.get(id);
    if (m && mapRef.current) { mapRef.current.removeLayer(m); savedMarkersRef.current.delete(id); }
    setSavedLocations((prev) => prev.filter((l) => l.id !== id));
  }

  function handleFlyTo(loc: SavedLocation) {
    mapRef.current?.flyTo([loc.point.lat, loc.point.lng], 19, { duration: 1 });
    setShowSaved(false);
  }

  function validate() {
    const e: typeof errors = {};
    if (!pickedPoint)      e.point = "Place a pin on the map first.";
    if (!form.name.trim()) e.name  = "Name is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const newLoc: SavedLocation = {
      ...form, id: Date.now(), point: pickedPoint!,
      savedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    setSavedLocations((prev) => [newLoc, ...prev]);
    if (mapRef.current) placeSavedMarker(mapRef.current, newLoc);
    setToast(newLoc);
    clearNewPin();
    setStep(1);
    setForm({ name: "", shortCode: "", locType: "building", description: "", navigable: true });
    setErrors({});
  }

  function setF<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  }

  /* ─── Render ──────────────────────────────────────────────────── */
  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div className="flex flex-col gap-4 h-full font-sans">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-bold text-zinc-800 tracking-tight">Add Outdoor Location</h1>
            </div>
            <p className="text-xs text-zinc-400">Drop a pin on the campus map and fill in the details.</p>
          </div>
          <Steps step={step} />
        </div>

        {/* Main */}
        <div className="flex gap-4 flex-1 min-h-0" style={{ height: 580 }}>

          {/* Map */}
          <div className="relative flex-1 rounded-2xl overflow-hidden shadow-md border border-zinc-200 bg-zinc-50">
            <div ref={mapDivRef} className="w-full h-full" />

            {/* Saved panel */}
            {showSaved && (
              <SavedPanel
                locations={savedLocations}
                onDelete={handleDelete}
                onFlyTo={handleFlyTo}
                onClose={() => setShowSaved(false)}
              />
            )}

            {/* Picking banner */}
            {picking && (
              <div className="absolute inset-x-0 top-4 flex justify-center z-[1001] pointer-events-none">
                <div className="bg-zinc-900/90 backdrop-blur-sm text-white text-xs font-semibold
                  px-5 py-2.5 rounded-full shadow-xl flex items-center gap-3 pointer-events-auto">
                  <MousePointer2 size={13} className="text-amber-400 animate-bounce" />
                  Click anywhere to drop a pin
                  <button onClick={() => setPicking(false)} className="ml-1 text-zinc-400 hover:text-white">
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* Saved count button */}
            <button
              onClick={() => setShowSaved((p) => !p)}
              className={`absolute top-3 left-3 z-[1000] flex items-center gap-2 px-3 py-1.5
                rounded-lg border shadow text-xs font-bold transition-all
                ${showSaved
                  ? "bg-zinc-800 border-zinc-800 text-white"
                  : "bg-white/95 backdrop-blur-sm border-zinc-100 text-zinc-700 hover:border-zinc-300"}`}
            >
              <List size={12} />
              {savedLocations.length} saved
            </button>

            {/* Coordinate bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]
              flex items-center gap-3 pointer-events-none">
              <div className="bg-zinc-900/80 backdrop-blur-sm text-white rounded-lg px-3 py-2 min-w-[158px] text-center">
                <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Cursor</p>
                <p className="text-[11px] font-mono leading-relaxed">
                  {hoverCoords
                    ? <>{hoverCoords.lat.toFixed(6)}<br />{hoverCoords.lng.toFixed(6)}</>
                    : <span className="text-zinc-500">hover map</span>}
                </p>
              </div>
              <div className="text-zinc-500 text-xs font-bold">→</div>
              <div className={`backdrop-blur-sm rounded-lg px-3 py-2 min-w-[158px] text-center
                border transition-all
                ${pickedPoint ? "bg-white/95 border-zinc-200 shadow-md" : "bg-zinc-800/70 border-zinc-700"}`}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <MapPin size={9} className={pickedPoint ? "text-[#547792]" : "text-zinc-500"} />
                  <p className={`text-[8px] font-bold uppercase tracking-widest
                    ${pickedPoint ? "text-zinc-400" : "text-zinc-500"}`}>Pinned</p>
                  {pickedPoint && (
                    <button onClick={clearNewPin}
                      className="pointer-events-auto ml-1 text-zinc-300 hover:text-red-400 transition-colors">
                      <X size={9} />
                    </button>
                  )}
                </div>
                <p className={`text-[11px] font-mono leading-relaxed
                  ${pickedPoint ? "text-zinc-800" : "text-zinc-500"}`}>
                  {pickedPoint
                    ? <>{pickedPoint.lat.toFixed(6)}<br />{pickedPoint.lng.toFixed(6)}</>
                    : "no pin placed"}
                </p>
              </div>
            </div>

            {/* Toast */}
            {toast && <Toast loc={toast} onClose={() => setToast(null)} />}
          </div>

          {/* Side Panel */}
          <div className="w-80 flex flex-col rounded-2xl overflow-hidden shadow-md border border-zinc-200 bg-zinc-50">
            <div className="bg-white border-b border-zinc-100 px-4 py-3.5">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">
                {step === 1 ? "Step 1 · Place Pin" : step === 2 ? "Step 2 · Details" : "Step 3 · Review & Save"}
              </p>
              <p className="text-sm font-bold text-zinc-800">
                {step === 1 ? "Choose type and click the map"
                : step === 2 ? "Describe this location"
                : "Confirm and save"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-4">
                  <Field label="Location Type" icon={<Tag size={11} />} required>
                    <div className="space-y-1.5">
                      {LOCATION_TYPES.map((t) => (
                        <button key={t.value} onClick={() => setF("locType", t.value)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border
                            text-left transition-all
                            ${form.locType === t.value
                              ? "border-zinc-800 bg-zinc-800 text-white shadow-sm"
                              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"}`}
                        >
                          <span className="text-base leading-none w-5 text-center flex-shrink-0">{t.icon}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold">{t.label}</p>
                            <p className="text-[10px] mt-0.5 text-zinc-400 truncate">{t.desc}</p>
                          </div>
                          <span className="w-2 h-2 rounded-full ml-auto flex-shrink-0"
                            style={{ background: t.color }} />
                        </button>
                      ))}
                    </div>
                  </Field>

                  <div className={`rounded-xl border-2 p-4 text-center transition-all
                    ${pickedPoint ? "border-emerald-300 bg-emerald-50"
                    : picking ? "border-amber-300 bg-amber-50"
                    : "border-dashed border-zinc-200 bg-white"}`}>
                    {pickedPoint ? (
                      <>
                        <div className="text-2xl mb-1">{currentType.icon}</div>
                        <p className="text-xs font-bold text-emerald-700 mb-1">Pin placed!</p>
                        <p className="text-[10px] font-mono text-emerald-600 leading-relaxed">
                          {pickedPoint.lat.toFixed(6)}<br />{pickedPoint.lng.toFixed(6)}
                        </p>
                        <p className="text-[9px] text-emerald-500 mt-1.5">Drag pin to adjust</p>
                      </>
                    ) : picking ? (
                      <><MousePointer2 size={22} className="text-amber-500 mx-auto mb-2" />
                        <p className="text-xs font-bold text-amber-700">Click on the map</p></>
                    ) : (
                      <><Navigation size={22} className="text-zinc-300 mx-auto mb-2" />
                        <p className="text-xs font-medium text-zinc-500">No pin placed yet</p></>
                    )}
                  </div>

                  {errors.point && (
                    <div className="flex items-center gap-2 text-[10px] text-red-500
                      bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <AlertCircle size={11} /> {errors.point}
                    </div>
                  )}

                  <button onClick={() => setPicking((p) => !p)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                      text-xs font-bold border-2 transition-all
                      ${picking ? "border-amber-400 bg-amber-400 text-white"
                      : pickedPoint ? "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                      : "border-zinc-800 bg-zinc-800 text-white hover:bg-zinc-700"}`}>
                    {picking ? <><X size={13} />Cancel</>
                    : pickedPoint ? <><MousePointer2 size={13} />Move pin</>
                    : <><MousePointer2 size={13} />Place pin on map</>}
                  </button>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-4">
                  <Field label="Location Name" icon={<Tag size={11} />} required>
                    <input className={inputCls}
                      placeholder={
                        form.locType === "building" ? "e.g. Electronics Block" :
                        form.locType === "entrance" ? "e.g. Main Gate" :
                        form.locType === "parking"  ? "e.g. Staff Parking A" :
                        form.locType === "landmark" ? "e.g. Central Fountain" :
                        form.locType === "emergency"? "e.g. Medical Centre" : "Location name"
                      }
                      value={form.name} onChange={(e) => setF("name", e.target.value)} />
                    {errors.name && (
                      <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle size={10} /> {errors.name}
                      </p>
                    )}
                  </Field>
                  <Field label="Short Code" icon={<Hash size={11} />}>
                    <input className={inputCls} placeholder="e.g. ELHC, GATE-1"
                      value={form.shortCode}
                      onChange={(e) => setF("shortCode", e.target.value.toUpperCase())}
                      maxLength={10} />
                    <p className="text-[9px] text-zinc-400 mt-1 pl-1">Optional abbreviation for navigation</p>
                  </Field>
                  <Field label="Description" icon={<Building2 size={11} />}>
                    <textarea className={`${inputCls} resize-none h-20`}
                      placeholder="Brief notes about this location…"
                      value={form.description} onChange={(e) => setF("description", e.target.value)} />
                  </Field>
                  <Field label="Navigable" icon={<Navigation size={11} />}>
                    <button onClick={() => setF("navigable", !form.navigable)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border
                        text-xs font-bold transition-all
                        ${form.navigable
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-zinc-50 border-zinc-200 text-zinc-500"}`}>
                      <span className={`w-2 h-2 rounded-full ${form.navigable ? "bg-emerald-500" : "bg-zinc-300"}`} />
                      {form.navigable ? "Navigable — included in routing" : "Not navigable"}
                    </button>
                  </Field>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="space-y-3">
                  <div className="bg-white border border-zinc-100 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-zinc-100">
                      <span className="text-2xl">{currentType.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-zinc-800">{form.name}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{currentType.label}</p>
                      </div>
                      {form.shortCode && (
                        <span className="ml-auto text-[10px] font-black text-zinc-500
                          bg-zinc-100 px-2 py-0.5 rounded-md tracking-wider">{form.shortCode}</span>
                      )}
                    </div>
                    <div className="space-y-2 text-[11px]">
                      {([
                        ["Navigable", form.navigable ? "Yes" : "No"],
                        ["Latitude",  pickedPoint?.lat.toFixed(7) ?? "—"],
                        ["Longitude", pickedPoint?.lng.toFixed(7) ?? "—"],
                        ...(form.description ? [["Notes", form.description]] : []),
                      ] as [string, string][]).map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4">
                          <span className="text-zinc-400 font-medium flex-shrink-0">{k}</span>
                          <span className="font-semibold text-zinc-700 text-right break-words max-w-[160px]">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setStep(2)}
                    className="w-full text-[10px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors py-1">
                    ← Edit details
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-zinc-100 p-4">
              <div className="flex gap-2">
                {step > 1 && (
                  <button onClick={() => setStep((s) => s - 1)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-zinc-200
                      text-zinc-600 hover:bg-zinc-50 transition-all">Back</button>
                )}
                {step < 3 ? (
                  <button onClick={() => {
                    if (step === 1 && !pickedPoint) { setErrors((p) => ({ ...p, point: "Place a pin on the map first." })); return; }
                    if (step === 2 && !form.name.trim()) { setErrors((p) => ({ ...p, name: "Name is required." })); return; }
                    setStep((s) => s + 1);
                  }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                      text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-all shadow-sm">
                    Next <ChevronRight size={13} />
                  </button>
                ) : (
                  <button onClick={handleSubmit}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                      text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm">
                    <Save size={13} /> Save Location
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}