// ─── Color Tokens ────────────────────────────────────────────────────────────
// No imports needed.

export const COLOR = {
  entry:    "#FAB95B",
  stairs:   "#e74c3c",
  corridor: "#547792",
  room:     "#547792",
  closed:   "#9ca3af",
} as const;

// ─── Map Config ──────────────────────────────────────────────────────────────

export const MAP_CENTER: [number, number] = [11.32258, 75.9337];
export const MAP_ZOOM    = 19;
export const MAP_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

// ─── Legend ──────────────────────────────────────────────────────────────────

export const LEGEND_ITEMS = [
  { color: COLOR.entry,    label: "Entry",      dash: false },
  { color: COLOR.corridor, label: "Corridor",   dash: false },
  { color: COLOR.stairs,   label: "Stairs",     dash: false },
  { color: COLOR.room,     label: "Room entry", dash: true  },
] as const;

// ─── Global CSS ───────────────────────────────────────────────────────────────

export const GLOBAL_STYLES = `
  .leaflet-custom-tooltip {
    background: #1e293b !important; color: #f8fafc !important; border: none !important;
    border-radius: 6px !important; font-size: 11px !important; font-weight: 600 !important;
    font-family: system-ui, sans-serif !important; padding: 4px 9px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,.25) !important; white-space: nowrap !important;
  }
  .leaflet-custom-tooltip::before { border-top-color: #1e293b !important; }
  .leaflet-custom-popup .leaflet-popup-content-wrapper {
    border-radius: 10px !important; box-shadow: 0 4px 20px rgba(0,0,0,.15) !important;
    border: 1px solid #e2e8f0 !important; padding: 0 !important;
  }
  .leaflet-custom-popup .leaflet-popup-content { margin: 12px 14px !important; }
  .leaflet-custom-popup .leaflet-popup-tip-container { margin-top: -1px !important; }
  .panel-item-selected { outline: 2px solid #F59E0B; outline-offset: -2px; }
`;
