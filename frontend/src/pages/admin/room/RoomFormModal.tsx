import { useState } from "react";
import { X } from "lucide-react";
import Toggle from "./Toggle";
import FileUploadBox from "./FileUploadBox";
import EntriesInput from "./EntriesInput";
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

const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm border-[1.5px] border-[rgba(26,50,99,0.12)] outline-none font-[Outfit] text-[#1A3263] bg-white focus:border-[#0AC4E0] transition-colors duration-150";
const labelCls = "text-[11px] font-bold text-[#547792] tracking-widest uppercase";

export default function RoomFormModal({
  room, onClose, onSaved, buildings, existingCategories,
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

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const addPoint    = () => setManualPoints(p => [...p, { lng: "", lat: "" }]);
  const removePoint = (i: number) => setManualPoints(p => p.filter((_, idx) => idx !== i));
  const changePoint = (i: number, key: "lng" | "lat", val: string) =>
    setManualPoints(p => p.map((pt, idx) => idx === i ? { ...pt, [key]: val } : pt));

  const handleGeomFile = async (file: File | null) => {
    setGeomFile(file); setGeomError("");
    if (!file) return;
    try { await readAndValidateJson(file, true); }
    catch (e: any) { setGeomError(e.message); }
  };

  const handleEntriesFile = async (file: File | null) => {
    setEntriesFile(file); setEntriesError("");
    if (!file) return;
    try { await readAndValidateJson(file, false); }
    catch (e: any) { setEntriesError(e.message); }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.buildingId || !form.floor) {
      setError("Name, category, building and floor are required."); return;
    }
    if (geomError || entriesError) {
      setError("Please fix file errors before submitting."); return;
    }
    setSaving(true); setError("");
    try {
      let geoJson = null, entries = null;
      if (geomFile) geoJson = await readAndValidateJson(geomFile, true);
      if (entriesFile) {
        entries = await readAndValidateJson(entriesFile, false);
      } else if (manualPoints.length > 0) {
        if (!manualPoints.every(p => p.lng !== "" && p.lat !== ""))
          throw new Error("All entry points must have both longitude and latitude.");
        entries = manualPoints.map(p => [parseFloat(p.lng), parseFloat(p.lat)]);
      }
      const payload: Record<string, any> = {
        name: form.name, roomNo: form.roomNo || null, category: form.category,
        floor: parseInt(form.floor), description: form.description || null,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        isAccessible: form.isAccessible, buildingId: parseInt(form.buildingId),
      };
      if (geoJson !== null) payload.geoJson = geoJson;
      if (entries !== null) payload.entries = entries;
      await saveRoom(payload, room?.id);
      onSaved(); onClose();
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[rgba(11,45,114,0.45)] z-[100] flex items-center justify-center p-5 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-[540px] max-h-[90vh] overflow-hidden flex flex-col shadow-[0_24px_64px_rgba(11,45,114,0.25)]">

        {/* ── Header ── */}
        <div className="bg-[#0B2D72] px-6 py-[22px] flex items-center justify-between shrink-0">
          <h2 className="text-lg font-extrabold text-[#F6E7BC] m-0 tracking-tight">
            {isEdit ? "Edit Room" : "Add New Room"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border-none bg-[rgba(246,231,188,0.12)] text-[#F6E7BC] flex items-center justify-center cursor-pointer hover:bg-[rgba(246,231,188,0.22)] transition-colors duration-150"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-3.5">

          {/* Error */}
          {error && (
            <div className="bg-[rgba(220,53,69,0.08)] border border-[rgba(220,53,69,0.2)] rounded-xl px-3.5 py-2.5 text-[13px] text-[#dc3545]">
              {error}
            </div>
          )}

          {/* Room Name */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Room Name *</label>
            <input className={inputCls} type="text" placeholder="e.g. Computer Lab A"
              value={form.name} onChange={e => set("name", e.target.value)} />
          </div>

          {/* Room No + Floor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Room No</label>
              <input className={inputCls} type="text" placeholder="e.g. 101"
                value={form.roomNo} onChange={e => set("roomNo", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Floor *</label>
              <input className={inputCls} type="number" placeholder="1"
                value={form.floor} onChange={e => set("floor", e.target.value)} />
            </div>
          </div>

          {/* Building */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Building *</label>
            <select className={inputCls} value={form.buildingId} onChange={e => set("buildingId", e.target.value)}>
              <option value="">Select building...</option>
              {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Category *</label>
            {!customCategory ? (
              <div className="flex gap-2">
                <select className={`${inputCls} flex-1`} value={form.category} onChange={e => set("category", e.target.value)}>
                  <option value="">Select category...</option>
                  {existingCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button
                  onClick={() => { setCustomCategory(true); set("category", ""); }}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-[rgba(26,50,99,0.12)] bg-[rgba(26,50,99,0.04)] text-[#547792] cursor-pointer font-[Outfit] whitespace-nowrap hover:bg-[rgba(26,50,99,0.08)] transition-colors duration-150"
                >
                  + Custom
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input className={`${inputCls} flex-1`} type="text" placeholder="Type new category..."
                  value={form.category} onChange={e => set("category", e.target.value)} />
                <button
                  onClick={() => { setCustomCategory(false); set("category", ""); }}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border-none bg-[rgba(220,53,69,0.1)] text-[#dc3545] cursor-pointer font-[Outfit] hover:bg-[rgba(220,53,69,0.18)] transition-colors duration-150"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Description</label>
            <textarea
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border-[1.5px] border-[rgba(26,50,99,0.12)] outline-none font-[Outfit] text-[#1A3263] bg-white min-h-[80px] resize-y focus:border-[#0AC4E0] transition-colors duration-150"
              placeholder="Optional description..."
              value={form.description}
              onChange={e => set("description", e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>
              Tags <span className="font-normal text-[#9aafbf] normal-case tracking-normal">(comma separated)</span>
            </label>
            <input className={inputCls} type="text" placeholder="e.g. projector, AC, computers"
              value={form.tags} onChange={e => set("tags", e.target.value)} />
          </div>

          {/* Accessible */}
          <div className="flex items-center gap-2.5">
            <Toggle
              checked={form.isAccessible}
              loading={false}
              onChange={() => set("isAccessible", !form.isAccessible)}
            />
            <span className="text-[13px] font-semibold text-[#1A3263]">Accessible</span>
          </div>

          {/* Geometry file */}
          <FileUploadBox
            label={`Room Geometry (.geojson)${isEdit ? "" : " *"}`}
            hint={isEdit ? "Click to replace existing geometry (optional)" : "Click to upload .geojson file"}
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

        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-[rgba(26,50,99,0.08)] flex justify-end gap-2.5 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full border-[1.5px] border-[rgba(26,50,99,0.2)] bg-transparent text-[#547792] text-[13px] font-semibold cursor-pointer font-[Outfit] hover:border-[rgba(26,50,99,0.4)] transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-full border-none bg-[#1A3263] text-[#F6E7BC] text-[13px] font-bold cursor-pointer font-[Outfit] disabled:opacity-50 hover:bg-[#FAB95B] hover:text-[#1A3263] transition-all duration-200"
          >
            {saving ? "Saving…" : isEdit ? "Update Room" : "Add Room"}
          </button>
        </div>

      </div>
    </div>
  );
}