import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  MapPin, Building2, Layers, Tag, Hash, Save,
  CheckCircle2, ChevronRight, MousePointer2, X, AlertCircle,
} from "lucide-react";

import {
  BUILDINGS_DATA,
  getBuilding,
  getFloorData,
  getBuildingOutline,
  type FloorData,
} from "../data/Mapdata";
import { SelectBox } from "../components/floormap/ui";
import { GLOBAL_STYLES, MAP_CENTER, MAP_ZOOM } from "../components/floormap/constants";
import { createMap, addOutline, addUnits, renderPaths } from "../components/floormap/mapRenderer";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type LocationType = "poi" | "unit" | "path_node";
type PoiCategory  = "entry" | "rentry" | "toilet" | "stairs" | "other";
type UnitCategory = "classroom" | "lab" | "office" | "toilet" | "storage" | "other";

interface PickedPoint {
  lat: number;
  lng: number;
}

interface FormState {
  name:       string;
  roomNo:     string;
  locType:    LocationType;
  poiCat:     PoiCategory;
  unitCat:    UnitCategory;
  navigable:  boolean;
}

/* ─── Constants ─────────────────────────────────────────────────────────── */

const LOCATION_TYPES: { value: LocationType; label: string; desc: string }[] = [
  { value: "poi",       label: "Point of Interest", desc: "Entry, exit, or landmark" },
  { value: "unit",      label: "Room / Unit",        desc: "Classrooms, labs, toilets" },
  { value: "path_node", label: "Path Node",          desc: "Navigation waypoint" },
];

const POI_CATEGORIES:  { value: PoiCategory;  label: string }[] = [
  { value: "entry",   label: "Building Entry" },
  { value: "rentry",  label: "Room Entry"     },
  { value: "toilet",  label: "Toilet"         },
  { value: "stairs",  label: "Stairs"         },
  { value: "other",   label: "Other"          },
];

const UNIT_CATEGORIES: { value: UnitCategory; label: string }[] = [
  { value: "classroom", label: "Classroom" },
  { value: "lab",       label: "Lab"       },
  { value: "office",    label: "Office"    },
  { value: "toilet",    label: "Toilet"    },
  { value: "storage",   label: "Storage"   },
  { value: "other",     label: "Other"     },
];

/* ─── Pin marker ─────────────────────────────────────────────────────────── */

function makePinIcon(color: string) {
  return L.divIcon({
    className: "",
    iconAnchor: [14, 36],
    html: `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
      <filter id="ds" x="-30%" y="-10%" width="160%" height="150%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000033"/>
      </filter>
      <path d="M14 2C7.93 2 3 6.93 3 13c0 8.25 11 23 11 23s11-14.75 11-23c0-6.07-4.93-11-11-11z"
        fill="${color}" filter="url(#ds)"/>
      <circle cx="14" cy="13" r="5" fill="white" opacity="0.9"/>
    </svg>`,
  });
}

const PIN_COLORS: Record<LocationType, string> = {
  poi:       "#FAB95B",
  unit:      "#547792",
  path_node: "#e74c3c",
};

/* ─── Step indicator ─────────────────────────────────────────────────────── */

