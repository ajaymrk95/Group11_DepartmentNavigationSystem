import React, { useEffect, useState } from "react";
import { Users, Plus, Pencil, Trash2, X, MapPin, Search } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface Faculty {
  id?: number;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  description: string;
  profileImageUrl: string;
  tags: string[];
  roomId?: number | null;
  roomNo?: string;
  roomName?: string;
  buildingId?: number;
  buildingName?: string;
}

interface Room {
  id: number;
  name: string;
  roomNo: string;
  category?: string;
  buildingName?: string;
}

const EMPTY_FORM: Faculty = {
  name: "", designation: "", department: "", email: "",
  phone: "", description: "", profileImageUrl: "", tags: [],
  roomId: null,
};

const API = "http://localhost:8080/api/faculties";

// ── Reusable input class ─────────────────────────────────────────────────────
const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm border-[1.5px] border-[rgba(26,50,99,0.12)] outline-none font-[Outfit] text-[#1A3263] bg-white focus:border-[#0AC4E0] transition-colors duration-150";

// ── Main Component ────────────────────────────────────────────────────────────
export default function Faculty() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Faculty | null>(null);
  const [form, setForm] = useState<Faculty>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomSearch, setRoomSearch] = useState("");
  const [showRoomDrop, setShowRoomDrop] = useState(false);
  const [selectedRoomLabel, setSelectedRoomLabel] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Faculty | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchAll(); fetchRooms(); }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest(".room-dropdown-wrap")) setShowRoomDrop(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchRooms() {
    try {
      const res = await fetch("http://localhost:8080/api/rooms/all");
      if (res.ok) setRooms(await res.json());
    } catch { setError("Could not load rooms."); }
  }

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Failed to fetch");
      setFaculty(await res.json());
    } catch { setError("Could not load faculty records."); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditTarget(null); setForm(EMPTY_FORM); setTagInput("");
    setFormError(""); setRoomSearch(""); setSelectedRoomLabel("");
    setShowRoomDrop(false); setShowModal(true);
  }

  function openEdit(f: Faculty) {
    setEditTarget(f); setForm({ ...f }); setTagInput("");
    setFormError(""); setRoomSearch("");
    setSelectedRoomLabel(f.roomName ? `${f.roomNo} — ${f.roomName}` : f.roomNo || "");
    setShowRoomDrop(false); setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { setFormError("Name is required."); return; }
    setSaving(true); setFormError("");
    try {
      const method = editTarget ? "PUT" : "POST";
      const url = editTarget ? `${API}/${editTarget.id}` : API;
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchAll();
      setShowModal(false);
    } catch (e: unknown) { setFormError(e instanceof Error ? e.message : "Save failed."); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await fetch(`${API}/${deleteTarget.id}`, { method: "DELETE" });
      await fetchAll(); setDeleteTarget(null);
    } catch { setFormError("Delete failed."); }
    finally { setDeleting(false); }
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t] }));
    setTagInput("");
  }
  function removeTag(t: string) { setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) })); }

  const filtered = faculty.filter(f => {
    const q = search.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.department?.toLowerCase().includes(q) ||
      f.designation?.toLowerCase().includes(q) ||
      f.email?.toLowerCase().includes(q) ||
      f.tags?.some(t => t.toLowerCase().includes(q))
    );
  });

  const filteredRooms = rooms.filter(r =>
    r.name?.toLowerCase().includes(roomSearch.toLowerCase()) ||
    r.roomNo?.toLowerCase().includes(roomSearch.toLowerCase()) ||
    r.category?.toLowerCase().includes(roomSearch.toLowerCase()) ||
    r.buildingName?.toLowerCase().includes(roomSearch.toLowerCase())
  );

  const initials = (name: string) =>
    name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="font-[Outfit] text-[#1A3263] p-7 w-full min-h-screen bg-[#EDE8DC] box-border">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <Users size={22} strokeWidth={1.8} color="#1A3263" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight m-0 leading-none">Faculty</h1>
            <p className="text-[13px] text-[#547792] mt-0.5 m-0">Manage faculty and office assignments</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#1A3263] text-[#F6E7BC] text-[13px] font-bold border-none cursor-pointer transition-all duration-200 hover:bg-[#FAB95B] hover:text-[#1A3263]"
        >
          <Plus size={15} strokeWidth={2.5} /> Add Faculty
        </button>
      </div>

      {/* ── Search ── */}
      {faculty.length > 0 && (
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#547792] pointer-events-none" />
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-full border-[1.5px] border-[rgba(26,50,99,0.12)] bg-white text-sm font-[Outfit] text-[#1A3263] outline-none"
            placeholder="Search by name, department or designation..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* ── States ── */}
      {loading && (
        <div className="bg-white rounded-2xl py-14 text-center text-[#9aafbf] text-sm shadow-sm">
          Loading faculty records…
        </div>
      )}
      {!loading && error && (
        <div className="bg-white rounded-2xl py-14 text-center text-[#dc3545] text-sm shadow-sm">{error}</div>
      )}
      {!loading && !error && faculty.length === 0 && (
        <div className="bg-white rounded-2xl py-14 text-center text-[#9aafbf] text-sm shadow-sm">
          No faculty records added yet.
        </div>
      )}
      {!loading && !error && faculty.length > 0 && filtered.length === 0 && (
        <div className="bg-white rounded-2xl py-14 text-center text-[#9aafbf] text-sm shadow-sm">
          No results for "{search}".
        </div>
      )}

      {/* ── Grid ── */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {filtered.map(f => (
            <div
              key={f.id}
              className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(26,50,99,0.08)] border border-[rgba(26,50,99,0.07)] flex flex-col transition-transform duration-200 hover:-translate-y-0.5 overflow-hidden"
            >
              {/* Card top */}
              <div className="bg-[#0B2D72] px-5 pt-6 pb-5 relative">
                <div className="absolute top-4 right-4 flex gap-1.5">
                  <button
                    title="Edit"
                    onClick={() => openEdit(f)}
                    className="w-8 h-8 rounded-full border-none bg-[rgba(246,231,188,0.1)] text-[#F6E7BC] flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-[rgba(250,185,91,0.25)]"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => setDeleteTarget(f)}
                    className="w-8 h-8 rounded-full border-none bg-[rgba(246,231,188,0.1)] text-[#F6E7BC] flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-[rgba(220,53,69,0.25)]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="w-12 h-12 rounded-full bg-[rgba(246,231,188,0.18)] border-2 border-[rgba(246,231,188,0.3)] flex items-center justify-center text-lg font-bold text-[#F6E7BC] mb-3 overflow-hidden shrink-0">
                  {f.profileImageUrl
                    ? <img src={f.profileImageUrl} alt={f.name} className="w-full h-full object-cover" />
                    : initials(f.name)
                  }
                </div>
                <div className="text-[15px] font-bold text-[#F6E7BC] leading-snug pr-20">{f.name}</div>
                <div className="text-xs text-[rgba(246,231,188,0.55)] mt-1">{f.designation || "—"}</div>
              </div>

              {/* Card body */}
              <div className="px-5 pt-4 pb-5 flex-1 flex flex-col gap-3">
                {f.department && (
                  <div className="flex items-baseline gap-3 text-sm">
                    <span className="font-semibold text-[#1A3263] text-[11px] uppercase tracking-wide min-w-[52px]">Dept</span>
                    <span className="text-[#547792]">{f.department}</span>
                  </div>
                )}
                {f.email && (
                  <div className="flex items-baseline gap-3 text-sm">
                    <span className="font-semibold text-[#1A3263] text-[11px] uppercase tracking-wide min-w-[52px]">Email</span>
                    <span className="text-[#547792] break-all">{f.email}</span>
                  </div>
                )}
                {f.phone && (
                  <div className="flex items-baseline gap-3 text-sm">
                    <span className="font-semibold text-[#1A3263] text-[11px] uppercase tracking-wide min-w-[52px]">Phone</span>
                    <span className="text-[#547792]">{f.phone}</span>
                  </div>
                )}
                {f.description && (
                  <div className="flex flex-col gap-1 pt-1 border-t border-[rgba(26,50,99,0.06)]">
                    <span className="font-semibold text-[#1A3263] text-[11px] uppercase tracking-wide">About</span>
                    <span className="text-xs text-[#547792] leading-relaxed">{f.description}</span>
                  </div>
                )}

                <div className="mt-1">
                  {f.roomId ? (
                    <span className="inline-flex items-center gap-1 bg-[rgba(10,196,224,0.08)] border border-[rgba(10,196,224,0.2)] rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-[#0992C2]">
                      <MapPin size={10} /> {f.roomName || f.roomNo}{f.buildingName ? ` · ${f.buildingName}` : ""}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-[rgba(84,119,146,0.08)] border border-[rgba(84,119,146,0.15)] rounded-full px-2.5 py-0.5 text-[11px] font-medium text-[#547792]">
                      <MapPin size={10} /> No room assigned
                    </span>
                  )}
                </div>

                {f.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {f.tags.map(t => (
                      <span key={t} className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[rgba(26,50,99,0.07)] text-[#1A3263] border border-[rgba(26,50,99,0.1)]">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-[rgba(11,45,114,0.45)] z-[100] flex items-center justify-center p-5 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-[540px] max-h-[90vh] overflow-hidden flex flex-col shadow-[0_24px_64px_rgba(11,45,114,0.25)]">

            {/* Modal header */}
            <div className="bg-[#0B2D72] px-6 py-[22px] flex items-center justify-between shrink-0">
              <h2 className="text-lg font-extrabold text-[#F6E7BC] m-0 tracking-tight">
                {editTarget ? "Edit Faculty" : "Add Faculty"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full border-none bg-[rgba(246,231,188,0.12)] text-[#F6E7BC] flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-3.5">
              {formError && (
                <div className="bg-[rgba(220,53,69,0.08)] border border-[rgba(220,53,69,0.2)] rounded-xl px-3.5 py-2.5 text-[13px] text-[#dc3545]">
                  {formError}
                </div>
              )}

              {/* Row: Name + Designation */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#547792] tracking-widest uppercase">Full Name *</label>
                  <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Dr. John Doe" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#547792] tracking-widest uppercase">Designation</label>
                  <input className={inputCls} value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} placeholder="Professor" />
                </div>
              </div>

              {/* Row: Department + Room */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#547792] tracking-widest uppercase">Department</label>
                  <input className={inputCls} value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Computer Science" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#547792] tracking-widest uppercase">Room</label>
                  <div className="relative room-dropdown-wrap">
                    <input
                      className={inputCls}
                      value={showRoomDrop ? roomSearch : selectedRoomLabel}
                      onChange={e => { setRoomSearch(e.target.value); setShowRoomDrop(true); }}
                      onFocus={() => { setRoomSearch(""); setShowRoomDrop(true); }}
                      placeholder="Search and select a room..."
                    />
                    {showRoomDrop && (
                      <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white rounded-xl z-[200] shadow-[0_8px_32px_rgba(26,50,99,0.15)] border-[1.5px] border-[rgba(26,50,99,0.1)] max-h-[200px] overflow-y-auto">
                        <div
                          className="px-3.5 py-2.5 text-[13px] text-[#547792] cursor-pointer border-b border-[rgba(26,50,99,0.06)] hover:bg-[rgba(26,50,99,0.04)] transition-colors duration-150"
                          onMouseDown={() => { setForm(f => ({ ...f, roomId: null })); setSelectedRoomLabel(""); setShowRoomDrop(false); }}
                        >
                          — No room assigned
                        </div>
                        {filteredRooms.map(r => (
                          <div
                            key={r.id}
                            className={`px-3.5 py-2.5 cursor-pointer text-[13px] border-b border-[rgba(26,50,99,0.04)] transition-colors duration-150 hover:bg-[rgba(26,50,99,0.04)] ${form.roomId === r.id ? "bg-[rgba(10,196,224,0.06)] text-[#0992C2]" : "text-[#1A3263]"}`}
                            onMouseDown={() => {
                              setForm(f => ({ ...f, roomId: r.id }));
                              setSelectedRoomLabel(`${r.roomNo} — ${r.name}${r.buildingName ? ` · ${r.buildingName}` : ""}`);
                              setShowRoomDrop(false);
                            }}
                          >
                            <div className="font-semibold">{r.roomNo} — {r.name}</div>
                            <div className="text-[11px] text-[#547792] mt-0.5">{r.category}{r.buildingName ? ` · ${r.buildingName}` : ""}</div>
                          </div>
                        ))}
                        {filteredRooms.length === 0 && (
                          <div className="px-3.5 py-3 text-[13px] text-[#9aafbf] text-center">
                            No rooms match "{roomSearch}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row: Email + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#547792] tracking-widest uppercase">Email</label>
                  <input className={inputCls} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#547792] tracking-widest uppercase">Phone</label>
                  <input className={inputCls} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 99999 99999" />
                </div>
              </div>

              {/* Profile Image URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#547792] tracking-widest uppercase">Profile Image URL</label>
                <input className={inputCls} value={form.profileImageUrl} onChange={e => setForm(f => ({ ...f, profileImageUrl: e.target.value }))} placeholder="https://..." />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#547792] tracking-widest uppercase">Description</label>
                <textarea
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border-[1.5px] border-[rgba(26,50,99,0.12)] outline-none font-[Outfit] text-[#1A3263] min-h-[80px] resize-y bg-white focus:border-[#0AC4E0] transition-colors duration-150"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief bio or office hours..."
                />
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#547792] tracking-widest uppercase">Tags</label>
                <div className="flex gap-2">
                  <input
                    className={`${inputCls} flex-1`}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Type a tag and press Enter"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2.5 rounded-full border-none bg-[#1A3263] text-[#F6E7BC] text-[13px] font-bold cursor-pointer font-[Outfit] hover:bg-[#FAB95B] hover:text-[#1A3263] transition-all duration-200"
                  >
                    Add
                  </button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {form.tags.map(t => (
                      <span
                        key={t}
                        onClick={() => removeTag(t)}
                        className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[rgba(26,50,99,0.07)] text-[#1A3263] border border-[rgba(26,50,99,0.1)] cursor-pointer hover:bg-[rgba(26,50,99,0.14)] transition-colors duration-150"
                      >
                        {t} <X size={10} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-[rgba(26,50,99,0.08)] flex justify-end gap-2.5 shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-full border-[1.5px] border-[rgba(26,50,99,0.2)] bg-transparent text-[#547792] text-[13px] font-semibold cursor-pointer font-[Outfit] hover:border-[rgba(26,50,99,0.4)] transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-full border-none bg-[#1A3263] text-[#F6E7BC] text-[13px] font-bold cursor-pointer font-[Outfit] disabled:opacity-50 hover:bg-[#FAB95B] hover:text-[#1A3263] transition-all duration-200"
              >
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Add Faculty"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 bg-[rgba(11,45,114,0.45)] z-[100] flex items-center justify-center p-5 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}
        >
          <div className="bg-white rounded-2xl w-full max-w-[400px] overflow-hidden flex flex-col shadow-[0_24px_64px_rgba(11,45,114,0.25)]">
            <div className="bg-[#0B2D72] px-6 py-[22px] flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#F6E7BC] m-0 tracking-tight">Delete Faculty</h2>
              <button
                onClick={() => setDeleteTarget(null)}
                className="w-7 h-7 rounded-full border-none bg-[rgba(246,231,188,0.12)] text-[#F6E7BC] flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 text-sm text-[#547792] leading-relaxed">
              Are you sure you want to delete <strong className="text-[#1A3263]">{deleteTarget.name}</strong>? This action cannot be undone.
            </div>
            <div className="px-6 py-4 border-t border-[rgba(26,50,99,0.08)] flex justify-end gap-2.5">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-6 py-2.5 rounded-full border-[1.5px] border-[rgba(26,50,99,0.2)] bg-transparent text-[#547792] text-[13px] font-semibold cursor-pointer font-[Outfit] hover:border-[rgba(26,50,99,0.4)] transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-2.5 rounded-full border-none bg-[rgba(220,53,69,0.1)] text-[#dc3545] text-[13px] font-bold cursor-pointer font-[Outfit] disabled:opacity-50 hover:bg-[rgba(220,53,69,0.2)] transition-colors duration-150"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}