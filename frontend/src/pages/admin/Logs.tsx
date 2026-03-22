import React, { useState, useEffect } from "react";
import { ScrollText, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";

type Action = "CREATE" | "UPDATE" | "DELETE";
interface LogEntry {
  id: number;
  action: Action;
  entityType: string;
  entityId: number | null;
  details: string;
  timestamp: string;
}

const PAGE_SIZE    = 15;
const ACTIONS      = ["All", "CREATE", "UPDATE", "DELETE"];
const ENTITY_TYPES = ["All", "Building", "Room", "Faculty", "Location"];

const ACTION_COLOR: Record<Action, { bg: string; color: string; border: string }> = {
  CREATE: { bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" },
  UPDATE: { bg: "#fef9c3", color: "#ca8a04", border: "#fde68a" },
  DELETE: { bg: "#fee2e2", color: "#dc2626", border: "#fecaca" },
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

export default function Logs() {
  const [logs,    setLogs]    = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);
  const [search,  setSearch]  = useState("");
  const [action,  setAction]  = useState("All");
  const [type,    setType]    = useState("All");
  const [page,    setPage]    = useState(1);

  async function fetchData() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("http://localhost:8080/api/logs", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setLogs(await res.json());
      setFetched(true); setPage(1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  function fetchLogs() { fetchData(); }
  useEffect(() => { fetchData(); }, []);

  const filtered = logs.filter((l) =>
    (action === "All" || l.action === action) &&
    (type   === "All" || l.entityType === type) &&
    (search === "" ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.entityType.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current    = Math.min(page, totalPages);
  const rows       = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - current) <= 1)
    .reduce<(number | "…")[]>((acc, p, i, arr) => {
      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
      acc.push(p); return acc;
    }, []);

  return (
    <div style={{ padding: "32px 28px 40px", width: "100%", boxSizing: "border-box", fontFamily: "'Outfit', sans-serif", color: "#1A3263" }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
          <ScrollText size={22} strokeWidth={1.8} style={{ opacity: 0.5 }} />
          Logs
        </h1>
        <p style={{ fontSize: 13, color: "#547792", margin: "5px 0 0" }}>Audit trail of all admin actions</p>
      </div>

      {/* Summary chips */}
      {fetched && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {[
            { label: "total",   count: logs.length,                              color: "#1A3263" },
            { label: "creates", count: logs.filter(l => l.action==="CREATE").length, color: "#16a34a" },
            { label: "updates", count: logs.filter(l => l.action==="UPDATE").length, color: "#ca8a04" },
            { label: "deletes", count: logs.filter(l => l.action==="DELETE").length, color: "#dc2626" },
          ].map(({ label, count, color }) => (
            <div key={label} style={{ fontSize: 12, fontWeight: 500, padding: "4px 14px", borderRadius: 20, background: "#fff", boxShadow: "0 1px 3px rgba(26,50,99,.08)", color: "#547792" }}>
              <span style={{ fontWeight: 700, color, marginRight: 3 }}>{count}</span>{label}
            </div>
          ))}
        </div>
      )}

      {/* ── Toolbar — all in one row ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>

        {/* Search — grows to fill available space */}
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9aafbf", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search details or entity..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px 9px 34px", border: "1.5px solid #e2ddd6", borderRadius: 10, fontSize: 13, color: "#1A3263", background: "#fff", outline: "none", fontFamily: "inherit" }}
          />
        </div>

        {/* Action select */}
        <select
          value={action}
          onChange={(e) => { setAction(e.target.value); setPage(1); }}
          style={{ padding: "9px 12px", border: "1.5px solid #e2ddd6", borderRadius: 10, fontSize: 13, color: "#1A3263", background: "#fff", outline: "none", fontFamily: "inherit", cursor: "pointer", flexShrink: 0 }}
        >
          {ACTIONS.map((a) => <option key={a} value={a}>{a === "All" ? "All Actions" : a}</option>)}
        </select>

        {/* Type select */}
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          style={{ padding: "9px 12px", border: "1.5px solid #e2ddd6", borderRadius: 10, fontSize: 13, color: "#1A3263", background: "#fff", outline: "none", fontFamily: "inherit", cursor: "pointer", flexShrink: 0 }}
        >
          {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}
        </select>

        {/* Refresh button */}
        <button
          onClick={fetchLogs}
          disabled={loading}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: "none", background: "#1A3263", color: "#EDE8DC", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.65 : 1, fontFamily: "inherit", flexShrink: 0, boxShadow: "0 1px 4px rgba(26,50,99,.2)" }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Loading..." : fetched ? "Refresh" : "Load Logs"}
        </button>
      </div>

      {/* ── Panel ── */}
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(26,50,99,.07)", overflow: "hidden" }}>

        {error && (
          <div style={{ padding: "12px 20px", fontSize: 13, color: "#dc2626", background: "#fef2f2", borderBottom: "1px solid #fee2e2" }}>⚠ {error}</div>
        )}

        {!fetched && !loading && (
          <div style={{ padding: "56px 24px", textAlign: "center", color: "#9aafbf", fontSize: 14 }}>
            Click <strong style={{ color: "#1A3263" }}>Load Logs</strong> to fetch the audit trail.
          </div>
        )}
        {loading  && <div style={{ padding: "56px 24px", textAlign: "center", color: "#9aafbf", fontSize: 14 }}>Loading logs...</div>}
        {fetched && !loading && rows.length === 0 && (
          <div style={{ padding: "56px 24px", textAlign: "center", color: "#9aafbf", fontSize: 14 }}>No entries match your filters.</div>
        )}

        {fetched && !loading && rows.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f7f4ef", borderBottom: "1px solid #ede8dc" }}>
                {["#", "Action", "Entity", "ID", "Details", "Timestamp"].map((h) => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#547792", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((l, i) => {
                const c = ACTION_COLOR[l.action];
                return (
                  <tr
                    key={l.id}
                    style={{ borderBottom: "1px solid #f0ebe3" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#faf8f4")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <td style={{ padding: "11px 16px", fontSize: 12, color: "#9aafbf", width: 40 }}>
                      {(current - 1) * PAGE_SIZE + i + 1}
                    </td>
                    <td style={{ padding: "11px 16px", width: 110 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, border: `1px solid ${c.border}`, background: c.bg, color: c.color, letterSpacing: "0.06em" }}>
                        {l.action}
                      </span>
                    </td>
                    <td style={{ padding: "11px 16px", width: 130 }}>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 10px", borderRadius: 20, background: "rgba(26,50,99,.08)", color: "#1A3263" }}>
                        {l.entityType}
                      </span>
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: 13, color: "#547792", width: 60 }}>{l.entityId ?? "—"}</td>
                    <td style={{ padding: "11px 16px", fontSize: 13, color: "#2d4a6e" }}>{l.details}</td>
                    <td style={{ padding: "11px 16px", fontSize: 12, color: "#547792", whiteSpace: "nowrap", width: 180 }}>{fmt(l.timestamp)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {fetched && filtered.length > PAGE_SIZE && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid #ede8dc", background: "#faf8f4", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#547792" }}>
              Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <PgBtn onClick={() => setPage(p => p - 1)} disabled={current === 1}><ChevronLeft size={14} /></PgBtn>
              {pageNums.map((p, i) =>
                p === "…"
                  ? <span key={`e${i}`} style={{ fontSize: 12, color: "#9aafbf", padding: "0 2px" }}>…</span>
                  : <PgBtn key={p} active={p === current} onClick={() => setPage(p as number)}>{p}</PgBtn>
              )}
              <PgBtn onClick={() => setPage(p => p + 1)} disabled={current === totalPages}><ChevronRight size={14} /></PgBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Pagination button ── */
function PgBtn({ children, onClick, disabled, active }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 30, height: 30, borderRadius: 7, cursor: disabled ? "not-allowed" : "pointer",
        border: active ? "1.5px solid #1A3263" : "1.5px solid #e2ddd6",
        background: active ? "#1A3263" : "#fff",
        color: active ? "#EDE8DC" : "#1A3263",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontFamily: "inherit", fontWeight: active ? 600 : 400,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}