import L from "leaflet";
import type { GeoJSON } from "../data/Mapdata";

// ─── Color constants ──────────────────────────────────────────────────────────

const COLOR_ENTRY    = "#FAB95B";
const COLOR_STAIRS   = "#e74c3c";
const COLOR_CORRIDOR = "#547792";
const COLOR_CLOSED   = "#9ca3af";

function pathColor(type: string) {
  if (type === "entry")  return COLOR_ENTRY;
  if (type === "stairs") return COLOR_STAIRS;
  return COLOR_CORRIDOR;
}

function poiColor(type: string, isOpen: boolean) {
  if (!isOpen) return COLOR_CLOSED;
  return type === "entry" ? COLOR_ENTRY : COLOR_CORRIDOR;
}

// ─── Popup HTML factories ─────────────────────────────────────────────────────

function roomPopup(p: Record<string, any>): string {
  return `
    <div style="font-family:system-ui,sans-serif;min-width:140px;padding:2px 0">
      <div style="font-weight:700;font-size:13px;color:#1a202c;margin-bottom:3px">${p.name}</div>
      ${p.room_no ? `<div style="font-size:11px;color:#64748b">Room <b>${p.room_no}</b></div>` : ""}
      <div style="font-size:11px;color:#64748b;text-transform:capitalize">${p.category ?? ""}</div>
    </div>`;
}

function poiPopup(p: Record<string, any>, isOpen: boolean): string {
  const c   = p.type === "entry" ? COLOR_ENTRY : COLOR_CORRIDOR;
  const bg  = isOpen ? "#dcfce7" : "#fee2e2";
  const clr = isOpen ? "#16a34a" : "#dc2626";
  const bdr = isOpen ? "#bbf7d0" : "#fecaca";
  return `
    <div style="font-family:system-ui,sans-serif;min-width:140px;padding:2px 0">
      <div style="font-weight:700;font-size:13px;color:#1a202c;margin-bottom:4px">${p.name}</div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:10px;background:${c}22;color:${c};border:1px solid ${c}55;
          padding:1px 7px;border-radius:99px;font-weight:700;text-transform:capitalize">${p.type}</span>
        <span style="font-size:10px;font-weight:700;padding:1px 7px;border-radius:99px;
          background:${bg};color:${clr};border:1px solid ${bdr}">
          ${isOpen ? "Open" : "Closed"}
        </span>
      </div>
    </div>`;
}

function pathPopup(p: Record<string, any>): string {
  const c = pathColor(p.type);
  return `
    <div style="font-family:system-ui,sans-serif;min-width:120px;padding:2px 0">
      <div style="font-weight:700;font-size:12px;color:#1a202c;margin-bottom:3px">
        Path ${p.id}${p.name ? ` · ${p.name}` : ""}
      </div>
      <span style="font-size:10px;background:${c}22;color:${c};border:1px solid ${c}55;
        padding:1px 7px;border-radius:99px;font-weight:700;text-transform:capitalize">${p.type}</span>
    </div>`;
}

// ─── Shared tooltip options ───────────────────────────────────────────────────

const TOOLTIP_OPTS: L.TooltipOptions = {
  sticky: true,
  opacity: 1,
  className: "leaflet-custom-tooltip",
};

// ─── Map initialisation ───────────────────────────────────────────────────────

export function createMap(el: HTMLDivElement): L.Map {
  const map = L.map(el, { zoomControl: false }).setView([11.32258, 75.9337], 19);
  L.control.zoom({ position: "topright" }).addTo(map);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 22,
    attribution: "© OpenStreetMap",
  }).addTo(map);
  return map;
}

// ─── Outline layer ────────────────────────────────────────────────────────────

export function addOutline(map: L.Map, outline: any): void {
  L.geoJSON(outline, {
    style: {
      color: "#1A3263",
      weight: 2,
      fillColor: "#E8E2DB",
      fillOpacity: 0.35,
      interactive: false,
    },
  }).addTo(map);
}

// ─── Unit (room) layer ────────────────────────────────────────────────────────

