import React from "react";
import { Building2, Layers, DoorOpen, ScrollText, TrendingUp, Clock } from "lucide-react";

type Building = { id: number; name: string; description: string; floors: number; rooms: number };
type LogEntry  = { id: number; action: "CREATE" | "UPDATE" | "DELETE"; details: string };

const buildings: Building[] = [
  { id: 1, name: "ELHC", description: "Electronics & Hardware Lab Complex",   floors: 3, rooms: 6 },
  { id: 2, name: "LECB", description: "Lecture Hall Complex B",                floors: 0, rooms: 0 },
  { id: 3, name: "MAIN", description: "Administrative & Main Academic Block",  floors: 0, rooms: 0 },
];

const totalFloors = buildings.reduce((s, b) => s + b.floors, 0);
const totalRooms  = buildings.reduce((s, b) => s + b.rooms,  0);

const categoryData: Record<string, number> = { Classroom: 4, Toilet: 2 };
const maxCategory = Math.max(...Object.values(categoryData));

const logs: LogEntry[] = [
  { id: 1, action: "UPDATE", details: "Updated room category to classroom" },
  { id: 2, action: "CREATE", details: "Added new floor with path and POI data" },
  { id: 3, action: "DELETE", details: "Removed unused room entry" },
  { id: 4, action: "UPDATE", details: "Updated floor count from 2 to 3" },
  { id: 5, action: "CREATE", details: "Initial building record created" },
];

const actionColor: Record<string, string> = {
  UPDATE: "#E67E22",
  CREATE: "#27AE60",
  DELETE: "#E74C3C",
};

const stats = [
  { label: "BUILDINGS",   sub: "registered", value: buildings.length, icon: Building2,  accent: "#1A3263" },
  { label: "FLOORS",      sub: "mapped",      value: totalFloors,      icon: Layers,     accent: "#1A3263" },
  { label: "ROOMS",       sub: "assigned",    value: totalRooms,       icon: DoorOpen,   accent: "#FAB95B" },
  { label: "LOG ENTRIES", sub: "actions",     value: logs.length,      icon: ScrollText, accent: "#1A3263" },
];

