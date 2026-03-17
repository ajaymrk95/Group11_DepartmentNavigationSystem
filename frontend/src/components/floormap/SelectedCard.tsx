import { X, Unlock, Lock } from "lucide-react";
import type { GeoFeature } from "../data/Mapdata";
import type { SelectedFeature } from "./types";

// ─── Color constants (inlined — no cross-file import) ────────────────────────

const COLOR_ENTRY    = "#FAB95B";
const COLOR_STAIRS   = "#e74c3c";
const COLOR_CORRIDOR = "#547792";

// ─── Props ────────────────────────────────────────────────────────────────────

interface SelectedCardProps {
  selectedFeature: SelectedFeature | null;
  pathFeatures: GeoFeature[];
  poiFeatures: GeoFeature[];
  unitFeatures: GeoFeature[];
  poiStatus: Record<string, boolean>;
  onClose: () => void;
}

// ─── SelectedCard ─────────────────────────────────────────────────────────────

export function SelectedCard({
  selectedFeature,
  pathFeatures,
  poiFeatures,
  unitFeatures,
  poiStatus,
  onClose,
}: SelectedCardProps) {
  if (!selectedFeature) return null;

  let title    = "";
  let subtitle = "";
  let badge    = "";
  let dot      = COLOR_CORRIDOR;
  let extra: React.ReactNode = null;

  if (selectedFeature.kind === "path") {
    const f = pathFeatures.find((f) => String(f.properties.id) === selectedFeature.id);
    if (!f) return null;
    const { id, name, type } = f.properties;
    dot      = type === "entry" ? COLOR_ENTRY : type === "stairs" ? COLOR_STAIRS : COLOR_CORRIDOR;
    title    = `Path ${id}${name ? ` · ${name}` : ""}`;
    subtitle = "Navigation Path";
    badge    = type;

  } else if (selectedFeature.kind === "poi") {
    const f = poiFeatures.find((f) => f.properties.name === selectedFeature.name);
    if (!f) return null;
    const { name, type } = f.properties;
    const isOpen = poiStatus[name] !== false;
    dot      = type === "entry" ? COLOR_ENTRY : COLOR_CORRIDOR;
    title    = name;
    subtitle = "Point of Interest";
    badge    = type;
    extra = (
      <span
        className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border
          ${isOpen
            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
            : "bg-red-50 text-red-500 border-red-200"
          }`}
      >
        {isOpen ? <Unlock size={8} /> : <Lock size={8} />}
        {isOpen ? "Open" : "Closed"}
      </span>
    );

  } else {
    const f = unitFeatures[selectedFeature.index];
    if (!f) return null;
    const { name, category, room_no } = f.properties;
    title    = name;
    subtitle = category ?? "Room Unit";
    badge    = room_no ? `Room ${room_no}` : "–";
  }

  return (
    <div className="mx-3 mt-3 mb-1 rounded-xl border-2 border-amber-300 bg-amber-50 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-amber-100 border-b border-amber-200">
        <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Selected</span>
        <button onClick={onClose} className="text-amber-500 hover:text-amber-700 transition-colors">
          <X size={12} />
        </button>
      </div>
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dot }} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-zinc-800 truncate">{title}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full capitalize"
            style={{ background: `${dot}22`, color: dot, border: `1px solid ${dot}55` }}
          >
            {badge}
          </span>
          {extra}
        </div>
      </div>
    </div>
  );
}
