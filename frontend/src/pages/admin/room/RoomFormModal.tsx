import { useState } from "react";
import { X } from "lucide-react";
import Toggle from "./Toggle";
import FileUploadBox from "./FileUploadBox";
import EntriesInput from "./EntriesInput";
import { S } from "./constants";
import { readAndValidateJson } from "./utils";
import { saveRoom } from "./api";
import type { Room } from "../../../types/types";

type RoomFormModalProps = {
  room?: Room;
  onClose: () => void;
  onSaved: () => void;
  buildings: { id: number; name: string }[];
  existingCategories: string[];
};

export default function RoomFormModal({
  room,
  onClose,
  onSaved,
  buildings,
  existingCategories,
}: RoomFormModalProps) {
  const isEdit = !!room;

  const [form, setForm] = useState({
    name:         room?.name ?? "",
    roomNo:       room?.roomNo ?? "",
    category:     room?.category ?? "",
    floor:        room?.floor?.toString() ?? "1",
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

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  // ── Manual points handlers ──────────────────────────────────────────────────
  const addPoint    = () => setManualPoints((p) => [...p, { lng: "", lat: "" }]);
  const removePoint = (i: number) => setManualPoints((p) => p.filter((_, idx) => idx !== i));
  const changePoint = (i: number, key: "lng" | "lat", val: string) =>
    setManualPoints((p) => p.map((pt, idx) => (idx === i ? { ...pt, [key]: val } : pt)));

  // ── File handlers with instant validation ───────────────────────────────────
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

  // ── Submit ──────────────────────────────────────────────────────────────────
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

      if (geomFile) geoJson = await readAndValidateJson(geomFile, true);

      if (entriesFile) {
        entries = await readAndValidateJson(entriesFile, false);
      } else if (manualPoints.length > 0) {
        const allFilled = manualPoints.every((p) => p.lng !== "" && p.lat !== "");
        if (!allFilled) throw new Error("All entry points must have both longitude and latitude.");
        entries = manualPoints.map((p) => [parseFloat(p.lng), parseFloat(p.lat)]);
      }

      const payload: Record<string, any> = {
        name:         form.name,
        roomNo:       form.roomNo || null,
        category:     form.category,
        floor:        parseInt(form.floor),
        description:  form.description || null,
        tags:         form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        isAccessible: form.isAccessible,
        buildingId:   parseInt(form.buildingId),
      };

      if (geoJson !== null) payload.geoJson = geoJson;
      if (entries !== null) payload.entries = entries;

      await saveRoom(payload, room?.id);
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
        {/* Header */}
        <div style={S.modalHdr}>
          <h2 style={S.modalTitle}>{isEdit ? "Edit Room" : "Add New Room"}</h2>
          <button style={S.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Room Name */}
        <div style={S.formGroup}>
          <label style={S.label}>Room Name *</label>
          <input
            style={S.input}
            type="text"
            placeholder="e.g. Computer Lab A"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>

        {/* Room No + Floor */}
        <div style={rowStyle}>
          <div style={halfGroup}>
            <label style={S.label}>Room No</label>
            <input
              style={S.input}
              type="text"
              placeholder="e.g. 101"
              value={form.roomNo}
              onChange={(e) => set("roomNo", e.target.value)}
            />
          </div>
          <div style={halfGroup}>
            <label style={S.label}>Floor *</label>
            <input
              style={S.input}
              type="number"
              placeholder="1"
              value={form.floor}
              onChange={(e) => set("floor", e.target.value)}
            />
          </div>
        </div>

        {/* Building */}
        <div style={rowStyle}>
          <div style={halfGroup}>
            <label style={S.label}>Building *</label>
            <select
              style={S.input}
              value={form.buildingId}
              onChange={(e) => set("buildingId", e.target.value)}
            >
              <option value="">Select building...</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category */}
        <div style={S.formGroup}>
          <label style={S.label}>Category *</label>
          {!customCategory ? (
            <div style={{ display: "flex", gap: 8 }}>
              <select
                style={{ ...S.input, flex: 1 }}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                <option value="">Select category...</option>
                {existingCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                onClick={() => { setCustomCategory(true); set("category", ""); }}
                style={{
                  background: "#f0f4f9", color: "#547792", padding: "8px 12px",
                  fontSize: 12, borderRadius: 10, border: "1px solid #dde6f0",
                  cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Outfit', sans-serif",
                }}
              >
                + Custom
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ ...S.input, flex: 1 }}
                type="text"
                placeholder="Type new category..."
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              />
              <button
                onClick={() => { setCustomCategory(false); set("category", ""); }}
                style={{
                  background: "#fce8e6", color: "#d93025", padding: "8px 12px",
                  fontSize: 12, borderRadius: 10, border: "none",
                  cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <div style={S.formGroup}>
          <label style={S.label}>Description</label>
          <textarea
            style={S.textarea}
            placeholder="Optional description..."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        {/* Tags */}
        <div style={S.formGroup}>
          <label style={S.label}>
            Tags{" "}
            <span style={{ fontWeight: 400, color: "#9aafbf" }}>(comma separated)</span>
          </label>
          <input
            style={S.input}
            type="text"
            placeholder="e.g. projector, AC, computers"
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
          />
        </div>

        {/* Accessible toggle */}
        <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Toggle
              checked={form.isAccessible}
              loading={false}
              onChange={() => set("isAccessible", !form.isAccessible)}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1A3263" }}>
              Accessible
            </span>
          </div>
        </div>

        {/* Geometry file */}
        <FileUploadBox
          label={`Room Geometry (.geojson)${isEdit ? "" : " *"}`}
          hint={
            isEdit
              ? "Click to replace existing geometry (optional)"
              : "Click to upload .geojson file"
          }
          accept=".geojson,.json"
          file={geomFile}
          error={geomError}
          onChange={handleGeomFile}
        />

        {/* Entry points */}
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

        {error && (
          <p style={{ color: "#d93025", fontSize: 13, marginBottom: 8 }}>{error}</p>
        )}

        <button style={S.submitBtn} onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Update Room" : "Add Room"}
        </button>
      </div>
    </div>
  );
}