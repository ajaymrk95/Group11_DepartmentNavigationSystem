import React, { useState } from "react";

const BASE = "http://localhost:8080";

const REPORT_TYPES = [
  "Wrong Room Label",
  "Blocked Path",
  "Accessibility Issue",
  "Incorrect Map Info",
  "Missing Location",
  "Other",
];

const inputSt: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "12px 16px",
  borderRadius: 12, fontSize: 14, border: "1.5px solid rgba(26,50,99,0.15)",
  outline: "none", fontFamily: "'Outfit', sans-serif", color: "#1A3263",
  background: "#fff", transition: "border-color 0.2s",
};

export default function Report() {
  const [type,        setType]        = useState("");
  const [description, setDescription] = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type)              { setError("Please select a report type."); return; }
    if (!description.trim()){ setError("Please describe the issue."); return; }

    setSubmitting(true); setError("");
    try {
      const res = await fetch(`${BASE}/api/reports`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type, description: description.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed.");
      }
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
  width: "100%",
  maxWidth: 520,
}}>
      <div style={{
        width: "100%", maxWidth: 520,
        background: "#fff", borderRadius: 24,
        boxShadow: "0 20px 60px rgba(11,45,114,0.12)",
        overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{ background: "#0B2D72", padding: "28px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#F6E7BC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#F6E7BC" }}>
              Report an Issue
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(246,231,188,0.65)", lineHeight: 1.5 }}>
            Help us keep Atlas accurate. Reports are anonymous.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "rgba(52,199,89,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                  stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p style={{ fontSize: 17, fontWeight: 700, color: "#1A3263", margin: "0 0 8px" }}>
                Report submitted!
              </p>
              <p style={{ fontSize: 13, color: "#547792", margin: "0 0 24px", lineHeight: 1.6 }}>
                Thank you for helping us improve Atlas. We'll review your report shortly.
              </p>
              <button
                onClick={() => { setSuccess(false); setType(""); setDescription(""); }}
                style={{
                  padding: "10px 24px", borderRadius: 100, border: "none",
                  background: "#1A3263", color: "#F6E7BC",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Submit another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {error && (
                <div style={{
                  background: "rgba(220,53,69,0.07)", border: "1px solid rgba(220,53,69,0.2)",
                  borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#dc3545",
                }}>
                  {error}
                </div>
              )}

              {/* Type */}
              <div>
                <label style={{
                  fontSize: 10, fontWeight: 700, color: "#547792",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  display: "block", marginBottom: 8,
                }}>
                  Issue Type *
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {REPORT_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      style={{
                        padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                        fontFamily: "'Outfit', sans-serif", cursor: "pointer",
                        transition: "all 0.15s",
                        background: type === t ? "#1A3263" : "rgba(26,50,99,0.06)",
                        color:      type === t ? "#F6E7BC" : "#547792",
                        border:     type === t ? "1.5px solid #1A3263" : "1.5px solid transparent",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{
                  fontSize: 10, fontWeight: 700, color: "#547792",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  display: "block", marginBottom: 8,
                }}>
                  Description *
                </label>
                <textarea
                  style={{ ...inputSt, resize: "vertical", minHeight: 110, lineHeight: 1.6 }}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail — what's wrong and where..."
                  maxLength={1000}
                />
                <div style={{ fontSize: 11, color: "#9aafbf", textAlign: "right", marginTop: 4 }}>
                  {description.length} / 1000
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "12px 24px", borderRadius: 100, border: "none",
                  background: "#1A3263", color: "#F6E7BC",
                  fontSize: 14, fontWeight: 700, cursor: submitting ? "wait" : "pointer",
                  fontFamily: "'Outfit', sans-serif",
                  opacity: submitting ? 0.65 : 1, transition: "opacity 0.2s",
                }}
              >
                {submitting ? "Submitting…" : "Submit Report"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}