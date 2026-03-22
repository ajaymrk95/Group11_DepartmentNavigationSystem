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

// ── Styles ───────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'Outfit', sans-serif",
    color: "#1A3263",
    padding: "32px 28px",
    width: "100%",
    boxSizing: "border-box",
    minHeight: "100vh",
    background: "#EDE8DC",
  },
  hdr: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  hdrLeft: { display: "flex", alignItems: "center", gap: 12 },
  h1: { fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 },
  sub: { fontSize: 13, color: "#547792", margin: "3px 0 0" },

  // Search bar
  searchWrap: { position: "relative", marginBottom: 20 },
  searchIcon: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#547792", pointerEvents: "none" },
  searchInput: {
    width: "100%", padding: "11px 14px 11px 42px", borderRadius: 100,
    border: "1.5px solid rgba(26,50,99,0.12)", background: "#fff",
    fontSize: 14, fontFamily: "'Outfit', sans-serif", color: "#1A3263",
    outline: "none", boxSizing: "border-box",
  },

  // Add button
  addBtn: {
    display: "flex", alignItems: "center", gap: 7,
    padding: "10px 20px", borderRadius: 100, border: "none",
    background: "#1A3263", color: "#F6E7BC",
    fontSize: 13, fontWeight: 700, cursor: "pointer",
    fontFamily: "'Outfit', sans-serif", letterSpacing: "0.01em",
    transition: "all 0.2s ease",
  },

  // Empty
  empty: {
    background: "#fff", borderRadius: 14, padding: "56px 24px",
    textAlign: "center", color: "#9aafbf", fontSize: 14,
    boxShadow: "0 1px 4px rgba(26,50,99,.07)",
  },

  // Grid
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 },

  // Card
  card: {
    background: "#fff", borderRadius: 16, overflow: "hidden",
    boxShadow: "0 2px 12px rgba(26,50,99,0.08)",
    border: "1px solid rgba(26,50,99,0.07)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
    display: "flex", flexDirection: "column",
  },
  cardTop: { background: "#0B2D72", padding: "20px 20px 16px", position: "relative" },
  avatar: {
    width: 52, height: 52, borderRadius: "50%",
    background: "rgba(246,231,188,0.15)", border: "2px solid rgba(246,231,188,0.25)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20, fontWeight: 700, color: "#F6E7BC", marginBottom: 10,
    overflow: "hidden",
  },
  cardName: { fontSize: 16, fontWeight: 700, color: "#F6E7BC", margin: 0, letterSpacing: "-0.01em" },
  cardDesig: { fontSize: 12, color: "rgba(246,231,188,0.6)", marginTop: 2 },
  cardActions: { position: "absolute", top: 14, right: 14, display: "flex", gap: 6 },
  iconBtn: {
    width: 30, height: 30, borderRadius: "50%", border: "none",
    background: "rgba(246,231,188,0.1)", color: "#F6E7BC",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", transition: "background 0.18s ease",
  },
  cardBody: { padding: "16px 20px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  infoRow: { display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#547792" },
  infoLabel: { fontWeight: 600, color: "#1A3263", minWidth: 80, fontSize: 12 },
  roomPill: {
    display: "inline-flex", alignItems: "center", gap: 5,
    background: "rgba(10,196,224,0.08)", border: "1px solid rgba(10,196,224,0.2)",
    borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 600, color: "#0992C2",
    marginTop: 4,
  },
  noRoom: {
    display: "inline-flex", alignItems: "center", gap: 5,
    background: "rgba(84,119,146,0.08)", border: "1px solid rgba(84,119,146,0.15)",
    borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 500, color: "#547792",
    marginTop: 4,
  },
  tagWrap: { display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 },
  tag: {
    fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 100,
    background: "rgba(26,50,99,0.07)", color: "#1A3263",
    border: "1px solid rgba(26,50,99,0.1)",
  },

  // Modal overlay
  overlay: {
    position: "fixed", inset: 0, background: "rgba(11,45,114,0.45)",
    zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
    padding: 20, backdropFilter: "blur(3px)",
  },
  modal: {
    background: "#fff", borderRadius: 20, width: "100%", maxWidth: 540,
    maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
    boxShadow: "0 24px 64px rgba(11,45,114,0.25)",
  },
  modalHdr: {
    background: "#0B2D72", padding: "22px 24px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  modalTitle: { fontSize: 18, fontWeight: 800, color: "#F6E7BC", margin: 0, letterSpacing: "-0.01em" },
  modalBody: { padding: "24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 },
  modalFooter: {
    padding: "16px 24px", borderTop: "1px solid rgba(26,50,99,0.08)",
    display: "flex", justifyContent: "flex-end", gap: 10,
  },

  // Form
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  formGroup: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 11, fontWeight: 700, color: "#547792", letterSpacing: "0.08em", textTransform: "uppercase" },
  input: {
    padding: "10px 14px", borderRadius: 10, fontSize: 14,
    border: "1.5px solid rgba(26,50,99,0.12)", outline: "none",
    fontFamily: "'Outfit', sans-serif", color: "#1A3263",
    transition: "border-color 0.18s ease",
  },
  textarea: {
    padding: "10px 14px", borderRadius: 10, fontSize: 14, resize: "vertical",
    border: "1.5px solid rgba(26,50,99,0.12)", outline: "none",
    fontFamily: "'Outfit', sans-serif", color: "#1A3263", minHeight: 80,
  },

  // Buttons
  btnPrimary: {
    padding: "10px 24px", borderRadius: 100, border: "none",
    background: "#1A3263", color: "#F6E7BC",
    fontSize: 13, fontWeight: 700, cursor: "pointer",
    fontFamily: "'Outfit', sans-serif",
  },
  btnSecondary: {
    padding: "10px 24px", borderRadius: 100,
    border: "1.5px solid rgba(26,50,99,0.2)", background: "transparent",
    color: "#547792", fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "'Outfit', sans-serif",
  },
  btnDanger: {
    padding: "10px 24px", borderRadius: 100, border: "none",
    background: "rgba(220,53,69,0.1)", color: "#dc3545",
    fontSize: 13, fontWeight: 700, cursor: "pointer",
    fontFamily: "'Outfit', sans-serif",
  },

  // Error
  errorBox: {
    background: "rgba(220,53,69,0.08)", border: "1px solid rgba(220,53,69,0.2)",
    borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#dc3545",
  },
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function Faculty() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Faculty | null>(null);
  const [form, setForm] = useState<Faculty>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Rooms dropdown
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomSearch, setRoomSearch] = useState("");
  const [showRoomDrop, setShowRoomDrop] = useState(false);
  const [selectedRoomLabel, setSelectedRoomLabel] = useState("");

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Faculty | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ──
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
    } catch {
      setError("Could not load faculty records.");
    }
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

  // ── Open modal ──
  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setTagInput("");
    setFormError("");
    setRoomSearch("");
    setSelectedRoomLabel("");
    setShowRoomDrop(false);
    setShowModal(true);
  }

  function openEdit(f: Faculty) {
    setEditTarget(f);
    setForm({ ...f });
    setTagInput("");
    setFormError("");
    setRoomSearch("");
    setSelectedRoomLabel(f.roomName ? `${f.roomNo} — ${f.roomName}` : f.roomNo || "");
    setShowRoomDrop(false);
    setShowModal(true);
  }

  // ── Save ──
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

  // ── Delete ──
  async function handleDelete() {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await fetch(`${API}/${deleteTarget.id}`, { method: "DELETE" });
      await fetchAll();
      setDeleteTarget(null);
    } catch { setFormError("Delete failed."); }
    finally { setDeleting(false); }
  }

  // ── Tags ──
  function addTag() {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t] }));
    setTagInput("");
  }
  function removeTag(t: string) { setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) })); }

  // ── Filter ──
  const filtered = faculty.filter(f => {
    const q = search.toLowerCase()
    return (
      f.name.toLowerCase().includes(q) ||
      f.department?.toLowerCase().includes(q) ||
      f.designation?.toLowerCase().includes(q) ||
      f.email?.toLowerCase().includes(q) ||
      f.tags?.some(t => t.toLowerCase().includes(q))
    )
  });

  const initials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.hdr}>
        <div style={s.hdrLeft}>
          <Users size={22} strokeWidth={1.8} color="#1A3263" />
          <div>
            <h1 style={s.h1}>Faculty</h1>
            <p style={s.sub}>Manage faculty and office assignments</p>
          </div>
        </div>
        <button style={s.addBtn} onClick={openAdd}
          onMouseEnter={e => {
  e.currentTarget.style.background = "#FAB95B";
  e.currentTarget.style.color = "#1A3263";
}}
onMouseLeave={e => { e.currentTarget.style.background = "#1A3263"; e.currentTarget.style.color = "#F6E7BC"; }}>
          <Plus size={15} strokeWidth={2.5} /> Add Faculty
        </button>
      </div>

      {/* Search */}
      {faculty.length > 0 && (
        <div style={s.searchWrap}>
          <Search size={16} style={s.searchIcon as React.CSSProperties} />
          <input
            style={s.searchInput} placeholder="Search by name, department or designation..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* States */}
      {loading && <div style={s.empty}>Loading faculty records…</div>}
      {!loading && error && <div style={{ ...s.empty, color: "#dc3545" }}>{error}</div>}

      {/* Empty */}
      {!loading && !error && faculty.length === 0 && (
        <div style={s.empty}>No faculty records added yet.</div>
      )}

      {/* No results */}
      {!loading && !error && faculty.length > 0 && filtered.length === 0 && (
        <div style={s.empty}>No results for "{search}".</div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div style={s.grid}>
          {filtered.map(f => (
            <div key={f.id} style={s.card}>

              {/* Card top */}
              <div style={s.cardTop}>
                <div style={s.cardActions}>
                  <button style={s.iconBtn} title="Edit" onClick={() => openEdit(f)}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(250,185,91,0.25)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(246,231,188,0.1)"}>
                    <Pencil size={13} />
                  </button>
                  <button style={s.iconBtn} title="Delete" onClick={() => setDeleteTarget(f)}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(220,53,69,0.25)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(246,231,188,0.1)"}>
                    <Trash2 size={13} />
                  </button>
                </div>

                <div style={s.avatar}>
                  {f.profileImageUrl
                    ? <img src={f.profileImageUrl} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : initials(f.name)
                  }
                </div>
                <div style={s.cardName}>{f.name}</div>
                <div style={s.cardDesig}>{f.designation || "—"}</div>
              </div>

              {/* Card body */}
              <div style={s.cardBody}>
                {f.department && (
                  <div style={s.infoRow}>
                    <span style={s.infoLabel}>Dept</span>
                    <span>{f.department}</span>
                  </div>
                )}
                {f.email && (
                  <div style={s.infoRow}>
                    <span style={s.infoLabel}>Email</span>
                    <span style={{ wordBreak: "break-all" }}>{f.email}</span>
                  </div>
                )}
                {f.phone && (
                  <div style={s.infoRow}>
                    <span style={s.infoLabel}>Phone</span>
                    <span>{f.phone}</span>
                  </div>
                )}
                {f.description && (
                  <div style={{ ...s.infoRow, flexDirection: "column", gap: 2 }}>
                    <span style={s.infoLabel}>About</span>
                    <span style={{ fontSize: 12, color: "#547792", lineHeight: 1.5 }}>{f.description}</span>
                  </div>
                )}

                {/* Room */}
                <div>
                  {f.roomId
                    ? <span style={s.roomPill}><MapPin size={10} /> {f.roomName || f.roomNo} {f.buildingName ? `· ${f.buildingName}` : ""}</span>
                    : <span style={s.noRoom}><MapPin size={10} /> No room assigned</span>
                  }
                </div>

                {/* Tags */}
                {f.tags?.length > 0 && (
                  <div style={s.tagWrap}>
                    {f.tags.map(t => <span key={t} style={s.tag}>{t}</span>)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <div style={s.modalHdr}>
              <h2 style={s.modalTitle}>{editTarget ? "Edit Faculty" : "Add Faculty"}</h2>
              <button onClick={() => setShowModal(false)} style={{ ...s.iconBtn, background: "rgba(246,231,188,0.12)" }}>
                <X size={16} />
              </button>
            </div>

            <div style={s.modalBody}>
              {formError && <div style={s.errorBox}>{formError}</div>}

              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Full Name *</label>
                  <input style={s.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Dr. John Doe" />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Designation</label>
                  <input style={s.input} value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} placeholder="Professor" />
                </div>
              </div>

              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Department</label>
                  <input style={s.input} value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Computer Science" />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Room</label>
                  <div style={{ position: "relative" }} className="room-dropdown-wrap">
                    <input
                      style={s.input}
                      value={showRoomDrop ? roomSearch : selectedRoomLabel}
                      onChange={e => { setRoomSearch(e.target.value); setShowRoomDrop(true); }}
                      onFocus={() => { setRoomSearch(""); setShowRoomDrop(true); }}
                      placeholder="Search and select a room..."
                    />
                    {showRoomDrop && (
                      <div style={{
                        position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                        background: "#fff", borderRadius: 12, zIndex: 200,
                        boxShadow: "0 8px 32px rgba(26,50,99,0.15)",
                        border: "1.5px solid rgba(26,50,99,0.1)",
                        maxHeight: 200, overflowY: "auto",
                      }}>
                        <div
                          style={{ padding: "10px 14px", fontSize: 13, color: "#547792", cursor: "pointer", borderBottom: "1px solid rgba(26,50,99,0.06)" }}
                          onMouseDown={() => { setForm(f => ({ ...f, roomId: null })); setSelectedRoomLabel(""); setShowRoomDrop(false); }}
                        >
                          — No room assigned
                        </div>
                        {rooms
                          .filter(r =>
                            r.name?.toLowerCase().includes(roomSearch.toLowerCase()) ||
                            r.roomNo?.toLowerCase().includes(roomSearch.toLowerCase()) ||
                            r.category?.toLowerCase().includes(roomSearch.toLowerCase()) ||
                            r.buildingName?.toLowerCase().includes(roomSearch.toLowerCase())
                          )
                          .map(r => (
                            <div
                              key={r.id}
                              style={{
                                padding: "10px 14px", cursor: "pointer", fontSize: 13,
                                color: form.roomId === r.id ? "#0992C2" : "#1A3263",
                                background: form.roomId === r.id ? "rgba(10,196,224,0.06)" : "transparent",
                                borderBottom: "1px solid rgba(26,50,99,0.04)",
                                transition: "background 0.15s ease",
                              }}
                              onMouseDown={() => {
                                setForm(f => ({ ...f, roomId: r.id }));
                                setSelectedRoomLabel(`${r.roomNo} — ${r.name}${r.buildingName ? ` · ${r.buildingName}` : ""}`);
                                setShowRoomDrop(false);
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(26,50,99,0.04)"}
                              onMouseLeave={e => e.currentTarget.style.background = form.roomId === r.id ? "rgba(10,196,224,0.06)" : "transparent"}
                            >
                              <div style={{ fontWeight: 600 }}>{r.roomNo} — {r.name}</div>
                              <div style={{ fontSize: 11, color: "#547792", marginTop: 1 }}>
                                {r.category}{r.buildingName ? ` · ${r.buildingName}` : ""}
                              </div>
                            </div>
                          ))
                        }
                        {rooms.filter(r =>
                          r.name?.toLowerCase().includes(roomSearch.toLowerCase()) ||
                          r.roomNo?.toLowerCase().includes(roomSearch.toLowerCase()) ||
                          r.category?.toLowerCase().includes(roomSearch.toLowerCase()) ||
                          r.buildingName?.toLowerCase().includes(roomSearch.toLowerCase())
                        ).length === 0 && (
                          <div style={{ padding: "12px 14px", fontSize: 13, color: "#9aafbf", textAlign: "center" }}>
                            No rooms match "{roomSearch}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Email</label>
                  <input style={s.input} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Phone</label>
                  <input style={s.input} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 99999 99999" />
                </div>
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Profile Image URL</label>
                <input style={s.input} value={form.profileImageUrl} onChange={e => setForm(f => ({ ...f, profileImageUrl: e.target.value }))} placeholder="https://..." />
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Description</label>
                <textarea style={s.textarea} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief bio or office hours..." />
              </div>

              {/* Tags */}
              <div style={s.formGroup}>
                <label style={s.label}>Tags</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input style={{ ...s.input, flex: 1 }} value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Type a tag and press Enter" />
                  <button style={{ ...s.btnPrimary, padding: "10px 16px" }} onClick={addTag}>Add</button>
                </div>
                {form.tags.length > 0 && (
                  <div style={{ ...s.tagWrap, marginTop: 8 }}>
                    {form.tags.map(t => (
                      <span key={t} style={{ ...s.tag, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }} onClick={() => removeTag(t)}>
                        {t} <X size={10} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={s.modalFooter}>
              <button style={s.btnSecondary} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={s.btnPrimary} onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Add Faculty"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div style={{ ...s.modal, maxWidth: 400 }}>
            <div style={s.modalHdr}>
              <h2 style={s.modalTitle}>Delete Faculty</h2>
              <button onClick={() => setDeleteTarget(null)} style={{ ...s.iconBtn, background: "rgba(246,231,188,0.12)" }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: "24px", fontSize: 14, color: "#547792", lineHeight: 1.6 }}>
              Are you sure you want to delete <strong style={{ color: "#1A3263" }}>{deleteTarget.name}</strong>? This action cannot be undone.
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnSecondary} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button style={s.btnDanger} onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}