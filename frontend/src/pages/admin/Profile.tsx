import React, { useEffect, useState } from "react";
import { User, Lock, Mail, CheckCircle, AlertCircle, Eye, EyeOff, X } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("token") ?? "";
const authH = (): Record<string, string> => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token()}`,
});

// ── Shared input style ────────────────────────────────────────────────────────
const inputSt: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "10px 14px",
  borderRadius: 10, fontSize: 14, border: "1.5px solid rgba(26,50,99,0.15)",
  outline: "none", fontFamily: "'Outfit', sans-serif", color: "#1A3263",
  background: "#fff", transition: "border-color 0.2s",
};
const labelSt: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: "#547792",
  letterSpacing: "0.08em", textTransform: "uppercase",
  display: "block", marginBottom: 6,
};

// ── Password field with show/hide toggle ─────────────────────────────────────
function PasswordInput({
  value, onChange, placeholder, id,
}: { value: string; onChange: (v: string) => void; placeholder?: string; id: string }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        id={id}
        type={show ? "text" : "password"}
        style={{ ...inputSt, paddingRight: 44 }}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="new-password"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer", color: "#547792", padding: 0,
          display: "flex", alignItems: "center",
        }}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

// ── Alert banner ─────────────────────────────────────────────────────────────
function Alert({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 16px", borderRadius: 10,
      background: type === "success" ? "rgba(52,199,89,0.1)" : "rgba(220,53,69,0.08)",
      border: `1px solid ${type === "success" ? "rgba(52,199,89,0.3)" : "rgba(220,53,69,0.25)"}`,
      color: type === "success" ? "#19914e" : "#dc3545", fontSize: 13,
      width: "100%", boxSizing: "border-box"
    }}>
      <div style={{ flexShrink: 0, display: "flex" }}>
        {type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      </div>
      <div style={{ lineHeight: 1.4 }}>{message}</div>
    </div>
  );
}

// ── Toast banner ─────────────────────────────────────────────────────────────
function Toast({ type, message, onClose }: { type: "success" | "error"; message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: "absolute", top: 24, left: "50%", display: "flex", alignItems: "center", gap: 12,
      padding: "14px 20px", borderRadius: 12, background: "#fff",
      boxShadow: "0 8px 24px rgba(26,50,99,0.15)",
      borderLeft: `4px solid ${type === "success" ? "#34c759" : "#dc3545"}`,
      color: "#1A3263", fontSize: 14, fontWeight: 500, zIndex: 100,
      width: "max-content", maxWidth: 400, animation: "toast-slide-down 0.3s ease-out forwards",
    }}>
      <div style={{ flexShrink: 0, display: "flex", color: type === "success" ? "#34c759" : "#dc3545" }}>
        {type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      </div>
      <div style={{ lineHeight: 1.4, flex: 1 }}>{message}</div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#9aafbf", display: "flex" }}>
        <X size={16} />
      </button>
      <style>{`
        @keyframes toast-slide-down {
          from { transform: translate(-50%, -20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Section card ─────────────────────────────────────────────────────────────
function Card({ title, icon, children, className }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{
      background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(26,50,99,.07)",
      overflow: "hidden", marginBottom: 20, display: "flex", flexDirection: "column", height: className?.includes("h-full") ? "100%" : "auto"
    }}>
      <div style={{
        padding: "16px 24px", background: "#f7f4ef",
        borderBottom: "1px solid #ede8dc", display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, background: "#1A3263",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#1A3263" }}>{title}</span>
      </div>
      <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}

// ── Primary / secondary button styles ─────────────────────────────────────────
const btnPrimary: React.CSSProperties = {
  padding: "10px 28px", borderRadius: 100, border: "none",
  background: "#1A3263", color: "#F6E7BC", fontSize: 13, fontWeight: 700,
  cursor: "pointer", fontFamily: "'Outfit', sans-serif", transition: "opacity 0.2s",
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Profile() {
  // profile state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loadError, setLoadError] = useState("");

  // toast state
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // username section
  const [newUsername, setNewUsername] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);

  // email section
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // password section
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  // Load current profile on mount
  useEffect(() => {
    fetch(`${BASE}/api/admin/profile`, { headers: authH() })
      .then(r => {
        if (!r.ok) throw new Error("Failed to load profile");
        return r.json();
      })
      .then(data => {
        setUsername(data.username ?? "");
        setNewUsername(data.username ?? "");
        setEmail(data.email ?? "");
        setNewEmail(data.email ?? "");
      })
      .catch(e => setLoadError(e.message));
  }, []);

  // Save username
  async function handleSaveUsername(e: React.FormEvent) {
    e.preventDefault();
    setToast(null);
    if (!newUsername.trim()) { setToast({ type: "error", message: "Username is required." }); return; }
    setSavingUsername(true);
    try {
      const res = await fetch(`${BASE}/api/admin/profile/username`, {
        method: "PUT",
        headers: authH(),
        body: JSON.stringify({ username: newUsername.trim() }),
      });
      if (!res.ok) throw new Error(await res.text() || "Failed to update username.");
      setUsername(newUsername.trim());
      setToast({ type: "success", message: "Username updated successfully." });
    } catch (err: unknown) {
      setToast({ type: "error", message: err instanceof Error ? err.message : "Error updating username." });
    } finally {
      setSavingUsername(false);
    }
  }

  // Save email
  async function handleSaveEmail(e: React.FormEvent) {
    e.preventDefault();
    setToast(null);
    if (!newEmail.trim()) { setToast({ type: "error", message: "Email is required." }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setToast({ type: "error", message: "Enter a valid email address." }); return;
    }
    setSavingEmail(true);
    try {
      const res = await fetch(`${BASE}/api/admin/profile/email`, {
        method: "PUT",
        headers: authH(),
        body: JSON.stringify({ email: newEmail.trim() }),
      });
      if (!res.ok) throw new Error(await res.text() || "Failed to update email.");
      setEmail(newEmail.trim());
      setToast({ type: "success", message: "Email updated successfully." });
    } catch (err: unknown) {
      setToast({ type: "error", message: err instanceof Error ? err.message : "Error updating email." });
    } finally {
      setSavingEmail(false);
    }
  }

  // Save password
  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    setToast(null);
    if (!currentPw) { setToast({ type: "error", message: "Current password is required." }); return; }
    if (newPw.length < 6) { setToast({ type: "error", message: "New password must be at least 6 characters." }); return; }
    if (newPw !== confirmPw) { setToast({ type: "error", message: "Passwords do not match." }); return; }
    setSavingPw(true);
    try {
      const res = await fetch(`${BASE}/api/admin/profile/password`, {
        method: "PUT",
        headers: authH(),
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (!res.ok) throw new Error(await res.text() || "Failed to update password.");
      setToast({ type: "success", message: "Password updated successfully." });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: unknown) {
      setToast({ type: "error", message: err instanceof Error ? err.message : "Error updating password." });
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div style={{ position: "relative", padding: "32px 28px 40px", width: "100%", boxSizing: "border-box", fontFamily: "'Outfit', sans-serif", color: "#1A3263" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <User size={22} strokeWidth={1.8} color="#1A3263" />
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            Profile Settings
          </h1>
        </div>
        <p style={{ fontSize: 13, color: "#547792", margin: 0 }}>Manage your account credentials</p>
      </div>

      {loadError && <Alert type="error" message={loadError} />}

      {/* Account info pill */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14, padding: "14px 20px",
        background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(26,50,99,.07)",
        marginBottom: 20, flexWrap: "wrap",
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: "50%", background: "#1A3263",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <User size={22} strokeWidth={1.8} color="#F6E7BC" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#1A3263" }}>
            {username || "—"}
          </div>
          <div style={{ fontSize: 13, color: "#547792", marginTop: 2 }}>
            {email || "No email set"}
          </div>
        </div>
        <span style={{
          marginLeft: "auto", padding: "4px 12px", borderRadius: 100,
          background: "rgba(26,50,99,.08)", color: "#1A3263", fontSize: 11, fontWeight: 700,
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>
          Admin
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:gap-5 w-full">
        <div className="flex-1 flex flex-col">
          {/* Username section */}
          <Card title="Username" icon={<User size={17} strokeWidth={1.8} color="#F6E7BC" />} className="h-full">
            <form onSubmit={handleSaveUsername} noValidate className="flex flex-col h-full flex-1">
              <div style={{ maxWidth: 480 }}>
                <label style={labelSt} htmlFor="new-username">Username</label>
                <input
                  id="new-username"
                  type="text"
                  style={inputSt}
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="adminusername"
                />
                <p style={{ fontSize: 12, color: "#9aafbf", marginTop: 6, marginBottom: 0 }}>
                  This is the username associated with your admin account.
                </p>
              </div>
              <div style={{ marginTop: "auto", paddingTop: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="submit"
                  style={{ ...btnPrimary, opacity: savingUsername ? 0.65 : 1 }}
                  disabled={savingUsername}
                >
                  {savingUsername ? "Saving…" : "Update Username"}
                </button>
              </div>
            </form>
          </Card>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Email section */}
          <Card title="Email Address" icon={<Mail size={17} strokeWidth={1.8} color="#F6E7BC" />} className="h-full">
            <form onSubmit={handleSaveEmail} noValidate className="flex flex-col h-full flex-1">
              <div style={{ maxWidth: 480 }}>
                <label style={labelSt} htmlFor="new-email">Email address</label>
                <input
                  id="new-email"
                  type="email"
                  style={inputSt}
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="email"
                />
                <p style={{ fontSize: 12, color: "#9aafbf", marginTop: 6, marginBottom: 0 }}>
                  This is the email associated with your admin account.
                </p>
              </div>
              <div style={{ marginTop: "auto", paddingTop: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="submit"
                  style={{ ...btnPrimary, opacity: savingEmail ? 0.65 : 1 }}
                  disabled={savingEmail}
                >
                  {savingEmail ? "Saving…" : "Update Email"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Password section */}
      <Card title="Change Password" icon={<Lock size={17} strokeWidth={1.8} color="#F6E7BC" />}>
        <form onSubmit={handleSavePassword} noValidate className="flex flex-col">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 480 }}>
            <div>
              <label style={labelSt} htmlFor="current-pw">Current password</label>
              <PasswordInput id="current-pw" value={currentPw} onChange={setCurrentPw} placeholder="Enter current password" />
            </div>
            <div>
              <label style={labelSt} htmlFor="new-pw">New password</label>
              <PasswordInput id="new-pw" value={newPw} onChange={setNewPw} placeholder="At least 6 characters" />
            </div>
            <div>
              <label style={labelSt} htmlFor="confirm-pw">Confirm new password</label>
              <PasswordInput id="confirm-pw" value={confirmPw} onChange={setConfirmPw} placeholder="Repeat new password" />
            </div>
          </div>
          <div style={{ marginTop: 20, display: "flex" }}>
            <button
              type="submit"
              style={{ ...btnPrimary, opacity: savingPw ? 0.65 : 1 }}
              disabled={savingPw}
            >
              {savingPw ? "Saving…" : "Update Password"}
            </button>
          </div>
        </form>
      </Card>

      {/* Global Toast */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

    </div>
  );
}
