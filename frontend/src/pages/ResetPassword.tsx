import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("No reset token provided in the URL.");
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("No reset token found.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      
      const text = await response.text();
      
      if (response.ok) {
        setMessage("Password has been successfully reset. You can now sign in.");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => navigate("/admin/login"), 3000);
      } else {
        setError(text || "Invalid or expired token.");
      }
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex font-[Outfit] bg-[#1A3263] overflow-hidden flex-col items-center justify-center px-4">
      <div className="w-full max-w-[440px]  bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
        <h2 className="text-[clamp(30px,3vw,40px)] font-semibold text-[#FAB95B] tracking-tight mb-3 text-center">
          Reset Password
        </h2>
        <p className="text-center text-[#fffc] text-[15px] mb-8 leading-relaxed">
          Please enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-[rgba(220,53,69,0.1)] border border-[rgba(220,53,69,0.35)] rounded-xl px-4 py-3 mb-5 text-[#ff4d5e] text-[13.5px] font-medium leading-snug">
              <svg className="shrink-0 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="flex items-center gap-2 bg-[rgba(40,167,69,0.1)] border border-[rgba(40,167,69,0.35)] rounded-xl px-4 py-3 mb-5 text-[#4ade80] text-[13.5px] font-medium leading-snug">
              <svg className="shrink-0 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {message}
            </div>
          )}

          {/* New Password */}
          <div className="relative w-full mb-5">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9ab0c0] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full pl-[52px] pr-[52px] py-[18px] rounded-full border-none bg-white/10 text-white font-[Outfit] text-[15px] outline-none transition-all duration-[180ms] placeholder-white/50 focus:bg-white/20 focus:shadow-[0_0_0_2px_#0AC4E0]"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(prev => !prev)}
              className="absolute right-5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[#9ab0c0] w-5 h-5 p-0 flex items-center justify-center transition-colors duration-[180ms] hover:text-white"
            >
              {showNewPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative w-full mb-8">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9ab0c0] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full pl-[52px] pr-[52px] py-[18px] rounded-full border-none bg-white/10 text-white font-[Outfit] text-[15px] outline-none transition-all duration-[180ms] placeholder-white/50 focus:bg-white/20 focus:shadow-[0_0_0_2px_#0AC4E0]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(prev => !prev)}
              className="absolute right-5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[#9ab0c0] w-5 h-5 p-0 flex items-center justify-center transition-colors duration-[180ms] hover:text-white"
            >
              {showConfirmPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !token}
            className="w-full py-[18px] px-10 rounded-full border-none bg-[#FAB95B] text-[#1A3263] font-[Outfit] text-[17px] font-bold cursor-pointer transition-all duration-[220ms] tracking-[0.01em] hover:bg-[#e6a850] disabled:opacity-70 disabled:cursor-not-allowed mb-5"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
          
          <div className="w-full text-center">
            <button
              type="button"
              onClick={() => navigate("/admin/login")}
              className="text-[14px] text-white/70 bg-none border-none font-[Outfit] cursor-pointer hover:text-white transition-colors"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
