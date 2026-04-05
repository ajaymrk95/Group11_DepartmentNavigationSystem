import React, { useEffect, useState } from "react";
import { Building2, Plus, Search, X, Layers, MapPin, Pencil } from "lucide-react";

interface Building {
  id: number;
  name: string;
  description: string | null;
  floors: number;
  isAccessible: boolean;
  tags: string[];
  geom: string | null;
  entries: string | null;
}

const BASE  = "http://localhost:8080";
const API   = `${BASE}/api/buildings`;
const token = () => localStorage.getItem("token") ?? "";
const authH = (): Record<string, string> => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token()}`,
});

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputSt: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "10px 14px",
  borderRadius: 10, fontSize: 14, border: "1.5px solid rgba(26,50,99,0.12)",
  outline: "none", fontFamily: "'Outfit', sans-serif", color: "#1A3263", background: "#fff",
};
const labelSt: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: "#547792",
  letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 5,
};
const btnPrimary: React.CSSProperties = {
  padding: "10px 24px", borderRadius: 100, border: "none",
  background: "#1A3263", color: "#F6E7BC", fontSize: 13, fontWeight: 700,
  cursor: "pointer", fontFamily: "'Outfit', sans-serif",
};
const btnSecondary: React.CSSProperties = {
  padding: "10px 24px", borderRadius: 100,
  border: "1.5px solid rgba(26,50,99,0.2)", background: "transparent",
  color: "#547792", fontSize: 13, fontWeight: 600, cursor: "pointer",
  fontFamily: "'Outfit', sans-serif",
};

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, loading }: {
  checked: boolean; onChange: () => void; loading: boolean;
}) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onChange(); }}
      disabled={loading}
      style={{
        width: 42, height: 24, borderRadius: 12, border: "none",
        cursor: loading ? "wait" : "pointer",
        background: checked ? "#34c759" : "#9aafbf",
        position: "relative", transition: "background 0.25s", padding: 0,
        opacity: loading ? 0.6 : 1, flexShrink: 0,
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

// ── Building Modal (Add + Edit) ───────────────────────────────────────────────
function BuildingModal({ building, onClose, onSaved }: {
  building?: Building; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!building;
  const [form, setForm] = useState({
    name:         building?.name ?? "",
    description:  building?.description ?? "",
    floors:       String(building?.floors ?? 1),
    isAccessible: building?.isAccessible ?? true,
    tags:         building?.tags?.join(", ") ?? "",
  });
  const [geomText,    setGeomText]    = useState("");
  const [entriesText, setEntriesText] = useState("");
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const parseJson = (text: string, label: string): unknown => {
    try {
      return JSON.parse(text.trim());
    } catch {
      throw new Error(`${label}: invalid JSON.`);
    }
  };

  async function handleSubmit() {
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (!isEdit && !geomText.trim()) { setError("Geometry JSON is required."); return; }
    setSaving(true); setError("");
    try {
      let geoJson = null;
      if (geomText.trim()) {
        const parsed = parseJson(geomText, "Geometry") as Record<string, unknown>;
        delete parsed.crs; // RFC 7946 — remove deprecated crs field
        geoJson = parsed;
      }

      let entries = null;
      if (entriesText.trim()) {
        entries = parseJson(entriesText, "Entries");
      }

      const payload: Record<string, unknown> = {
        name:         form.name.trim(),
        description:  form.description.trim() || null,
        floors:       parseInt(form.floors) || 1,
        isAccessible: form.isAccessible,
        tags:         form.tags.split(",").map(t => t.trim()).filter(Boolean),
      };
      if (geoJson  !== null) payload.geoJson  = geoJson;
      if (entries  !== null) payload.entries  = entries;

      const url = isEdit ? `${API}/${building!.id}` : API;
      const res = await fetch(url, {
        method:  isEdit ? "PUT" : "POST",
        headers: authH(),
        body:    JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      onSaved(); onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally { setSaving(false); }
  }

  const textareaSt: React.CSSProperties = {
    ...inputSt,
    resize: "vertical",
    minHeight: 100,
    fontFamily: "'Courier New', monospace",
    fontSize: 12,
    lineHeight: 1.5,
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(11,45,114,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(3px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(11,45,114,0.25)" }}>

        <div style={{ background: "#0B2D72", padding: "22px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#F6E7BC", margin: 0 }}>
            {isEdit ? "Edit Building" : "Add Building"}
          </h2>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(246,231,188,0.12)", color: "#F6E7BC", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 24, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          {error && (
            <div style={{ background: "rgba(220,53,69,0.08)", border: "1px solid rgba(220,53,69,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#dc3545" }}>{error}</div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelSt}>Name *</label><input style={inputSt} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. ELHC" /></div>
            <div><label style={labelSt}>Floors</label><input style={inputSt} type="number" min="1" value={form.floors} onChange={e => set("floors", e.target.value)} /></div>
          </div>

          <div>
            <label style={labelSt}>Description</label>
            <textarea style={{ ...inputSt, resize: "vertical", minHeight: 72 }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Brief description..." />
          </div>

          <div>
            <label style={labelSt}>Tags <span style={{ fontWeight: 400, color: "#9aafbf" }}>(comma separated)</span></label>
            <input style={inputSt} value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="lab, engineering" />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Toggle checked={form.isAccessible} loading={false} onChange={() => set("isAccessible", !form.isAccessible)} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1A3263" }}>
              Accessible —{" "}
              <span style={{ fontWeight: 400, color: form.isAccessible ? "#34c759" : "#9aafbf" }}>
                {form.isAccessible ? "Yes" : "No"}
              </span>
            </span>
          </div>

          <div>
            <label style={labelSt}>
              Geometry (GeoJSON){isEdit ? " — leave empty to keep existing" : " *"}
            </label>
            <textarea
              style={textareaSt}
              value={geomText}
              onChange={e => setGeomText(e.target.value)}
              placeholder={'{\n  "type": "MultiPolygon",\n  "coordinates": [...]\n}'}
              spellCheck={false}
            />
          </div>

          <div>
            <label style={labelSt}>
              Entry Points (JSON){isEdit ? " — leave empty to keep existing" : ""}
              {" "}<span style={{ fontWeight: 400, color: "#9aafbf" }}>[[lng, lat], ...]</span>
            </label>
            <textarea
              style={textareaSt}
              value={entriesText}
              onChange={e => setEntriesText(e.target.value)}
              placeholder={"[[75.9337, 11.3226], [75.9338, 11.3227]]"}
              spellCheck={false}
            />
          </div>
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(26,50,99,0.08)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button style={btnSecondary} onClick={onClose}>Cancel</button>
          <button style={{ ...btnPrimary, opacity: saving ? 0.65 : 1 }} onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Building"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Buildings() {
  const [buildings,  setBuildings]  = useState<Building[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [showAdd,    setShowAdd]    = useState(false);
  const [editTarget, setEditTarget] = useState<Building | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState("");

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await fetch(API, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error();
      setBuildings(await res.json());
    } catch { setFetchError("Could not load buildings."); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchAll(); }, []);

  async function handleToggleAccess(b: Building) {
    const newValue = !b.isAccessible;
    setTogglingId(b.id);
    setBuildings(prev => prev.map(x => x.id === b.id ? { ...x, isAccessible: newValue } : x));
    try {
      const res = await fetch(`${BASE}/api/buildings/${b.id}/accessible`, {
        method:  "PATCH",
        headers: authH(),
        body:    JSON.stringify({ isAccessible: newValue }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
    } catch (e: unknown) {
      setBuildings(prev => prev.map(x => x.id === b.id ? { ...x, isAccessible: b.isAccessible } : x));
      console.error("Toggle failed:", e instanceof Error ? e.message : String(e));
    } finally {
      setTogglingId(null);
    }
  }

  const filtered = buildings.filter(b => {
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q) ||
      b.tags?.some(t => t.toLowerCase().includes(q))
    );
  });

  const emptyCard: React.CSSProperties = {
    background: "#fff", borderRadius: 14, padding: "56px 24px",
    textAlign: "center", color: "#9aafbf", fontSize: 14,
    boxShadow: "0 1px 4px rgba(26,50,99,.07)",
  };

  return (
    <div style={{ padding: "32px 28px 40px", width: "100%", boxSizing: "border-box", fontFamily: "'Outfit', sans-serif", color: "#1A3263" }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Building2 size={22} strokeWidth={1.8} color="#1A3263" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight m-0 leading-none">Buildings</h1>
            <p className="text-[13px] text-[#547792] mt-0.5 m-0">Manage registered buildings</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex w-full sm:w-auto justify-center items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#1A3263] text-[#F6E7BC] text-[13px] font-bold border-none cursor-pointer transition-all duration-200 hover:bg-[#FAB95B] hover:text-[#1A3263]"
        >
          <Plus size={15} strokeWidth={2.5} /> Add Building
        </button>
      </div>

      {/* Stats */}
      {!loading && buildings.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "Total",        value: buildings.length },
            { label: "Accessible",   value: buildings.filter(b => b.isAccessible).length },
            { label: "Inaccessible", value: buildings.filter(b => !b.isAccessible).length },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "14px 20px", boxShadow: "0 1px 4px rgba(26,50,99,.07)", minWidth: 110 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1A3263" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#547792", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {buildings.length > 0 && (
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#547792", pointerEvents: "none" }} />
          <input
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px 10px 38px", borderRadius: 100, border: "1.5px solid rgba(26,50,99,0.12)", outline: "none", fontFamily: "inherit", fontSize: 14, color: "#1A3263", background: "#fff" }}
            placeholder="Search by name, description or tag..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* States */}
      {fetchError && <div style={{ ...emptyCard, color: "#dc3545" }}>{fetchError}</div>}
      {loading    && <div style={emptyCard}>Loading buildings…</div>}
      {!loading && !fetchError && buildings.length === 0 && <div style={emptyCard}>No buildings added yet.</div>}
      {!loading && !fetchError && buildings.length > 0 && filtered.length === 0 && <div style={emptyCard}>No results for "{search}".</div>}

      {/* Table */}
      {!loading && !fetchError && filtered.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(26,50,99,.07)", overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 700, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f7f4ef", borderBottom: "1px solid #ede8dc" }}>
                {["Building", "Floors", "Tags", "Accessible", "Entries", ""].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#547792", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}
                  style={{ borderBottom: "1px solid #f0ebe3" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#faf8f4")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}>

                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</div>
                    {b.description && <div style={{ fontSize: 12, color: "#547792", marginTop: 2 }}>{b.description}</div>}
                  </td>

                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "rgba(26,50,99,.07)", color: "#1A3263" }}>
                      <Layers size={11} /> {b.floors}
                    </span>
                  </td>

                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {b.tags?.length > 0
                        ? b.tags.slice(0, 3).map(t => (
                          <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: "rgba(26,50,99,.07)", color: "#1A3263", border: "1px solid rgba(26,50,99,.1)" }}>{t}</span>
                        ))
                        : <span style={{ fontSize: 12, color: "#9aafbf" }}>—</span>
                      }
                      {b.tags?.length > 3 && <span style={{ fontSize: 11, color: "#547792" }}>+{b.tags.length - 3}</span>}
                    </div>
                  </td>

                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Toggle
                        checked={b.isAccessible}
                        loading={togglingId === b.id}
                        onChange={() => handleToggleAccess(b)}
                      />
                      <span style={{ fontSize: 12, fontWeight: 600, color: b.isAccessible ? "#34c759" : "#9aafbf" }}>
                        {b.isAccessible ? "Yes" : "No"}
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: "13px 16px" }}>
                    {b.entries
                      ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#0992C2" }}><MapPin size={11} /> Mapped</span>
                      : <span style={{ fontSize: 12, color: "#9aafbf" }}>—</span>
                    }
                  </td>

                  <td style={{ padding: "13px 16px" }}>
                    <button
                      onClick={() => setEditTarget(b)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#eef2ff", color: "#4361ee", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#dde4ff")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#eef2ff")}
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd    && <BuildingModal onClose={() => setShowAdd(false)} onSaved={fetchAll} />}
      {editTarget && <BuildingModal building={editTarget} onClose={() => setEditTarget(null)} onSaved={fetchAll} />}
    </div>
  );
}