import React from "react";

export const API = `${import.meta.env.VITE_API_URL}/api/rooms`;

// ─── Category colours ─────────────────────────────────────────────────────────
export const catColor: Record<string, { bg: string; color: string }> = {
  classroom:      { bg: "#e8f4fd", color: "#1a73e8" },
  lab:            { bg: "#e6f4ea", color: "#1e8e3e" },
  toilet:         { bg: "#fce8e6", color: "#d93025" },
  "seminar hall": { bg: "#fef7e0", color: "#f29900" },
  office:         { bg: "#f3e8fd", color: "#8430ce" },
};

export const defaultCat = { bg: "#f0f4f9", color: "#547792" };

// ─── Shared inline styles ─────────────────────────────────────────────────────
export const S: Record<string, React.CSSProperties> = {
  // Layout
  page:        { fontFamily: "'Outfit', sans-serif", color: "#1A3263", padding: "32px 28px", width: "100%", boxSizing: "border-box" },
  hdr:         { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  hdrLeft:     { display: "flex", alignItems: "center", gap: 12 },
  h1:          { fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 },
  sub:         { fontSize: 13, color: "#547792", margin: "3px 0 0" },

  // Buttons
  addBtn:      { display: "flex", alignItems: "center", gap: 8, background: "#1A3263", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" },
  iconBtn:     { border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  submitBtn:   { width: "100%", background: "#1A3263", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", marginTop: 8 },
  closeBtn:    { background: "none", border: "none", cursor: "pointer", color: "#547792", display: "flex" },

  // Filter bar
  filterBar:   { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" as const },
  searchWrap:  { display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #dde6f0", borderRadius: 10, padding: "8px 14px", flex: 1, minWidth: 200 },
  searchInput: { border: "none", outline: "none", fontSize: 14, color: "#1A3263", background: "transparent", width: "100%", fontFamily: "'Outfit', sans-serif" },
  select:      { background: "#fff", border: "1px solid #dde6f0", borderRadius: 10, padding: "8px 14px", fontSize: 14, color: "#1A3263", outline: "none", fontFamily: "'Outfit', sans-serif", cursor: "pointer" },

  // Stats
  statsRow:    { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" as const },
  statCard:    { background: "#fff", borderRadius: 12, padding: "14px 20px", boxShadow: "0 1px 4px rgba(26,50,99,.07)", display: "flex", flexDirection: "column" as const, gap: 2, minWidth: 120 },
  statNum:     { fontSize: 22, fontWeight: 700, color: "#1A3263" },
  statLabel:   { fontSize: 12, color: "#547792" },

  // Table
  tableWrap:   { background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(26,50,99,.07)", overflow: "hidden" },
  table:       { width: "100%", borderCollapse: "collapse" as const, fontSize: 14 },
  th:          { textAlign: "left" as const, padding: "12px 18px", background: "#f4f7fb", color: "#547792", fontWeight: 600, fontSize: 12, textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "1px solid #eaf0f7" },
  td:          { padding: "14px 18px", borderBottom: "1px solid #f0f4f9", color: "#1A3263", verticalAlign: "middle" as const },
  trHover:     { background: "#f9fbfd" },
  catBadge:    { display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: "capitalize" as const },
  floorBadge:  { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "#eef2ff", color: "#4361ee" },
  tag:         { display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 11, background: "#f0f4f9", color: "#547792", margin: "2px" },
  actionRow:   { display: "flex", gap: 6, alignItems: "center" },

  // Modal
  overlay:     { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
  modal:       { background: "#fff", borderRadius: 16, padding: "32px", width: "100%", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,.15)", maxHeight: "90vh", overflowY: "auto" as const, fontFamily: "'Outfit', sans-serif" },
  modalHdr:    { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  modalTitle:  { fontSize: 18, fontWeight: 700, color: "#1A3263", margin: 0 },

  // Form
  formGroup:   { marginBottom: 16 },
  label:       { display: "block", fontSize: 13, fontWeight: 600, color: "#1A3263", marginBottom: 6 },
  input:       { width: "100%", border: "1px solid #dde6f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#1A3263", outline: "none", fontFamily: "'Outfit', sans-serif", boxSizing: "border-box" as const },
  textarea:    { width: "100%", border: "1px solid #dde6f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#1A3263", outline: "none", fontFamily: "'Outfit', sans-serif", boxSizing: "border-box" as const, resize: "vertical" as const, minHeight: 80 },

  // Detail modal
  detailRow:   { display: "flex", gap: 8, marginBottom: 12, alignItems: "flex-start" },
  detailLabel: { fontSize: 12, fontWeight: 600, color: "#547792", minWidth: 100, textTransform: "uppercase" as const, letterSpacing: "0.04em", paddingTop: 2 },
  detailValue: { fontSize: 14, color: "#1A3263", flex: 1 },

  // Misc
  empty:       { background: "#fff", borderRadius: 14, padding: "48px 24px", textAlign: "center" as const, color: "#9aafbf", fontSize: 14, boxShadow: "0 1px 4px rgba(26,50,99,.07)" },
};