export default function Dashboard() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        @keyframes db-fadein {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes db-bar-expand {
          from { width: 0%; }
        }

        .db-page {
          font-family: 'Outfit', sans-serif;
          color: #1A3263;
          padding: 32px 28px 40px;
          width: 100%;
          min-height: 100%;
          box-sizing: border-box;
        }

        /* ── Stat cards grid ── */
        .db-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 18px;
          width: 100%;
        }

        .db-card {
          background: #fff;
          border-radius: 14px;
          padding: 20px 18px 18px;
          box-shadow: 0 1px 4px rgba(26,50,99,.07);
          cursor: default;
          animation: db-fadein .35s ease both;
          transition: box-shadow .2s, transform .2s;
        }
        .db-card:nth-child(1) { animation-delay: 0ms; }
        .db-card:nth-child(2) { animation-delay: 60ms; }
        .db-card:nth-child(3) { animation-delay: 120ms; }
        .db-card:nth-child(4) { animation-delay: 180ms; }
        .db-card:hover {
          box-shadow: 0 6px 20px rgba(26,50,99,.11);
          transform: translateY(-1px);
        }

        .db-icon-box {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        /* ── Bottom grid ── */
        .db-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          width: 100%;
        }

        .db-panel {
          background: #fff;
          border-radius: 14px;
          padding: 22px 22px 26px;
          box-shadow: 0 1px 4px rgba(26,50,99,.07);
          min-width: 0;
          animation: db-fadein .4s ease both;
          animation-delay: 220ms;
        }

        .db-panel-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #1A3263;
          margin: 0 0 14px;
        }

        /* ── Building rows ── */
        .db-building-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 12px;
          border-radius: 10px;
          background: rgba(237,232,220,.55);
          margin-bottom: 8px;
          gap: 12px;
          transition: background .15s;
        }
        .db-building-row:last-child { margin-bottom: 0; }
        .db-building-row:hover { background: #ede8dc; }

        .db-badges { display: flex; gap: 7px; flex-shrink: 0; }

        .db-badge {
          font-size: 12px;
          padding: 3px 10px;
          border-radius: 20px;
          font-weight: 500;
          white-space: nowrap;
        }

        /* ── Bar chart ── */
        .db-bar-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 11px;
        }
        .db-bar-track {
          flex: 1;
          height: 8px;
          border-radius: 99px;
          background: #EDE8DC;
          overflow: hidden;
          min-width: 0;
        }
        .db-bar-fill {
          height: 100%;
          border-radius: 99px;
          background: #1A3263;
          animation: db-bar-expand .7s cubic-bezier(.4,0,.2,1) both;
          animation-delay: 300ms;
        }

        .db-divider {
          height: 1px;
          background: rgba(237,232,220,.9);
          margin: 16px 0;
        }

        /* ── Log rows ── */
        .db-log-row {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-bottom: 9px;
        }
        .db-log-row:last-child { margin-bottom: 0; }

        .db-action-pill {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 5px;
          border: 1px solid;
          flex-shrink: 0;
          letter-spacing: .05em;
          margin-top: 2px;
        }

        /* ── Responsive ── */
        @media (max-width: 1200px) {
          .db-page { padding: 24px 20px 36px; }
        }
        @media (max-width: 1024px) {
          .db-stats { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .db-bottom { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .db-stats { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="db-page">

        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", margin: 0, lineHeight: 1.2 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "#547792", margin: "5px 0 0" }}>
            Atlas Indoor Navigation — NIT Calicut
          </p>
        </div>

        {/* Stat cards */}
        <div className="db-stats">
          {stats.map((s) => (
            <div key={s.label} className="db-card">
              <div className="db-icon-box" style={{ background: s.accent }}>
                <s.icon
                  size={22}
                  strokeWidth={1.8}
                  color={s.accent === "#FAB95B" ? "#1A3263" : "#EDE8DC"}
                />
              </div>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "0 0 4px", lineHeight: 1, color: "#1A3263" }}>
                {s.value}
              </p>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "#547792", margin: "0 0 2px", textTransform: "uppercase" }}>
                {s.label}
              </p>
              <p style={{ fontSize: 11, color: "#9aafbf", margin: 0 }}>
                {s.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom grid */}
        <div className="db-bottom">

          {/* Buildings */}
          <div className="db-panel">
            <p className="db-panel-title">
              <Building2 size={16} style={{ opacity: .55 }} />
              Buildings
            </p>
            {buildings.map((b) => (
              <div key={b.id} className="db-building-row">
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "#1A3263" }}>
                    {b.name}
                  </p>
                  <p style={{ fontSize: 12, color: "#547792", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {b.description}
                  </p>
                </div>
                <div className="db-badges">
                  <span className="db-badge" style={{ background: "rgba(26,50,99,.1)", color: "#1A3263" }}>
                    {b.floors} floors
                  </span>
                  <span className="db-badge" style={{ background: "rgba(250,185,91,.2)", color: "#8B5E00" }}>
                    {b.rooms} rooms
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Room Categories + Recent Activity */}
          <div className="db-panel">
            <p className="db-panel-title">
              <TrendingUp size={16} style={{ opacity: .55 }} />
              Room Categories
            </p>

            {Object.entries(categoryData).map(([cat, count]) => (
              <div key={cat} className="db-bar-row">
                <span style={{ fontSize: 13, color: "#1A3263", width: 80, flexShrink: 0 }}>
                  {cat}
                </span>
                <div className="db-bar-track">
                  <div
                    className="db-bar-fill"
                    style={{ width: `${(count / maxCategory) * 100}%` }}
                  />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1A3263", width: 14, textAlign: "right", flexShrink: 0 }}>
                  {count}
                </span>
              </div>
            ))}

            <div className="db-divider" />

            <p className="db-panel-title" style={{ marginBottom: 12 }}>
              <Clock size={16} style={{ opacity: .55 }} />
              Recent Activity
            </p>

            {logs.map((log) => (
              <div key={log.id} className="db-log-row">
                <span
                  className="db-action-pill"
                  style={{
                    background: actionColor[log.action] + "20",
                    color: actionColor[log.action],
                    borderColor: actionColor[log.action] + "60",
                  }}
                >
                  {log.action}
                </span>
                <span style={{ fontSize: 13, color: "#547792", lineHeight: 1.5 }}>
                  {log.details}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}