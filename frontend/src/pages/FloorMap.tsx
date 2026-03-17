import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MapPin } from "lucide-react";

import {
  BUILDINGS_DATA,
  getBuilding,
  getFloorData,
  getBuildingOutline,
  type FloorData,
  type GeoFeature,
} from "../data/Mapdata";
import type { ActiveTab, SelectedFeature } from "../components/floormap/types";
import { LEGEND_ITEMS, GLOBAL_STYLES } from "../components/floormap/constants";
import { SelectBox } from "../components/floormap/ui";
import { SelectedCard } from "../components/floormap/SelectedCard";
import { PathsTab, PoiTab, UnitsTab } from "../components/floormap/PanelTabs";
import {
  createMap,
  addOutline,
  addUnits,
  renderPoi,
  renderPaths,
  fitMapBounds,
} from "../components/floormap/mapRenderer";

/* ─── Helpers ─────────────────────────────────────────────────── */

/**
 * De-duplicate path features by id.
 * Multiple LineString segments can share one logical path id.
 */
function uniquePathFeatures(paths: FloorData["paths"] | null): GeoFeature[] {
  if (!paths) return [];
  const seen = new Set<number>();
  return paths.features.filter((f: GeoFeature) => {
    if (seen.has(f.properties.id)) return false;
    seen.add(f.properties.id);
    return true;
  });
}

