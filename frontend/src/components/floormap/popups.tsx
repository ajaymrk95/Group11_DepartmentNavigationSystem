import { COLOR } from "./constants";

// ─── Popup HTML Factories ────────────────────────────────────────────────────

export function roomPopup(p: Record<string, any>): string {
  return `
    <div style="font-family:system-ui,sans-serif;min-width:140px;padding:2px 0">
      <div style="font-weight:700;font-size:13px;color:#1a202c;margin-bottom:3px">${p.name}</div>
      ${p.room_no ? `<div style="font-size:11px;color:#64748b">Room <b>${p.room_no}</b></div>` : ""}
      <div style="font-size:11px;color:#64748b;text-transform:capitalize">${p.category ?? ""}</div>
    </div>`;
}

export function poiPopup(p: Record<string, any>, isOpen: boolean): string {
  const typeColor = p.type === "entry" ? COLOR.entry : COLOR.corridor;
  const statusBg  = isOpen ? "#dcfce7" : "#fee2e2";
  const statusClr = isOpen ? "#16a34a" : "#dc2626";
  const statusBdr = isOpen ? "#bbf7d0" : "#fecaca";

  return `
    <div style="font-family:system-ui,sans-serif;min-width:140px;padding:2px 0">
      <div style="font-weight:700;font-size:13px;color:#1a202c;margin-bottom:4px">${p.name}</div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:10px;background:${typeColor}22;color:${typeColor};
          border:1px solid ${typeColor}55;padding:1px 7px;border-radius:99px;
          font-weight:700;text-transform:capitalize">${p.type}</span>
        <span style="font-size:10px;font-weight:700;padding:1px 7px;border-radius:99px;
          background:${statusBg};color:${statusClr};border:1px solid ${statusBdr}">
          ${isOpen ? "Open" : "Closed"}
        </span>
      </div>
    </div>`;
}

export function pathPopup(p: Record<string, any>): string {
  const typeColor =
    p.type === "entry"  ? COLOR.entry  :
    p.type === "stairs" ? COLOR.stairs : COLOR.corridor;

  return `
    <div style="font-family:system-ui,sans-serif;min-width:120px;padding:2px 0">
      <div style="font-weight:700;font-size:12px;color:#1a202c;margin-bottom:3px">
        Path ${p.id}${p.name ? ` · ${p.name}` : ""}
      </div>
      <span style="font-size:10px;background:${typeColor}22;color:${typeColor};
        border:1px solid ${typeColor}55;padding:1px 7px;border-radius:99px;
        font-weight:700;text-transform:capitalize">${p.type}</span>
    </div>`;
}