export function addUnits(
  map: L.Map,
  units: GeoJSON,
  onUnitClick: (index: number) => void
): void {
  L.geoJSON(units as any, {
    style: {
      color: COLOR_CORRIDOR,
      weight: 1.5,
      fillColor: COLOR_CORRIDOR,
      fillOpacity: 0.12,
      className: "map-clickable",
    },
    onEachFeature: (f, layer) => {
      const p = f.properties;
      const label = p.room_no ? `${p.room_no} · ${p.name}` : p.name;

      layer.bindTooltip(label, { ...TOOLTIP_OPTS, direction: "top", offset: [0, -4] });
      layer.bindPopup(roomPopup(p), { maxWidth: 220, className: "leaflet-custom-popup" });

      layer.on("mouseover", function (this: any) { this.setStyle({ fillOpacity: 0.35, weight: 2.5 }); });
      layer.on("mouseout",  function (this: any) { this.setStyle({ fillOpacity: 0.12, weight: 1.5 }); });
      layer.on("click", () => {
        const idx = units.features.findIndex(
          (u) => u.properties.name === p.name && u.properties.room_no === p.room_no
        );
        onUnitClick(idx >= 0 ? idx : 0);
      });
    },
  }).addTo(map);
}

// ─── POI layer ────────────────────────────────────────────────────────────────

export function renderPoi(
  map: L.Map,
  existingLayer: L.LayerGroup | null,
  data: GeoJSON,
  status: Record<string, boolean>,
  onPoiClick: (name: string) => void
): L.LayerGroup {
  if (existingLayer) map.removeLayer(existingLayer);

  const group = L.layerGroup();

  data.features.forEach((f) => {
    const coords = f.geometry?.coordinates;
    if (!coords || coords.length < 2) return;

    const [lng, lat] = coords;
    const name   = f.properties.name as string;
    const typ    = f.properties.type as string;
    const isOpen = status[name] !== false;

    const marker = L.circleMarker([lat, lng], {
      radius: 7,
      fillColor: poiColor(typ, isOpen),
      color: "#fff",
      weight: 2,
      fillOpacity: 1,
      bubblingMouseEvents: false,
    });

    marker.bindTooltip(name, { ...TOOLTIP_OPTS, direction: "top", offset: [0, -8] });
    marker.bindPopup(poiPopup(f.properties, isOpen), { maxWidth: 220, className: "leaflet-custom-popup" });
    marker.on("mouseover", () => marker.setRadius(10));
    marker.on("mouseout",  () => marker.setRadius(7));
    marker.on("click",     () => onPoiClick(name));

    group.addLayer(marker);
  });

  group.addTo(map);
  return group;
}

// ─── Path layer ───────────────────────────────────────────────────────────────

export function renderPaths(
  map: L.Map,
  existingLayer: L.GeoJSON | null,
  data: GeoJSON,
  toggles: Record<string, boolean>,
  onPathClick: (id: string) => void
): L.GeoJSON {
  if (existingLayer) map.removeLayer(existingLayer);

  const visible = {
    ...data,
    features: data.features.filter((f) => toggles[String(f.properties.id)] !== false),
  };

  const layer = L.geoJSON(visible as any, {
    style: (f) => {
      const t = f?.properties?.type ?? "";
      return {
        color:     pathColor(t),
        weight:    t === "entry" ? 3 : 2,
        dashArray: t === "rentry" ? "5,5" : undefined,
        opacity:   0.9,
        cursor:    "pointer",
      };
    },
    onEachFeature: (f, l) => {
      const p   = f.properties;
      const typ = p.type as string;

      l.bindTooltip(`Path ${p.id}${p.name ? ` · ${p.name}` : ""} (${typ})`, {
        ...TOOLTIP_OPTS, direction: "top",
      });
      l.bindPopup(pathPopup(p), { maxWidth: 200, className: "leaflet-custom-popup" });

      l.on("mouseover", function (this: any) { this.setStyle({ weight: (this.options.weight ?? 2) + 2, opacity: 1 }); });
      l.on("mouseout",  function (this: any) { this.setStyle({ weight: typ === "entry" ? 3 : 2, opacity: 0.9 }); });
      l.on("click",     () => onPathClick(String(p.id)));
    },
  }).addTo(map);

  return layer;
}

// ─── Fit map to all layers ────────────────────────────────────────────────────

export function fitMapBounds(map: L.Map, padding = 30): void {
  try {
    const pts: [number, number][] = [];
    map.eachLayer((l: any) => {
      if (l.getBounds) {
        const b = l.getBounds();
        if (b.isValid()) pts.push(b.getNorthEast(), b.getSouthWest());
      } else if (l.getLatLng) {
        const ll = l.getLatLng();
        pts.push([ll.lat, ll.lng]);
      }
    });
    if (pts.length) map.fitBounds(pts as any, { padding: [padding, padding] });
  } catch { /* silent */ }
}