/* ═══════════════════════════════════════════════════════════════ */
export default function FloorMap() {
  // ── DOM / map refs ──────────────────────────────────────────────
  const mapDivRef       = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<L.Map | null>(null);
  const pathLayerRef    = useRef<L.GeoJSON | null>(null);
  const poiLayerRef     = useRef<L.LayerGroup | null>(null);
  const selectedItemRef = useRef<HTMLDivElement | null>(null);

  // ── UI State — must be declared BEFORE the callback refs below ──
  const buildings = BUILDINGS_DATA.map((b) => ({ id: b.id, name: b.name }));
  const [selectedBuilding, setSelectedBuilding] = useState(BUILDINGS_DATA[0]?.id ?? "");
  const [selectedFloor,    setSelectedFloor]    = useState("");
  const [pathToggles,      setPathToggles]      = useState<Record<string, boolean>>({});
  const [poiStatus,        setPoiStatus]        = useState<Record<string, boolean>>({});
  const [activeTab,        setActiveTab]        = useState<ActiveTab>("paths");
  const [selectedFeature,  setSelectedFeature]  = useState<SelectedFeature | null>(null);

  // ── Stable callback refs (prevent stale closures in Leaflet events)
  const setSelectedFeatureRef = useRef<(f: SelectedFeature | null) => void>(setSelectedFeature);
  const setActiveTabRef       = useRef<(t: ActiveTab) => void>(setActiveTab);
  const poiStatusRef          = useRef<Record<string, boolean>>({});

  // ── Derived data ────────────────────────────────────────────────
  const currentBuilding = getBuilding(selectedBuilding);
  const buildingFloors  = currentBuilding?.floors ?? [];
  const currentFloor    = buildingFloors.find((f) => f.id === selectedFloor);
  const floorData: FloorData | undefined =
    currentFloor ? getFloorData(selectedBuilding, selectedFloor) : undefined;
  const outline = currentBuilding ? getBuildingOutline(selectedBuilding) : undefined;

  const paths = floorData?.paths ?? null;
  const poi   = floorData?.poi   ?? null;
  const units = floorData?.units ?? null;

  const pathFeatures = uniquePathFeatures(paths);
  const poiFeatures  = poi?.features   ?? [];
  const unitFeatures = units?.features ?? [];

  // ── Keep refs current ───────────────────────────────────────────
  useEffect(() => { setSelectedFeatureRef.current = setSelectedFeature; }, []);
  useEffect(() => { setActiveTabRef.current       = setActiveTab;       }, []);
  useEffect(() => { poiStatusRef.current          = poiStatus;          }, [poiStatus]);

  // ── Reset on building change ────────────────────────────────────
  useEffect(() => {
    const floors = getBuilding(selectedBuilding)?.floors ?? [];
    setSelectedFloor(floors[0]?.id ?? "");
    setPathToggles({});
    setPoiStatus({});
    setSelectedFeature(null);
  }, [selectedBuilding]);

  // ── Reset on floor change ───────────────────────────────────────
  useEffect(() => {
    setPathToggles({});
    setPoiStatus({});
    setSelectedFeature(null);
  }, [selectedFloor]);

  // ── Scroll selected panel item into view ────────────────────────
  useEffect(() => {
    selectedItemRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedFeature, activeTab]);

  // ── (Re)build map when floor data changes ───────────────────────
  useEffect(() => {
    if (!mapDivRef.current || !paths || !poi || !units) return;

    mapRef.current?.remove();
    pathLayerRef.current = null;
    poiLayerRef.current  = null;

    const map = createMap(mapDivRef.current);
    mapRef.current = map;

    if (outline) addOutline(map, outline);

    addUnits(map, units, (index: number) => {
      setSelectedFeatureRef.current({ kind: "unit", index });
      setActiveTabRef.current("units");
    });

    poiLayerRef.current = renderPoi(map, null, poi, poiStatusRef.current, (name: string) => {
      setSelectedFeatureRef.current({ kind: "poi", name });
      setActiveTabRef.current("poi");
    });

    pathLayerRef.current = renderPaths(map, null, paths, pathToggles, (id: string) => {
      setSelectedFeatureRef.current({ kind: "path", id });
      setActiveTabRef.current("paths");
    });

    fitMapBounds(map);
  }, [outline, paths, poi, units]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-render paths when toggles change ────────────────────────
  useEffect(() => {
    if (!mapRef.current || !paths) return;
    pathLayerRef.current = renderPaths(
      mapRef.current, pathLayerRef.current, paths, pathToggles,
      (id: string) => {
        setSelectedFeatureRef.current({ kind: "path", id });
        setActiveTabRef.current("paths");
      }
    );
  }, [pathToggles]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-render POI when status changes ──────────────────────────
  useEffect(() => {
    if (!mapRef.current || !poi) return;
    poiLayerRef.current = renderPoi(
      mapRef.current, poiLayerRef.current, poi, poiStatus,
      (name: string) => {
        setSelectedFeatureRef.current({ kind: "poi", name });
        setActiveTabRef.current("poi");
      }
    );
  }, [poiStatus, poi]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ─────────────────────────────────────────────────────
  const togglePath = (id: string) =>
    setPathToggles((prev) => ({ ...prev, [id]: prev[id] !== true }));

  const togglePoi = (name: string) =>
    setPoiStatus((prev) => ({ ...prev, [name]: prev[name] !== true }));

  const itemRef = (el: HTMLDivElement | null) => { selectedItemRef.current = el; };

  const hasData = !!(paths || poi || units);

  /* ─── Render ──────────────────────────────────────────────────── */
  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      <div className="flex flex-col gap-4 h-full font-sans">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 tracking-tight">Floor Layout</h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Hover over map elements to preview · click for details
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <SelectBox value={selectedBuilding} onChange={setSelectedBuilding}>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </SelectBox>

            {buildingFloors.length === 0 ? (
              <div className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-400 shadow-sm">
                No floors found
              </div>
            ) : (
              <SelectBox value={selectedFloor} onChange={setSelectedFloor}>
                {buildingFloors.map((f) => (
                  <option key={f.id} value={f.id}>Level {f.level} — {f.name}</option>
                ))}
              </SelectBox>
            )}

            {buildingFloors.length > 1 && (
              <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 shadow-sm">
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

            {hasData && (
              <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 shadow-sm">
                {paths && <LayerBadge label="Path" />}
                {poi   && <LayerBadge label="POI"  />}
                {units && <LayerBadge label="Units"/>}
              </div>
            )}
          </div>
        </div>

        {/* Main */}
        <div className="flex gap-4 flex-1 min-h-0" style={{ height: 580 }}>

          {/* Map */}
          <div className="relative flex-1 rounded-2xl overflow-hidden shadow-md border border-zinc-200 bg-zinc-50">
            {!hasData && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80">
                <MapPin size={28} className="text-zinc-300 mb-2" />
                <p className="text-xs text-zinc-400 font-medium">Select a floor to view</p>
              </div>
            )}

            <div ref={mapDivRef} className="w-full h-full" />

            {currentFloor && (
              <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg border border-zinc-100 shadow px-3 py-1.5 pointer-events-none">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  {currentBuilding?.name} · Level {currentFloor.level} — {currentFloor.name}
                </p>
              </div>
            )}

            <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl border border-zinc-100 shadow-lg p-3 space-y-1.5 pointer-events-none">
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Legend</p>
              {LEGEND_ITEMS.map(({ color, label, dash }) => (
                <div key={label} className="flex items-center gap-2">
                  <svg width="22" height="8" className="flex-shrink-0">
                    <line x1="0" y1="4" x2="22" y2="4" stroke={color} strokeWidth="2.5"
                      strokeDasharray={dash ? "4,3" : undefined} />
                  </svg>
                  <span className="text-[10px] text-zinc-600 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side panel */}
          {hasData && (
            <div className="w-72 flex flex-col rounded-2xl overflow-hidden shadow-md border border-zinc-200 bg-zinc-50">
              <div className="flex bg-white border-b border-zinc-100">
                {(["paths", "poi", "units"] as const)
                  .filter((key) =>
                    (key === "paths" && !!paths) ||
                    (key === "poi"   && !!poi)   ||
                    (key === "units" && !!units)
                  )
                  .map((key) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all
                        ${activeTab === key
                          ? "text-zinc-800 border-b-2 border-zinc-800 bg-white"
                          : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
                        }`}
                    >
                      {key}
                    </button>
                  ))}
              </div>

              <SelectedCard
                selectedFeature={selectedFeature}
                pathFeatures={pathFeatures}
                poiFeatures={poiFeatures}
                unitFeatures={unitFeatures}
                poiStatus={poiStatus}
                onClose={() => setSelectedFeature(null)}
              />

              <div className="flex-1 overflow-y-auto">
                {activeTab === "paths" && paths && (
                  <PathsTab
                    features={pathFeatures}
                    toggles={pathToggles}
                    onToggle={togglePath}
                    selectedFeature={selectedFeature}
                    itemRef={itemRef}
                  />
                )}
                {activeTab === "poi" && poi && (
                  <PoiTab
                    features={poiFeatures}
                    poiStatus={poiStatus}
                    onToggle={togglePoi}
                    selectedFeature={selectedFeature}
                    itemRef={itemRef}
                  />
                )}
                {activeTab === "units" && units && (
                  <UnitsTab
                    features={unitFeatures}
                    selectedFeature={selectedFeature}
                    itemRef={itemRef}
                  />
                )}
              </div>

              <div className="bg-white border-t border-zinc-100 px-4 py-2.5 flex items-center">
                {([
                  paths && { label: "Paths", val: pathFeatures.length },
                  poi   && { label: "POIs",  val: poiFeatures.length  },
                  units && { label: "Units", val: unitFeatures.length  },
                ] as Array<{ label: string; val: number } | false>)
                  .filter((x): x is { label: string; val: number } => Boolean(x))
                  .map(({ label, val }) => (
                    <div key={label} className="flex flex-col items-center flex-1">
                      <span className="text-sm font-bold text-zinc-700">{val}</span>
                      <span className="text-[9px] text-zinc-400 uppercase tracking-widest">{label}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function LayerBadge({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">
      {label}
    </span>
  );
}