function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-all duration-300
      ${done   ? "bg-emerald-500 border-emerald-500 text-white"
       : active ? "bg-zinc-800 border-zinc-800 text-white scale-110"
       :          "bg-white border-zinc-200 text-zinc-400"}`}
    >
      {done ? <CheckCircle2 size={13} /> : n}
    </div>
  );
}

function Steps({ step }: { step: number }) {
  const labels = ["Building", "Pin", "Details", "Review"];
  return (
    <div className="flex items-center gap-0">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <StepDot n={i + 1} active={step === i + 1} done={step > i + 1} />
            <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors
              ${step === i + 1 ? "text-zinc-800" : step > i + 1 ? "text-emerald-600" : "text-zinc-300"}`}>
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div className={`w-10 h-0.5 mb-4 mx-1 transition-colors duration-500
              ${step > i + 1 ? "bg-emerald-400" : "bg-zinc-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Field wrapper ──────────────────────────────────────────────────────── */

function Field({ label, icon, required, children }: {
  label: string; icon: React.ReactNode; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
        <span className="text-zinc-400">{icon}</span>
        {label}
        {required && <span className="text-amber-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ─── Input / Textarea ───────────────────────────────────────────────────── */

const inputCls = `w-full bg-white border border-zinc-200 text-zinc-800 text-xs font-medium
  rounded-lg px-3 py-2.5 shadow-sm placeholder:text-zinc-300
  focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-400 transition-all`;

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function AddLocation() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef    = useRef<L.Map | null>(null);
  const pinRef    = useRef<L.Marker | null>(null);

  const buildings = BUILDINGS_DATA.map((b) => ({ id: b.id, name: b.name }));

  const [step,             setStep]            = useState(1);
  const [selectedBuilding, setSelectedBuilding] = useState(BUILDINGS_DATA[0]?.id ?? "");
  const [selectedFloor,    setSelectedFloor]    = useState("");
  const [picking,          setPicking]          = useState(false);
  const [pickedPoint,      setPickedPoint]      = useState<PickedPoint | null>(null);
  const [submitted,        setSubmitted]        = useState(false);
  const [errors,           setErrors]           = useState<Partial<Record<keyof FormState | "point", string>>>({});

  const [form, setForm] = useState<FormState>({
    name:      "",
    roomNo:    "",
    locType:   "poi",
    poiCat:    "entry",
    unitCat:   "classroom",
    navigable: true,
  });

  // Derived
  const currentBuilding = getBuilding(selectedBuilding);
  const buildingFloors  = currentBuilding?.floors ?? [];
  const currentFloor    = buildingFloors.find((f) => f.id === selectedFloor);
  const floorData: FloorData | undefined =
    currentFloor ? getFloorData(selectedBuilding, selectedFloor) : undefined;
  const outline = currentBuilding ? getBuildingOutline(selectedBuilding) : undefined;

  const pinColor = PIN_COLORS[form.locType];

  // ── Init floor on building change ───────────────────────────────
  useEffect(() => {
    const floors = getBuilding(selectedBuilding)?.floors ?? [];
    setSelectedFloor(floors[0]?.id ?? "");
    setPickedPoint(null);
    if (step > 1) setStep(1);
  }, [selectedBuilding]);

  // ── (Re)build map on floor change ───────────────────────────────
  useEffect(() => {
    const el = mapDivRef.current;
    if (!el) return;

    // Destroy any existing instance first (handles React StrictMode double-invoke)
    if (mapRef.current) {
      mapRef.current.off();
      mapRef.current.remove();
      mapRef.current = null;
    }
    pinRef.current = null;

    // Guard: if Leaflet already marked this container, clear it
    (el as any)._leaflet_id = undefined;

    const map = L.map(el, { zoomControl: false }).setView(MAP_CENTER, MAP_ZOOM);
    mapRef.current = map;
    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 22, attribution: "© OpenStreetMap",
    }).addTo(map);

    if (outline) addOutline(map, outline);

    if (floorData?.units) {
      addUnits(map, floorData.units, () => {});
    }
    if (floorData?.paths) {
      renderPaths(map, null, floorData.paths, {}, () => {});
    }

    // Fit to layers
    try {
      const pts: [number, number][] = [];
      map.eachLayer((l: any) => {
        if (l.getBounds) { const b = l.getBounds(); if (b.isValid()) pts.push(b.getNorthEast(), b.getSouthWest()); }
        else if (l.getLatLng) { const ll = l.getLatLng(); pts.push([ll.lat, ll.lng]); }
      });
      if (pts.length) map.fitBounds(pts as any, { padding: [30, 30] });
    } catch {}

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
      (el as any)._leaflet_id = undefined;
    };
  }, [selectedBuilding, selectedFloor]);

  // ── Click-to-pick ────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (!picking) return;

      const { lat, lng } = e.latlng;
      setPickedPoint({ lat, lng });
      setPicking(false);
      setErrors((prev) => ({ ...prev, point: undefined }));

      // Place / move pin
      if (pinRef.current) {
        pinRef.current.setLatLng([lat, lng]);
      } else {
        pinRef.current = L.marker([lat, lng], {
          icon: makePinIcon(pinColor),
          draggable: true,
          zIndexOffset: 1000,
        }).addTo(map);

        pinRef.current.on("dragend", (ev: any) => {
          const pos = ev.target.getLatLng();
          setPickedPoint({ lat: pos.lat, lng: pos.lng });
        });
      }
    };

    map.on("click", handleClick);
    return () => { map.off("click", handleClick); };
  }, [picking, pinColor]);

  // ── Update pin icon when type changes ───────────────────────────
  useEffect(() => {
    if (pinRef.current) {
      pinRef.current.setIcon(makePinIcon(pinColor));
    }
  }, [pinColor]);

  // ── Update cursor ────────────────────────────────────────────────
  useEffect(() => {
    const el = mapDivRef.current;
    if (!el) return;
    el.style.cursor = picking ? "crosshair" : "";
  }, [picking]);

  /* ── Validation ─────────────────────────────────────────────────── */
  function validate(): boolean {
    const e: typeof errors = {};
    if (!pickedPoint) e.point = "Click on the map to place a pin.";
    if (!form.name.trim()) e.name = "Name is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  /* ── Submit ─────────────────────────────────────────────────────── */
  function handleSubmit() {
    if (!validate()) return;
    // Here you'd POST to your Spring Boot API
    console.log("Submitting location:", {
      building:  selectedBuilding,
      floor:     selectedFloor,
      point:     pickedPoint,
      ...form,
    });
    setSubmitted(true);
  }

  /* ── Reset ──────────────────────────────────────────────────────── */
  function handleReset() {
    setSubmitted(false);
    setPickedPoint(null);
    setStep(1);
    setForm({ name: "", roomNo: "", locType: "poi", poiCat: "entry", unitCat: "classroom", navigable: true });
    setErrors({});
    if (pinRef.current && mapRef.current) {
      mapRef.current.removeLayer(pinRef.current);
      pinRef.current = null;
    }
  }

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  }

  /* ─── Success screen ──────────────────────────────────────────── */
  if (submitted) {
    return (
      <>
        <style>{GLOBAL_STYLES}</style>
        <div className="flex flex-col items-center justify-center h-full gap-6 font-sans">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
            <CheckCircle2 size={36} className="text-emerald-500" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-zinc-800 mb-1">Location Added</h2>
            <p className="text-sm text-zinc-400">
              <span className="font-semibold text-zinc-600">{form.name}</span> was saved
              to {currentBuilding?.name} · {currentFloor?.name}
            </p>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-5 py-4 text-xs text-zinc-600 space-y-1.5 min-w-[240px]">
            {[
              ["Type",       LOCATION_TYPES.find(t => t.value === form.locType)?.label],
              ["Category",   form.locType === "unit" ? form.unitCat : form.locType === "poi" ? form.poiCat : "—"],
              ["Room No.",   form.roomNo || "—"],
              ["Navigable",  form.navigable ? "Yes" : "No"],
              ["Latitude",   pickedPoint?.lat.toFixed(7)],
              ["Longitude",  pickedPoint?.lng.toFixed(7)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6">
                <span className="text-zinc-400 font-medium">{k}</span>
                <span className="font-semibold text-zinc-700 capitalize">{v}</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md"
          >
            <MapPin size={13} /> Add Another Location
          </button>
        </div>
      </>
    );
  }

  /* ─── Main layout ─────────────────────────────────────────────── */
  return (
    <>
      <style>{GLOBAL_STYLES}{`
        .add-loc-map { cursor: default; }
        .pick-active  { cursor: crosshair !important; }
        .pin-pulse::after {
          content: ''; position: absolute; inset: -6px; border-radius: 50%;
          border: 2px solid #FAB95B; animation: pulse 1.4s ease-out infinite;
        }
        @keyframes pulse {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(2); }
        }
      `}</style>

      <div className="flex flex-col gap-4 h-full font-sans">
        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 tracking-tight">Add Location</h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Pin a point on the map, fill in the details, and save.
            </p>
          </div>
          <Steps step={step} />
        </div>

        {/* ── Main ── */}
        <div className="flex gap-4 flex-1 min-h-0" style={{ height: 580 }}>

          {/* ── Map ── */}
          <div className="relative flex-1 rounded-2xl overflow-hidden shadow-md border border-zinc-200 bg-zinc-50">
            <div ref={mapDivRef} className="w-full h-full" />

            {/* Floor breadcrumb */}
            {currentFloor && (
              <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg border border-zinc-100 shadow px-3 py-1.5 pointer-events-none">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  {currentBuilding?.name} · Level {currentFloor.level} — {currentFloor.name}
                </p>
              </div>
            )}

            {/* Picking instructions overlay */}
            {picking && (
              <div className="absolute inset-x-0 top-14 flex justify-center z-[1001] pointer-events-none">
                <div className="bg-zinc-900/90 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2">
                  <MousePointer2 size={13} className="text-amber-400 animate-bounce" />
                  Click anywhere on the map to place your pin
                  <button
                    className="ml-2 pointer-events-auto text-zinc-400 hover:text-white transition-colors"
                    onClick={() => setPicking(false)}
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* Coordinate badge */}
            {pickedPoint && (
              <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl border border-zinc-100 shadow-lg px-3 py-2.5 pointer-events-none">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Pinned Location</p>
                <p className="text-[11px] font-mono text-zinc-700">
                  {pickedPoint.lat.toFixed(6)}, {pickedPoint.lng.toFixed(6)}
                </p>
                <button
                  className="pointer-events-auto mt-1.5 text-[9px] font-bold text-amber-500 hover:text-amber-700 flex items-center gap-1 transition-colors"
                  onClick={() => setPicking(true)}
                >
                  <MousePointer2 size={9} /> Repin
                </button>
              </div>
            )}
          </div>

          {/* ── Side Panel ── */}
          <div className="w-80 flex flex-col rounded-2xl overflow-hidden shadow-md border border-zinc-200 bg-zinc-50">

            {/* Panel header */}
            <div className="bg-white border-b border-zinc-100 px-4 py-3.5">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">
                {step === 1 ? "Step 1 · Building & Floor"
                : step === 2 ? "Step 2 · Place on Map"
                : step === 3 ? "Step 3 · Location Details"
                :              "Step 4 · Review & Save"}
              </p>
              <p className="text-sm font-bold text-zinc-800">
                {step === 1 ? "Choose where this location is"
                : step === 2 ? "Click the map to drop a pin"
                : step === 3 ? "Fill in the details"
                :              "Confirm and save"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {/* ── Step 1: Building & Floor ── */}
              {step === 1 && (
                <div className="space-y-4">
                  <Field label="Building" icon={<Building2 size={11} />} required>
                    <SelectBox value={selectedBuilding} onChange={setSelectedBuilding}>
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </SelectBox>
                    {currentBuilding && (
                      <p className="text-[10px] text-zinc-400 mt-1 pl-1">{currentBuilding.label}</p>
                    )}
                  </Field>

                  <Field label="Floor" icon={<Layers size={11} />} required>
                    {buildingFloors.length === 0 ? (
                      <p className="text-xs text-zinc-400 italic">No floors available</p>
                    ) : (
                      <>
                        <SelectBox value={selectedFloor} onChange={setSelectedFloor}>
                          {buildingFloors.map((f) => (
                            <option key={f.id} value={f.id}>Level {f.level} — {f.name}</option>
                          ))}
                        </SelectBox>
                        {buildingFloors.length > 1 && (
                          <div className="flex gap-1 mt-2">
                            {buildingFloors.map((f) => (
                              <button
                                key={f.id}
                                onClick={() => setSelectedFloor(f.id)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all
                                  ${selectedFloor === f.id
                                    ? "bg-zinc-800 text-white"
                                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                                  }`}
                              >
                                L{f.level}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </Field>

                  {/* Location type selector */}
                  <Field label="Location Type" icon={<Tag size={11} />} required>
                    <div className="space-y-1.5">
                      {LOCATION_TYPES.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => set("locType", t.value)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all
                            ${form.locType === t.value
                              ? "border-zinc-800 bg-zinc-800 text-white shadow-sm"
                              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                            }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: PIN_COLORS[t.value] }}
                          />
                          <div>
                            <p className="text-xs font-bold">{t.label}</p>
                            <p className={`text-[10px] mt-0.5 ${form.locType === t.value ? "text-zinc-400" : "text-zinc-400"}`}>
                              {t.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              )}

              {/* ── Step 2: Place pin ── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className={`rounded-xl border-2 p-4 text-center transition-all
                    ${pickedPoint
                      ? "border-emerald-300 bg-emerald-50"
                      : picking
                        ? "border-amber-300 bg-amber-50"
                        : "border-dashed border-zinc-200 bg-white"
                    }`}
                  >
                    {pickedPoint ? (
                      <>
                        <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-2" />
                        <p className="text-xs font-bold text-emerald-700 mb-1">Pin placed!</p>
                        <p className="text-[10px] font-mono text-emerald-600">
                          {pickedPoint.lat.toFixed(6)}<br />{pickedPoint.lng.toFixed(6)}
                        </p>
                        <p className="text-[9px] text-emerald-500 mt-1.5">Drag the pin to adjust</p>
                      </>
                    ) : picking ? (
                      <>
                        <MousePointer2 size={24} className="text-amber-500 mx-auto mb-2 animate-bounce" />
                        <p className="text-xs font-bold text-amber-700">Click on the map</p>
                        <p className="text-[10px] text-amber-600 mt-1">
                          Tap anywhere to drop your pin
                        </p>
                      </>
                    ) : (
                      <>
                        <MapPin size={24} className="text-zinc-300 mx-auto mb-2" />
                        <p className="text-xs font-medium text-zinc-500">No pin placed yet</p>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          Use the button below to start picking
                        </p>
                      </>
                    )}
                  </div>

                  {errors.point && (
                    <div className="flex items-center gap-2 text-[10px] text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <AlertCircle size={11} /> {errors.point}
                    </div>
                  )}

                  <button
                    onClick={() => setPicking((p) => !p)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border-2 transition-all
                      ${picking
                        ? "border-amber-400 bg-amber-400 text-white"
                        : pickedPoint
                          ? "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                          : "border-zinc-800 bg-zinc-800 text-white hover:bg-zinc-700"
                      }`}
                  >
                    {picking ? (
                      <><X size={13} /> Cancel picking</>
                    ) : pickedPoint ? (
                      <><MousePointer2 size={13} /> Move pin</>
                    ) : (
                      <><MousePointer2 size={13} /> Click to place pin</>
                    )}
                  </button>

                  {/* Pin color legend */}
                  <div className="bg-white border border-zinc-100 rounded-xl p-3">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                      Pin type
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: pinColor }} />
                      <span className="text-xs font-semibold text-zinc-600 capitalize">
                        {LOCATION_TYPES.find(t => t.value === form.locType)?.label}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 3: Details ── */}
              {step === 3 && (
                <div className="space-y-4">
                  <Field label="Name" icon={<Tag size={11} />} required>
                    <input
                      className={inputCls}
                      placeholder={form.locType === "unit" ? "e.g. ELHC 101" : "e.g. Main Entry"}
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                    {errors.name && (
                      <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle size={10} /> {errors.name}
                      </p>
                    )}
                  </Field>

                  {form.locType === "unit" && (
                    <Field label="Room Number" icon={<Hash size={11} />}>
                      <input
                        className={inputCls}
                        placeholder="e.g. 101"
                        value={form.roomNo}
                        onChange={(e) => set("roomNo", e.target.value)}
                      />
                    </Field>
                  )}

                  {form.locType === "poi" && (
                    <Field label="POI Category" icon={<Tag size={11} />} required>
                      <div className="grid grid-cols-2 gap-1.5">
                        {POI_CATEGORIES.map((c) => (
                          <button
                            key={c.value}
                            onClick={() => set("poiCat", c.value)}
                            className={`text-[10px] font-bold px-2 py-2 rounded-lg border transition-all
                              ${form.poiCat === c.value
                                ? "bg-zinc-800 border-zinc-800 text-white"
                                : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                              }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </Field>
                  )}

                  {form.locType === "unit" && (
                    <Field label="Room Category" icon={<Tag size={11} />} required>
                      <div className="grid grid-cols-2 gap-1.5">
                        {UNIT_CATEGORIES.map((c) => (
                          <button
                            key={c.value}
                            onClick={() => set("unitCat", c.value)}
                            className={`text-[10px] font-bold px-2 py-2 rounded-lg border transition-all
                              ${form.unitCat === c.value
                                ? "bg-zinc-800 border-zinc-800 text-white"
                                : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                              }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </Field>
                  )}

                  {form.locType !== "path_node" && (
                    <Field label="Navigable" icon={<MapPin size={11} />}>
                      <button
                        onClick={() => set("navigable", !form.navigable)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all
                          ${form.navigable
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-zinc-50 border-zinc-200 text-zinc-500"
                          }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${form.navigable ? "bg-emerald-500" : "bg-zinc-300"}`} />
                        {form.navigable ? "Navigable" : "Not navigable"}
                      </button>
                    </Field>
                  )}
                </div>
              )}

              {/* ── Step 4: Review ── */}
              {step === 4 && (
                <div className="space-y-3">
                  {/* Map pin preview */}
                  <div className="bg-white border border-zinc-100 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-3 h-3 rounded-full" style={{ background: pinColor }} />
                      <p className="text-sm font-bold text-zinc-800">{form.name || "—"}</p>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      {[
                        ["Building",   currentBuilding?.name],
                        ["Floor",      currentFloor?.name],
                        ["Type",       LOCATION_TYPES.find(t => t.value === form.locType)?.label],
                        ["Category",
                          form.locType === "unit" ? form.unitCat
                          : form.locType === "poi" ? form.poiCat : "—"],
                        ...(form.roomNo ? [["Room No.", form.roomNo]] : []),
                        ["Navigable",  form.navigable ? "Yes" : "No"],
                        ["Latitude",   pickedPoint?.lat.toFixed(7) ?? "—"],
                        ["Longitude",  pickedPoint?.lng.toFixed(7) ?? "—"],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4">
                          <span className="text-zinc-400 font-medium">{k}</span>
                          <span className="font-semibold text-zinc-700 capitalize text-right">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Edit shortcut */}
                  <button
                    onClick={() => setStep(3)}
                    className="w-full text-[10px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors py-1"
                  >
                    ← Edit details
                  </button>
                </div>
              )}
            </div>

            {/* ── Footer nav ── */}
            <div className="bg-white border-t border-zinc-100 p-4">
              <div className="flex gap-2">
                {step > 1 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all"
                  >
                    Back
                  </button>
                )}

                {step < 4 ? (
                  <button
                    onClick={() => {
                      if (step === 2 && !pickedPoint) {
                        setErrors((p) => ({ ...p, point: "Click on the map to place a pin." }));
                        return;
                      }
                      if (step === 3 && !form.name.trim()) {
                        setErrors((p) => ({ ...p, name: "Name is required." }));
                        return;
                      }
                      setStep((s) => s + 1);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold
                      bg-zinc-800 hover:bg-zinc-700 text-white transition-all shadow-sm"
                  >
                    Next <ChevronRight size={13} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold
                      bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
                  >
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