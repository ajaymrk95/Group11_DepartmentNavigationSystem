import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const text = await response.text();
      
      if (response.ok) {
        setMessage(text || "Password reset link generated. Check the server console.");
      } else {
        setError(text || "An error occurred.");
      }
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex font-[Outfit] bg-[#1A3263] overflow-hidden flex-col items-center justify-center px-4">
      <div className="w-full max-w-[440px] bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
        <h2 className="text-[clamp(32px,3vw,44px)] font-semibold text-[#FAB95B] tracking-tight mb-3 text-center">
          Forgot Password
        </h2>
        <p className="text-center text-[#fffc] text-[15px] mb-8 leading-relaxed">
          Enter your registered email address and we'll process your password reset request.
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

          {/* Email Input */}
          <div className="relative w-full mb-8">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9ab0c0] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <input
              type="email"
              placeholder="Registered Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-[52px] pr-5 py-[18px] rounded-full border-none bg-white/10 text-white font-[Outfit] text-[15px] outline-none transition-all duration-[180ms] placeholder-white/50 focus:bg-white/20 focus:shadow-[0_0_0_2px_#0AC4E0]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-[18px] px-10 rounded-full border-none bg-[#FAB95B] text-[#1A3263] font-[Outfit] text-[17px] font-bold cursor-pointer transition-all duration-[220ms] tracking-[0.01em] hover:bg-[#e6a850] disabled:opacity-70 disabled:cursor-not-allowed mb-5"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;
