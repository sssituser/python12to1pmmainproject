import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

function VerifyFaculty() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const username = location.state?.username || email;

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  const API = `http://${window.location.hostname}:8000/api`;

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/verify_otp/`, {
        username: username || email,
        otp: otp.trim(),
        role: "faculty",
      });

      if (res.data.access) {
        // Save tokens so faculty is logged in right away
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh || "");
        localStorage.setItem("user", JSON.stringify({
          username: res.data.user?.username || username,
          email: res.data.user?.email || email,
          name: res.data.user?.name || "",
          role: "faculty",
        }));
        toast.success("Account verified! Redirecting to login...");
        setTimeout(() => navigate("/faculty/login"), 1500);
      } else {
        toast.error("Verification failed. Please try again.");
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Invalid OTP";
      toast.error(msg);
      // If OTP expired, enable resend immediately
      if (msg.toLowerCase().includes("expired")) {
        setCanResend(true);
        setTimer(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await axios.post(`${API}/send_otp/`, { username: username || email });
      toast.success("New OTP sent to your email");
      setTimer(60);
      setCanResend(false);
      setOtp("");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to resend OTP. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black p-4 font-sans">
      <Toaster />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(59,130,246,0.15)]">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-4 text-3xl">
              📧
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Verify Your Account
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-light">
              We've sent a 6-digit code to
            </p>
            <p className="text-blue-400 font-semibold text-sm mt-1 break-all">
              {email || "your registered email"}
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Verification Code
            </label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              maxLength={6}
              placeholder="000000"
              autoFocus
              className="w-full px-4 py-4 rounded-xl bg-slate-950/60 border border-slate-800 text-white text-center text-2xl font-bold tracking-[0.5em] placeholder-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition duration-200"
            />

            {/* OTP validity note */}
            <p className="text-xs text-slate-500 text-center mt-2">
              This code is valid for <span className="text-slate-300 font-medium">10 minutes</span>
            </p>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || otp.length < 6}
            className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white shadow-[0_4px_20px_-2px_rgba(59,130,246,0.3)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </span>
            ) : "VERIFY & ACTIVATE ACCOUNT"}
          </button>

          {/* Resend section */}
          <div className="text-center mb-4">
            {timer > 0 ? (
              <p className="text-xs text-slate-500">
                Resend code in{" "}
                <span className="font-bold text-orange-400 tabular-nums">{timer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors"
              >
                Resend OTP →
              </button>
            )}
          </div>

          {/* Back link */}
          <div className="border-t border-slate-800/60 pt-4 text-center">
            <button
              onClick={() => navigate("/register")}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Back to registration
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyFaculty;
