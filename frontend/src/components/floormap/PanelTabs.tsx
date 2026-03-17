import { ToggleLeft, ToggleRight, Route, Navigation, DoorOpen, Lock, Unlock } from "lucide-react";
import type { GeoFeature } from "../data/Mapdata";
import type { SelectedFeature } from "./types";
import { SectionHeader } from "./ui";

// ─── Color constants (inlined — no cross-file import) ────────────────────────

const COLOR_ENTRY    = "#FAB95B";
const COLOR_CORRIDOR = "#547792";
const COLOR_STAIRS   = "#e74c3c";
const COLOR_CLOSED   = "#9ca3af";

// ─── Shared empty-state ───────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return <p className="text-xs text-zinc-400 text-center py-6">{message}</p>;
}

// ─── PathsTab ─────────────────────────────────────────────────────────────────

interface PathsTabProps {
  features: GeoFeature[];
  toggles: Record<string, boolean>;
  onToggle: (id: string) => void;
  selectedFeature: SelectedFeature | null;
  itemRef: (el: HTMLDivElement | null) => void;
}

export function PathsTab({ features, toggles, onToggle, selectedFeature, itemRef }: PathsTabProps) {
  return (
    <>
      <SectionHeader icon={<Route size={13} />} label="Navigation Paths" count={features.length} />
      <div className="p-3 space-y-1">
        {features.length === 0 ? (
          <EmptyState message="No paths defined" />
        ) : (
          features.map((f) => {
            const id  = String(f.properties.id);
            const on  = toggles[id] !== false;
            const typ = f.properties.type as string;
            const dot = typ === "entry" ? COLOR_ENTRY : typ === "stairs" ? COLOR_STAIRS : COLOR_CORRIDOR;
            const isSelected = selectedFeature?.kind === "path" && selectedFeature.id === id;

            return (
              <div
                key={id}
                ref={isSelected ? itemRef : undefined}
                onClick={() => onToggle(id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all cursor-pointer
                  ${on ? "bg-white shadow-sm border border-zinc-100" : "bg-zinc-50 opacity-50"}
                  ${isSelected ? "panel-item-selected" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dot }} />
                  <div>
                    <p className="text-xs font-semibold text-zinc-700">
                      Path {id}{f.properties.name ? ` · ${f.properties.name}` : ""}
                    </p>
                    <p className="text-[10px] text-zinc-400 capitalize mt-0.5">{typ}</p>
                  </div>
                </div>
                <span className="flex-shrink-0">
                  {on
                    ? <ToggleRight size={20} className="text-amber-400" />
                    : <ToggleLeft  size={20} className="text-zinc-300"  />
                  }
                </span>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

// ─── PoiTab ───────────────────────────────────────────────────────────────────

interface PoiTabProps {
  features: GeoFeature[];
  poiStatus: Record<string, boolean>;
  onToggle: (name: string) => void;
  selectedFeature: SelectedFeature | null;
  itemRef: (el: HTMLDivElement | null) => void;
}

export function PoiTab({ features, poiStatus, onToggle, selectedFeature, itemRef }: PoiTabProps) {
  return (
    <>
      <SectionHeader icon={<Navigation size={13} />} label="Points of Interest" count={features.length} />
      <div className="p-3 space-y-1">
        {features.length === 0 ? (
          <EmptyState message="No POIs defined" />
        ) : (
          features.map((f, i) => {
            const name   = f.properties.name as string;
            const typ    = f.properties.type as string;
            const isOpen = poiStatus[name] !== false;
            const color  = typ === "entry" ? COLOR_ENTRY : COLOR_CORRIDOR;
            const isSelected = selectedFeature?.kind === "poi" && selectedFeature.name === name;

            return (
              <div
                key={i}
                ref={isSelected ? itemRef : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white shadow-sm border transition-all
                  ${isSelected ? "border-amber-300 panel-item-selected" : "border-zinc-100"}`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: isOpen ? color : COLOR_CLOSED }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-700 truncate">{name}</p>
                  <p className="text-[10px] text-zinc-400 capitalize mt-0.5">{typ}</p>
                </div>
                <button
                  onClick={() => onToggle(name)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border transition-all
                    ${isOpen
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                      : "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                    }`}
                >
                  {isOpen ? <><Unlock size={9} /> Open</> : <><Lock size={9} /> Closed</>}
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

// ─── UnitsTab ─────────────────────────────────────────────────────────────────

interface UnitsTabProps {
  features: GeoFeature[];
  selectedFeature: SelectedFeature | null;
  itemRef: (el: HTMLDivElement | null) => void;
}

export function UnitsTab({ features, selectedFeature, itemRef }: UnitsTabProps) {
  return (
    <>
      <SectionHeader icon={<DoorOpen size={13} />} label="Room Units" count={features.length} />
      <div className="p-3 space-y-1">
        {features.length === 0 ? (
          <EmptyState message="No units defined" />
        ) : (
          features.map((f, i) => {
            const p = f.properties;
            const isSelected = selectedFeature?.kind === "unit" && selectedFeature.index === i;

            return (
              <div
                key={i}
                ref={isSelected ? itemRef : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white shadow-sm border transition-all
                  ${isSelected ? "border-amber-300 panel-item-selected" : "border-zinc-100"}`}
              >
                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-slate-500">{p.room_no ?? "–"}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-700 truncate">{p.name}</p>
                  <p className="text-[10px] text-zinc-400 capitalize mt-0.5">{p.category}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
