import React, { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, ChevronDown } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token") ?? "";
const authH = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token()}`,
});

interface Report {
  id: number;
  type: string;
  description: string;
  status: "OPEN" | "REVIEWED" | "RESOLVED";
  createdAt: string;
}

// Color palette aligned with theme
const COLORS = {
  navy: "#1E293B",
  steel: "#64748B",
  cream: "#F8FAFC",
  amber: "#F59E0B",
  lightSteel: "#F1F5F9",
  darkSteel: "#334155",
  accentOpen: "#EF4444",
  accentReviewed: "#F59E0B",
  accentResolved: "#10B981",
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; light: string }> = {
  OPEN: {
    color: COLORS.accentOpen,
    bg: "rgba(239, 68, 68, 0.08)",
    light: "rgba(239, 68, 68, 0.04)",
  },
  REVIEWED: {
    color: COLORS.accentReviewed,
    bg: "rgba(245, 158, 11, 0.08)",
    light: "rgba(245, 158, 11, 0.04)",
  },
  RESOLVED: {
    color: COLORS.accentResolved,
    bg: "rgba(16, 185, 129, 0.08)",
    light: "rgba(16, 185, 129, 0.04)",
  },
};

const STATUSES = ["OPEN", "REVIEWED", "RESOLVED"] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "REVIEWED" | "RESOLVED">(
    "ALL"
  );
  const [updating, setUpdating] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState("");

  async function fetchAll() {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch(`${BASE}/api/reports`, { headers: authH() });
      if (!res.ok) throw new Error();
      setReports(await res.json());
    } catch {
      setFetchError("Could not load reports.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function handleStatusChange(id: number, status: string) {
    setUpdating(id);
    // optimistic update
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: status as Report["status"] } : r
      )
    );
    try {
      const res = await fetch(`${BASE}/api/reports/${id}/status`, {
        method: "PATCH",
        headers: authH(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      fetchAll(); // revert by refetching
    } finally {
      setUpdating(null);
    }
  }

  const filtered =
    filter === "ALL"
      ? reports
      : reports.filter((r) => r.status === filter);

  const counts = {
    ALL: reports.length,
    OPEN: reports.filter((r) => r.status === "OPEN").length,
    REVIEWED: reports.filter((r) => r.status === "REVIEWED").length,
    RESOLVED: reports.filter((r) => r.status === "RESOLVED").length,
  };

  const emptyState = {
    container: {
      borderRadius: 12,
      padding: "56px 24px",
      textAlign: "center" as const,
      color: COLORS.steel,
      fontSize: 14,
      border: `1px solid ${COLORS.lightSteel}`,
    },
  };

  return (
    <div
      style={{
        padding: "40px 32px",
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: COLORS.navy,
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 32,
          gap: 24,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 0 }}>
  <h1
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      margin: 0,
      color: "#1A3263", // IMPORTANT
      fontFamily: "'Outfit', sans-serif", // MATCH LOGS
    }}
  >
    <AlertCircle size={22} strokeWidth={1.8} style={{ opacity: 0.5 }} />
    Reports
  </h1>

  <p
    style={{
      fontSize: 13,
      color: "#547792", // SAME as Logs
      margin: "5px 0 0",
      fontFamily: "'Outfit', sans-serif",
    }}
  >
    Manage user-submitted issue reports
  </p>
</div>
          
        </div>

        <button
  onClick={fetchAll}
  disabled={loading}
  style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 18px",
    borderRadius: 999, // pill shape
    border: "none",
    background: "#1A3263", // navy
    color: "#EDE8DC", // light cream text
    fontSize: 14,
    fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
    fontFamily: "'Outfit', sans-serif",
    boxShadow: "0 4px 10px rgba(26,50,99,0.25)",
    transition: "all 0.2s ease",
  }}
  onMouseEnter={(e) => {
    if (!loading) {
      e.currentTarget.style.background = "#16284f"; // darker navy
      e.currentTarget.style.transform = "translateY(-1px)";
    }
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = "#1A3263";
    e.currentTarget.style.transform = "translateY(0)";
  }}
>
  <RefreshCw
    size={14}
    style={{
      animation: loading ? "spin 1s linear infinite" : "none",
    }}
  />
  Refresh
</button>
      </div>

      {/* Filter Stats */}
      {!loading && reports.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          {(["ALL", "OPEN", "REVIEWED", "RESOLVED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                background:
                  filter === s ? COLORS.navy : "white",
                color: filter === s ? COLORS.amber : COLORS.steel,
                borderRadius: 8,
                padding: "14px 20px",
                border: `1.5px solid ${
                  filter === s ? COLORS.navy : COLORS.lightSteel
                }`,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 600,
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 100,
              }}
              onMouseEnter={(e) => {
                if (filter !== s) {
                  e.currentTarget.style.borderColor = COLORS.steel;
                  e.currentTarget.style.background = COLORS.lightSteel;
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== s) {
                  e.currentTarget.style.borderColor = COLORS.lightSteel;
                  e.currentTarget.style.background = "white";
                }
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>
                {counts[s]}
              </div>
              <div
                style={{
                  fontSize: 11,
                  marginTop: 6,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  opacity: 0.8,
                }}
              >
                {s === "ALL" ? "Total" : s}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading & Error States */}
      {fetchError && (
        <div
          style={{
            ...emptyState.container,
            color: COLORS.accentOpen,
            border: `1.5px solid ${COLORS.accentOpen}`,
            background: `rgba(239, 68, 68, 0.04)`,
          }}
        >
          {fetchError}
        </div>
      )}
      {loading && (
        <div style={emptyState.container}>
          <div
            style={{
              display: "inline-block",
              animation: "spin 1s linear infinite",
            }}
          >
            ⏳
          </div>
          <p style={{ marginTop: 12 }}>Loading reports…</p>
        </div>
      )}
      {!loading && !fetchError && reports.length === 0 && (
        <div style={emptyState.container}>No reports yet.</div>
      )}
      {!loading && !fetchError && reports.length > 0 && filtered.length === 0 && (
        <div style={emptyState.container}>
          No {filter.toLowerCase()} reports.
        </div>
      )}

      {/* Reports Table */}
      {!loading && !fetchError && filtered.length > 0 && (
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 12,
            border: `1px solid ${COLORS.lightSteel}`,
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
            }}
          >
            <thead>
              <tr
                style={{
                  background: COLORS.lightSteel,
                  borderBottom: `1px solid ${COLORS.lightSteel}`,
                }}
              >
                {["ID", "Type", "Description", "Submitted", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        color: COLORS.steel,
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: `1px solid ${COLORS.lightSteel}`,
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = COLORS.cream;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* ID */}
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 13,
                      color: COLORS.steel,
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    #{r.id}
                  </td>

                  {/* Type */}
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "4px 12px",
                        borderRadius: 6,
                        background: COLORS.lightSteel,
                        color: COLORS.darkSteel,
                        border: `1px solid ${COLORS.lightSteel}`,
                        whiteSpace: "nowrap",
                        display: "inline-block",
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {r.type}
                    </span>
                  </td>

                  {/* Description */}
                  <td
                    style={{
                      padding: "14px 16px",
                      maxWidth: 350,
                      color: COLORS.navy,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        wordBreak: "break-word",
                      }}
                    >
                      {r.description}
                    </div>
                  </td>

                  {/* Created At */}
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 12,
                      color: COLORS.steel,
                      whiteSpace: "nowrap",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatDate(r.createdAt)}
                  </td>

                  {/* Status */}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <select
                        value={r.status}
                        disabled={updating === r.id}
                        onChange={(e) =>
                          handleStatusChange(r.id, e.target.value)
                        }
                        style={{
                          padding: "6px 12px",
                          paddingRight: "28px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          border: `1.5px solid ${
                            STATUS_CONFIG[r.status].color
                          }`,
                          background: STATUS_CONFIG[r.status].light,
                          color: STATUS_CONFIG[r.status].color,
                          cursor: updating === r.id ? "not-allowed" : "pointer",
                          fontFamily: "inherit",
                          appearance: "none",
                          outline: "none",
                          opacity: updating === r.id ? 0.6 : 1,
                          transition: "all 0.2s ease",
                        }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        style={{
                          position: "absolute",
                          right: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                          color: STATUS_CONFIG[r.status].color,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        select::-webkit-scrollbar {
          width: 8px;
        }
        select::-webkit-scrollbar-track {
          background: ${COLORS.cream};
        }
        select::-webkit-scrollbar-thumb {
          background: ${COLORS.steel};
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}