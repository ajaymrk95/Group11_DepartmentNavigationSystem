import React from "react";
import { Layers, DoorOpen, Users, Map, MapPin, ScrollText } from "lucide-react";
 
const page: React.CSSProperties = {
  fontFamily: "'Outfit', sans-serif",
  color: "#1A3263",
  padding: "32px 28px",
  width: "100%",
  boxSizing: "border-box",
};
const hdr: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 12, marginBottom: 24,
};
const h1: React.CSSProperties = {
  fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", margin: 0,
};
const sub: React.CSSProperties = { fontSize: 13, color: "#547792", margin: "3px 0 0" };
const empty: React.CSSProperties = {
  background: "#fff", borderRadius: 14, padding: "48px 24px",
  textAlign: "center", color: "#9aafbf", fontSize: 14,
  boxShadow: "0 1px 4px rgba(26,50,99,.07)",
};

export default function Faculty() {
  return (
    <div style={page}>
      <div style={hdr}>
        <Users size={22} strokeWidth={1.8} />
        <div><h1 style={h1}>Faculty</h1><p style={sub}>Manage faculty and office assignments</p></div>
      </div>
      <div style={empty}>No faculty records added yet.</div>
    </div>
  );
}