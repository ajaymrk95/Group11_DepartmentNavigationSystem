"use client";
import React, { useEffect, useState } from "react";
import {
  DoorOpen, Pencil, Eye, Plus, X, Search,
  Loader2, Building2, Layers
} from "lucide-react";

const API = "http://localhost:8080/api/rooms";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Room {
  id: number;
  name: string;
  roomNo: string | null;
  category: string;
  floor: number;
  isAccessible: boolean;
  description: string | null;
  tags: string[];
  buildingId: number;
  buildingName: string;
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  page:        { fontFamily: "'Outfit', sans-serif", color: "#1A3263", padding: "32px 28px", width: "100%", boxSizing: "border-box" },
  hdr:         { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  hdrLeft:     { display: "flex", alignItems: "center", gap: 12 },
  h1:          { fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 },
  sub:         { fontSize: 13, color: "#547792", margin: "3px 0 0" },
  addBtn:      { display: "flex", alignItems: "center", gap: 8, background: "#1A3263", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" },
  filterBar:   { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" as const },
  searchWrap:  { display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #dde6f0", borderRadius: 10, padding: "8px 14px", flex: 1, minWidth: 200 },
  searchInput: { border: "none", outline: "none", fontSize: 14, color: "#1A3263", background: "transparent", width: "100%", fontFamily: "'Outfit', sans-serif" },
  select:      { background: "#fff", border: "1px solid #dde6f0", borderRadius: 10, padding: "8px 14px", fontSize: 14, color: "#1A3263", outline: "none", fontFamily: "'Outfit', sans-serif", cursor: "pointer" },
  statsRow:    { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" as const },
  statCard:    { background: "#fff", borderRadius: 12, padding: "14px 20px", boxShadow: "0 1px 4px rgba(26,50,99,.07)", display: "flex", flexDirection: "column" as const, gap: 2, minWidth: 120 },
  statNum:     { fontSize: 22, fontWeight: 700, color: "#1A3263" },
  statLabel:   { fontSize: 12, color: "#547792" },
  tableWrap:   { background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(26,50,99,.07)", overflow: "hidden" },
  table:       { width: "100%", borderCollapse: "collapse" as const, fontSize: 14 },
  th:          { textAlign: "left" as const, padding: "12px 18px", background: "#f4f7fb", color: "#547792", fontWeight: 600, fontSize: 12, textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "1px solid #eaf0f7" },
  td:          { padding: "14px 18px", borderBottom: "1px solid #f0f4f9", color: "#1A3263", verticalAlign: "middle" as const },
  trHover:     { background: "#f9fbfd" },
  catBadge:    { display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: "capitalize" as const },
  floorBadge:  { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "#eef2ff", color: "#4361ee" },
  tag:         { display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 11, background: "#f0f4f9", color: "#547792", margin: "2px" },
  actionRow:   { display: "flex", gap: 6, alignItems: "center" },
  iconBtn:     { border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  empty:       { background: "#fff", borderRadius: 14, padding: "48px 24px", textAlign: "center" as const, color: "#9aafbf", fontSize: 14, boxShadow: "0 1px 4px rgba(26,50,99,.07)" },
  overlay:     { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
  modal:       { background: "#fff", borderRadius: 16, padding: "32px", width: "100%", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,.15)", maxHeight: "90vh", overflowY: "auto" as const, fontFamily: "'Outfit', sans-serif" },
  modalHdr:    { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  modalTitle:  { fontSize: 18, fontWeight: 700, color: "#1A3263", margin: 0 },
  closeBtn:    { background: "none", border: "none", cursor: "pointer", color: "#547792", display: "flex" },
  formGroup:   { marginBottom: 16 },
  label:       { display: "block", fontSize: 13, fontWeight: 600, color: "#1A3263", marginBottom: 6 },
  input:       { width: "100%", border: "1px solid #dde6f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#1A3263", outline: "none", fontFamily: "'Outfit', sans-serif", boxSizing: "border-box" as const },
  textarea:    { width: "100%", border: "1px solid #dde6f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#1A3263", outline: "none", fontFamily: "'Outfit', sans-serif", boxSizing: "border-box" as const, resize: "vertical" as const, minHeight: 80 },
  submitBtn:   { width: "100%", background: "#1A3263", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", marginTop: 8 },
  detailRow:   { display: "flex", gap: 8, marginBottom: 12, alignItems: "flex-start" },
  detailLabel: { fontSize: 12, fontWeight: 600, color: "#547792", minWidth: 100, textTransform: "uppercase" as const, letterSpacing: "0.04em", paddingTop: 2 },
  detailValue: { fontSize: 14, color: "#1A3263", flex: 1 },
};

const catColor: Record<string, { bg: string; color: string }> = {
  classroom:      { bg: "#e8f4fd", color: "#1a73e8" },
  lab:            { bg: "#e6f4ea", color: "#1e8e3e" },
  toilet:         { bg: "#fce8e6", color: "#d93025" },
  "seminar hall": { bg: "#fef7e0", color: "#f29900" },
  office:         { bg: "#f3e8fd", color: "#8430ce" },
};
const defaultCat = { bg: "#f0f4f9", color: "#547792" };

// ─── iOS Toggle ───────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, loading }: { checked: boolean; onChange: () => void; loading: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      title={checked ? "Accessible — click to disable" : "Not accessible — click to enable"}
      style={{
        width: 42, height: 24, borderRadius: 12, border: "none", cursor: loading ? "wait" : "pointer",
        background: checked ? "#34c759" : "#ff3b30",
        position: "relative", transition: "background 0.25s", padding: 0, flexShrink: 0,
        opacity: loading ? 0.6 : 1,
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: checked ? 21 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.25s",
      }} />
    </button>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ room, onClose }: { room: Room; onClose: () => void }) {
  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <div style={S.modalHdr}>
          <h2 style={S.modalTitle}>{room.name}</h2>
          <button style={S.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        {([
          ["Room No",     room.roomNo ?? "—"],
          ["Building",    room.buildingName],
          ["Floor",       `Floor ${room.floor}`],
          ["Category",    room.category],
          ["Accessible",  room.isAccessible ? "Yes" : "No"],
          ["Description", room.description ?? "—"],
        ] as [string, string][]).map(([label, value]) => (
          <div key={label} style={S.detailRow}>
            <span style={S.detailLabel}>{label}</span>
            <span style={S.detailValue}>{value}</span>
          </div>
        ))}
        <div style={S.detailRow}>
          <span style={S.detailLabel}>Tags</span>
          <div style={{ flex: 1 }}>
            {room.tags?.length ? room.tags.map(t => <span key={t} style={S.tag}>{t}</span>) : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── File Upload Box (with X to clear) ───────────────────────────────────────
function FileUploadBox({
  label, hint, accept, file, error, onChange,
}: {
  label: string; hint: string; accept: string;
  file: File | null; error: string; onChange: (f: File | null) => void;
}) {
  const hasError = !!error;
  return (
    <div style={S.formGroup}>
      {label && <label style={S.label}>{label}</label>}
      {file ? (
        <div style={{
          border: `1.5px solid ${hasError ? "#ff3b30" : "#34c759"}`,
          borderRadius: 10, padding: "12px 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: hasError ? "#fff5f5" : "#f0fdf4",
        }}>
          <span style={{ fontSize: 13, color: hasError ? "#ff3b30" : "#1e8e3e", fontWeight: 500 }}>
            ✓ {file.name}
          </span>
          <button
            onClick={() => onChange(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9aafbf", display: "flex", padding: 2 }}
            title="Remove file"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <label style={{
          border: `1.5px dashed ${hasError ? "#ff3b30" : "#dde6f0"}`,
          borderRadius: 10, padding: "14px 16px",
          display: "flex", flexDirection: "column", gap: 4, cursor: "pointer",
          background: hasError ? "#fff5f5" : "#fafcff",
        }}>
          <input type="file" accept={accept} style={{ display: "none" }}
            onChange={e => onChange(e.target.files?.[0] ?? null)} />
          <span style={{ fontSize: 13, color: hasError ? "#ff3b30" : "#547792" }}>
            📁 {hint}
          </span>
        </label>
      )}
      {error && <p style={{ fontSize: 12, color: "#ff3b30", margin: "4px 0 0" }}>{error}</p>}
    </div>
  );
}

// ─── Entries Input (Upload or Manual) ────────────────────────────────────────
function EntriesInput({
  isEdit, entriesFile, entriesError, onFileChange,
  manualPoints, onAddPoint, onRemovePoint, onPointChange,
}: {
  isEdit: boolean;
  entriesFile: File | null;
  entriesError: string;
  onFileChange: (f: File | null) => void;
  manualPoints: { lng: string; lat: string }[];
  onAddPoint: () => void;
  onRemovePoint: (i: number) => void;
  onPointChange: (i: number, key: "lng" | "lat", val: string) => void;
}) {
  const [mode, setMode] = useState<"file" | "manual">("file");

  return (
    <div style={S.formGroup}>
      {/* Label + Upload / Manual toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <label style={{ ...S.label, margin: 0 }}>
          Entry Points{isEdit ? "" : " *"}
        </label>
        <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid #dde6f0" }}>
          {(["file", "manual"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "4px 12px", fontSize: 12, fontWeight: 600,
              border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif",
              background: mode === m ? "#1A3263" : "#fff",
              color:      mode === m ? "#fff"    : "#547792",
              transition: "background 0.15s",
            }}>
              {m === "file" ? "Upload" : "Manual"}
            </button>
          ))}
        </div>
      </div>

      {mode === "file" ? (
        <>
          <FileUploadBox
            label=""
            hint={isEdit ? "Click to replace existing entry points (optional)" : "Click to upload entries .json file"}
            accept=".json"
            file={entriesFile}
            error={entriesError}
            onChange={onFileChange}
          />
          <p style={{ fontSize: 11, color: "#9aafbf", margin: "-8px 0 0" }}>
            Format: {"[ [lng, lat], [lng, lat] ]"} — one pair per entry point
          </p>
        </>
      ) : (
        <div>
          {manualPoints.length === 0 && (
            <p style={{ fontSize: 13, color: "#9aafbf", marginBottom: 8, textAlign: "center" }}>
              No points added yet.
            </p>
          )}
          {manualPoints.map((pt, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <input
                style={{ ...S.input, flex: 1 }}
                type="number"
                step="any"
                placeholder="Longitude"
                value={pt.lng}
                onChange={e => onPointChange(i, "lng", e.target.value)}
              />
              <input
                style={{ ...S.input, flex: 1 }}
                type="number"
                step="any"
                placeholder="Latitude"
                value={pt.lat}
                onChange={e => onPointChange(i, "lat", e.target.value)}
              />
              <button
                onClick={() => onRemovePoint(i)}
                style={{ background: "#fce8e6", border: "none", borderRadius: 8, padding: "8px", cursor: "pointer", display: "flex", flexShrink: 0 }}
                title="Remove point"
              >
                <X size={14} color="#d93025" />
              </button>
            </div>
          ))}
          <button onClick={onAddPoint} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: "#f0f4f9", border: "1px dashed #dde6f0",
            borderRadius: 10, padding: "8px 14px", fontSize: 13,
            color: "#547792", cursor: "pointer",
            fontFamily: "'Outfit', sans-serif", width: "100%",
          }}>
            <Plus size={14} /> Add Entry Point
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
function RoomFormModal({ room, onClose, onSaved, buildings, existingCategories }: {
  room?: Room;
  onClose: () => void;
  onSaved: () => void;
  buildings: { id: number; name: string }[];
  existingCategories: string[];
}) {
  const isEdit = !!room;

  const [form, setForm] = useState({
    name:         room?.name ?? "",
    roomNo:       room?.roomNo ?? "",
    category:     room?.category ?? "",
    floor:        room?.floor?.toString() ?? "1",
    level:        "",
    description:  room?.description ?? "",
    tags:         room?.tags?.join(", ") ?? "",
    isAccessible: room?.isAccessible ?? true,
    buildingId:   room?.buildingId?.toString() ?? "",
  });

  const [customCategory, setCustomCategory] = useState(false);
  const [geomFile,       setGeomFile]       = useState<File | null>(null);
  const [entriesFile,    setEntriesFile]    = useState<File | null>(null);
  const [geomError,      setGeomError]      = useState("");
  const [entriesError,   setEntriesError]   = useState("");
  const [manualPoints,   setManualPoints]   = useState<{ lng: string; lat: string }[]>([]);
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState("");

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  // ── Manual points handlers ───────────────────────────────────────────────
  const addPoint    = () => setManualPoints(p => [...p, { lng: "", lat: "" }]);
  const removePoint = (i: number) => setManualPoints(p => p.filter((_, idx) => idx !== i));
  const changePoint = (i: number, key: "lng" | "lat", val: string) =>
    setManualPoints(p => p.map((pt, idx) => idx === i ? { ...pt, [key]: val } : pt));

  // ── JSON validation helper ───────────────────────────────────────────────
  const readAndValidateJson = (file: File, isGeoJson: boolean): Promise<any> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const parsed = JSON.parse(e.target!.result as string);
          if (isGeoJson) {
            if (!parsed.type) {
              reject(new Error("Invalid GeoJSON — missing 'type' field.")); return;
            }
          } else {
            if (!Array.isArray(parsed)) {
              reject(new Error("Invalid format — must be a JSON array.")); return;
            }
            const allPairs = parsed.every(
              (p: any) => Array.isArray(p) && p.length === 2 &&
                typeof p[0] === "number" && typeof p[1] === "number"
            );
            if (!allPairs) {
              reject(new Error("Each entry must be [longitude, latitude] number pair.")); return;
            }
          }
          resolve(parsed);
        } catch {
          reject(new Error("Invalid JSON — could not parse file."));
        }
      };
      reader.onerror = () => reject(new Error("File read error."));
      reader.readAsText(file);
    });

  // ── File change handlers with instant validation ─────────────────────────
  const handleGeomFile = async (file: File | null) => {
    setGeomFile(file);
    setGeomError("");
    if (!file) return;
    try { await readAndValidateJson(file, true); }
    catch (e: any) { setGeomError(e.message); }
  };

  const handleEntriesFile = async (file: File | null) => {
    setEntriesFile(file);
    setEntriesError("");
    if (!file) return;
    try { await readAndValidateJson(file, false); }
    catch (e: any) { setEntriesError(e.message); }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.buildingId || !form.floor) {
      setError("Name, category, building and floor are required.");
      return;
    }
    if (geomError || entriesError) {
      setError("Please fix file errors before submitting.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      let geoJson = null;
      let entries = null;

      if (geomFile) {
        geoJson = await readAndValidateJson(geomFile, true);
      }

      if (entriesFile) {
        entries = await readAndValidateJson(entriesFile, false);
      } else if (manualPoints.length > 0) {
        const allFilled = manualPoints.every(p => p.lng !== "" && p.lat !== "");
        if (!allFilled) throw new Error("All entry points must have both longitude and latitude.");
        entries = manualPoints.map(p => [parseFloat(p.lng), parseFloat(p.lat)]);
      }

      const payload: any = {
        name:         form.name,
        roomNo:       form.roomNo      || null,
        category:     form.category,
        floor:        parseInt(form.floor),
        level:        form.level       ? parseInt(form.level) : null,
        description:  form.description || null,
        tags:         form.tags.split(",").map(t => t.trim()).filter(Boolean),
        isAccessible: form.isAccessible,
        buildingId:   parseInt(form.buildingId),
      };

      if (geoJson !== null) payload.geoJson = geoJson;
      if (entries !== null) payload.entries = entries;

      const res = await fetch(isEdit ? `${API}/${room!.id}` : API, {
        method:  isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const rowStyle: React.CSSProperties  = { display: "flex", gap: 12 };
  const halfGroup: React.CSSProperties = { ...S.formGroup, flex: 1 };

  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <div style={S.modalHdr}>
          <h2 style={S.modalTitle}>{isEdit ? "Edit Room" : "Add New Room"}</h2>
          <button style={S.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <div style={S.formGroup}>
          <label style={S.label}>Room Name *</label>
          <input style={S.input} type="text" placeholder="e.g. Computer Lab A"
            value={form.name} onChange={e => set("name", e.target.value)} />
        </div>

        <div style={rowStyle}>
          <div style={halfGroup}>
            <label style={S.label}>Room No</label>
            <input style={S.input} type="text" placeholder="e.g. 101"
              value={form.roomNo} onChange={e => set("roomNo", e.target.value)} />
          </div>
          <div style={halfGroup}>
            <label style={S.label}>Floor *</label>
            <input style={S.input} type="number" placeholder="1"
              value={form.floor} onChange={e => set("floor", e.target.value)} />
          </div>
        </div>

        <div style={rowStyle}>
          <div style={halfGroup}>
            <label style={S.label}>Level</label>
            <input style={S.input} type="number" placeholder="e.g. 1"
              value={form.level} onChange={e => set("level", e.target.value)} />
          </div>
          <div style={halfGroup}>
            <label style={S.label}>Building *</label>
            <select style={S.input} value={form.buildingId} onChange={e => set("buildingId", e.target.value)}>
              <option value="">Select building...</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={S.formGroup}>
          <label style={S.label}>Category *</label>
          {!customCategory ? (
            <div style={{ display: "flex", gap: 8 }}>
              <select style={{ ...S.input, flex: 1 }} value={form.category} onChange={e => set("category", e.target.value)}>
                <option value="">Select category...</option>
                {existingCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button onClick={() => { setCustomCategory(true); set("category", ""); }}
                style={{ background: "#f0f4f9", color: "#547792", padding: "8px 12px", fontSize: 12, borderRadius: 10, border: "1px solid #dde6f0", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Outfit', sans-serif" }}>
                + Custom
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...S.input, flex: 1 }} type="text" placeholder="Type new category..."
                value={form.category} onChange={e => set("category", e.target.value)} />
              <button onClick={() => { setCustomCategory(false); set("category", ""); }}
                style={{ background: "#fce8e6", color: "#d93025", padding: "8px 12px", fontSize: 12, borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                Cancel
              </button>
            </div>
          )}
        </div>

        <div style={S.formGroup}>
          <label style={S.label}>Description</label>
          <textarea style={S.textarea} placeholder="Optional description..."
            value={form.description} onChange={e => set("description", e.target.value)} />
        </div>

        <div style={S.formGroup}>
          <label style={S.label}>Tags <span style={{ fontWeight: 400, color: "#9aafbf" }}>(comma separated)</span></label>
          <input style={S.input} type="text" placeholder="e.g. projector, AC, computers"
            value={form.tags} onChange={e => set("tags", e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Toggle checked={form.isAccessible} loading={false} onChange={() => set("isAccessible", !form.isAccessible)} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1A3263" }}>Accessible</span>
          </div>
        </div>

        <FileUploadBox
          label={`Room Geometry (.geojson)${isEdit ? "" : " *"}`}
          hint={isEdit ? "Click to replace existing geometry (optional)" : "Click to upload .geojson file"}
          accept=".geojson,.json"
          file={geomFile}
          error={geomError}
          onChange={handleGeomFile}
        />

        <EntriesInput
          isEdit={isEdit}
          entriesFile={entriesFile}
          entriesError={entriesError}
          onFileChange={handleEntriesFile}
          manualPoints={manualPoints}
          onAddPoint={addPoint}
          onRemovePoint={removePoint}
          onPointChange={changePoint}
        />

        {error && <p style={{ color: "#d93025", fontSize: 13, marginBottom: 8 }}>{error}</p>}

        <button style={S.submitBtn} onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Update Room" : "Add Room"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Rooms() {
  const [rooms,       setRooms]       = useState<Room[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [catFilter,   setCatFilter]   = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [hoveredRow,  setHoveredRow]  = useState<number | null>(null);
  const [togglingId,  setTogglingId]  = useState<number | null>(null);
  const [showAdd,     setShowAdd]     = useState(false);
  const [editRoom,    setEditRoom]    = useState<Room | null>(null);
  const [detailRoom,  setDetailRoom]  = useState<Room | null>(null);
  const [buildings,   setBuildings]   = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/buildings")
  .then(r => r.json())
  .then((data: { id: number; name: string }[]) =>
    setBuildings(data.map(b => ({ id: b.id, name: b.name })))
  );
  }, []);

  const fetchRooms = () => {
    setLoading(true);
    fetch(`${API}/admin`)
      .then(r => r.json())
      .then(setRooms)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleToggleAccessible = async (room: Room) => {
    setTogglingId(room.id);
    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, isAccessible: !r.isAccessible } : r));
    try {
      const res = await fetch(`${API}/${room.id}/accessible`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessible: !room.isAccessible }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, isAccessible: room.isAccessible } : r));
    } finally {
      setTogglingId(null);
    }
  };

  const categories = ["all", ...Array.from(new Set(rooms.map(r => r.category)))];
  const floors     = ["all", ...Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => a - b).map(String)];

  const filtered = rooms.filter(r => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.roomNo?.includes(search) || r.buildingName.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter   === "all" || r.category === catFilter;
    const matchFloor  = floorFilter === "all" || r.floor.toString() === floorFilter;
    return matchSearch && matchCat && matchFloor;
  });

  const totalRooms  = rooms.length;
  const catCounts   = rooms.reduce((acc, r) => { acc[r.category] = (acc[r.category] ?? 0) + 1; return acc; }, {} as Record<string, number>);
  const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <div style={S.page}>
      <div style={S.hdr}>
        <div style={S.hdrLeft}>
          <DoorOpen size={22} strokeWidth={1.8} />
          <div><h1 style={S.h1}>Rooms</h1><p style={S.sub}>Manage rooms and categories</p></div>
        </div>
        <button style={S.addBtn} onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Room
        </button>
      </div>

      {!loading && (
        <div style={S.statsRow}>
          <div style={S.statCard}><span style={S.statNum}>{totalRooms}</span><span style={S.statLabel}>Total Rooms</span></div>
          <div style={S.statCard}><span style={S.statNum}>{Object.keys(catCounts).length}</span><span style={S.statLabel}>Categories</span></div>
          <div style={S.statCard}><span style={S.statNum}>{floors.length - 1}</span><span style={S.statLabel}>Floors</span></div>
          <div style={S.statCard}><span style={{ ...S.statNum, fontSize: 16, paddingTop: 4, textTransform: "capitalize" }}>{topCategory}</span><span style={S.statLabel}>Top Category</span></div>
        </div>
      )}

      <div style={S.filterBar}>
        <div style={S.searchWrap}>
          <Search size={15} color="#547792" />
          <input style={S.searchInput} placeholder="Search by name, room no, building..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select style={S.select} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
        </select>
        <select style={S.select} value={floorFilter} onChange={e => setFloorFilter(e.target.value)}>
          {floors.map(f => <option key={f} value={f}>{f === "all" ? "All Floors" : `Floor ${f}`}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={S.empty}><Loader2 size={20} /></div>
      ) : filtered.length === 0 ? (
        <div style={S.empty}>No rooms found.</div>
      ) : (
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                {["Room", "Room No", "Building", "Floor", "Category", "Tags", "Accessible", "Actions"].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(room => {
                const cat = catColor[room.category?.toLowerCase()] ?? defaultCat;
                return (
                  <tr key={room.id}
                    style={hoveredRow === room.id ? S.trHover : {}}
                    onMouseEnter={() => setHoveredRow(room.id)}
                    onMouseLeave={() => setHoveredRow(null)}>
                    <td style={S.td}><span style={{ fontWeight: 600 }}>{room.name}</span></td>
                    <td style={S.td}>{room.roomNo ?? <span style={{ color: "#c0cdd8" }}>—</span>}</td>
                    <td style={S.td}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Building2 size={13} color="#547792" /> {room.buildingName}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span style={S.floorBadge}><Layers size={11} /> {room.floor}</span>
                    </td>
                    <td style={S.td}>
                      <span style={{ ...S.catBadge, background: cat.bg, color: cat.color }}>{room.category}</span>
                    </td>
                    <td style={S.td}>
                      {room.tags?.slice(0, 2).map(t => <span key={t} style={S.tag}>{t}</span>)}
                      {room.tags?.length > 2 && <span style={S.tag}>+{room.tags.length - 2}</span>}
                    </td>
                    <td style={S.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Toggle
                          checked={room.isAccessible}
                          loading={togglingId === room.id}
                          onChange={() => handleToggleAccessible(room)}
                        />
                        <span style={{ fontSize: 12, color: room.isAccessible ? "#34c759" : "#ff3b30", fontWeight: 600 }}>
                          {room.isAccessible ? "Yes" : "No"}
                        </span>
                      </div>
                    </td>
                    <td style={S.td}>
                      <div style={S.actionRow}>
                        <button title="View details" style={{ ...S.iconBtn, background: "#f0f4f9", color: "#547792" }} onClick={() => setDetailRoom(room)}>
                          <Eye size={15} />
                        </button>
                        <button title="Edit" style={{ ...S.iconBtn, background: "#eef2ff", color: "#4361ee" }} onClick={() => setEditRoom(room)}>
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAdd    && <RoomFormModal buildings={buildings} existingCategories={categories.filter(c => c !== "all")} onClose={() => setShowAdd(false)} onSaved={fetchRooms} />}
      {editRoom   && <RoomFormModal buildings={buildings} existingCategories={categories.filter(c => c !== "all")} room={editRoom} onClose={() => setEditRoom(null)} onSaved={fetchRooms} />}
      {detailRoom && <DetailModal  room={detailRoom} onClose={() => setDetailRoom(null)} />}
    </div>
  );
}