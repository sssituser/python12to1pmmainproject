import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// ─── Modes ───────────────────────────────────────────────────────────────────
// "login"         → username/password form
// "otp"           → OTP login (send OTP → verify)
// "forgot"        → Forgot password (enter identifier → OTP → new password)
// ─────────────────────────────────────────────────────────────────────────────

function FacultyLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login");

  // OTP Login state
  const [otpUsername, setOtpUsername] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmailHint, setOtpEmailHint] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // Forgot password state
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotEmailHint, setForgotEmailHint] = useState("");
  const [forgotOtpVerified, setForgotOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);

  const API = `http://${window.location.hostname}:8000/api`;

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) navigate("/faculty/dashboard", { replace: true });
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ─── Regular Login ───────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!form.username || !form.password) {
      toast.error("Fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/login/`,
        { username: form.username.trim(), password: form.password, role: "faculty" },
        { headers: { "Content-Type": "application/json" } }
      );

      if (!res.data.access) throw new Error("Login failed - no access token");

      const role = res.data.user?.role?.toString().toLowerCase() || "faculty";

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh || "");
      localStorage.setItem("user", JSON.stringify({
        username: res.data.user?.username || form.username,
        email: res.data.user?.email || "",
        name: res.data.user?.name || "",
        role,
      }));

      toast.success(role === "admin" ? "Welcome Admin 🔐" : "Welcome Faculty 🎓");
      navigate("/faculty/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP Login ───────────────────────────────────────────────────────────────
  const handleSendLoginOtp = async () => {
    if (!otpUsername.trim()) {
      toast.error("Enter your Faculty ID or email to receive OTP");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await axios.post(`${API}/send_otp/`, { username: otpUsername.trim() });
      const hint = res.data.email_hint || "";
      setOtpEmailHint(hint);
      toast.success(hint ? `OTP sent to ${hint}` : "OTP sent! Check your registered email.");
      setOtpSent(true);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to send OTP. Try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyLoginOtp = async () => {
    if (!otpUsername.trim() || !otpCode.trim()) {
      toast.error("Enter both your ID/email and the OTP");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await axios.post(`${API}/verify_otp/`, {
        username: otpUsername.trim(),
        otp: otpCode.trim(),
        role: "faculty",
      });

      if (!res.data.access) throw new Error("OTP verification failed");

      const savedUser = res.data.user || { username: otpUsername.trim(), role: "faculty" };
      const role = savedUser.role?.toString().toLowerCase() || "faculty";

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh || "");
      localStorage.setItem("user", JSON.stringify({
        username: savedUser.username,
        email: savedUser.email || "",
        name: savedUser.name || "",
        role,
      }));

      toast.success("OTP verified. Redirecting...");
      navigate("/faculty/dashboard", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.error || "Invalid OTP";
      toast.error(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  // ─── Forgot Password (OTP-secured, 3-step) ──────────────────────────────────
  const handleForgotSendOtp = async () => {
    if (!forgotIdentifier.trim()) {
      toast.error("Enter your Faculty ID or email");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/forgot-password/send-otp/`, {
        username: forgotIdentifier.trim(),
      });
      const hint = res.data.email_hint || "";
      setForgotEmailHint(hint);
      toast.success(hint ? `OTP sent to ${hint}` : "OTP sent to your registered email.");
      setForgotOtpSent(true);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotVerifyOtpAndReset = async () => {
    if (!forgotOtp.trim()) {
      toast.error("Enter the OTP sent to your email");
      return;
    }
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Enter and confirm your new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/forgot-password/verify-reset/`, {
        username: forgotIdentifier.trim(),
        otp: forgotOtp.trim(),
        new_password: newPassword.trim(),
      });

      if (res.data.success) {
        toast.success("Password reset successfully! Please login.");
        // Reset forgot state
        setForgotIdentifier("");
        setForgotOtp("");
        setForgotOtpSent(false);
        setForgotOtpVerified(false);
        setNewPassword("");
        setConfirmPassword("");
        setMode("login");
      } else {
        throw new Error(res.data.error || "Reset failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const resetToLogin = () => {
    setMode("login");
    setOtpUsername("");
    setOtpCode("");
    setOtpSent(false);
    setOtpEmailHint("");
    setForgotIdentifier("");
    setForgotOtp("");
    setForgotOtpSent(false);
    setForgotEmailHint("");
    setForgotOtpVerified(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <Toaster />

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes drift {
          0% { transform: translate(0, 0) scale(1); opacity: 0.15; }
          50% { transform: translate(30px, -20px) scale(1.1); opacity: 0.3; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
        }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
        .animate-drift-1 { animation: drift 8s ease-in-out infinite; }
        .animate-drift-2 { animation: drift 12s ease-in-out infinite reverse; }
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          background: rgba(2,6,23,0.6);
          border: 1px solid #1e293b;
          color: white;
          outline: none;
          transition: border-color 0.2s;
          font-size: 0.95rem;
        }
        .input-field::placeholder { color: #475569; }
        .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
        .otp-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          background: rgba(2,6,23,0.6);
          border: 1px solid #1e293b;
          color: white;
          outline: none;
          transition: border-color 0.2s;
          font-size: 1.25rem;
          font-weight: 700;
          text-align: center;
          letter-spacing: 0.5em;
        }
        .otp-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
        .label-text {
          display: block;
          font-size: 0.7rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.5rem;
        }
        .btn-primary {
          width: 100%;
          padding: 0.875rem;
          border-radius: 0.75rem;
          font-weight: 600;
          background: linear-gradient(to right, #3b82f6, #06b6d4);
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px -2px rgba(59,130,246,0.3);
        }
        .btn-primary:hover { background: linear-gradient(to right, #60a5fa, #22d3ee); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-link {
          color: #60a5fa;
          cursor: pointer;
          font-size: 0.8rem;
          background: none;
          border: none;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .btn-link:hover { color: #93c5fd; }
        .step-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          background: rgba(59,130,246,0.2);
          border: 1px solid rgba(59,130,246,0.4);
          color: #60a5fa;
          font-size: 0.7rem;
          font-weight: 700;
          margin-right: 0.5rem;
        }
      `}</style>

      {/* Background glows */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M 0,100 L 2000,100 M 0,300 L 2000,300 M 0,500 L 2000,500 M 0,700 L 2000,700 M 100,0 L 100,2000 M 300,0 L 300,2000 M 500,0 L 500,2000 M 700,0 L 700,2000" stroke="#334155" strokeWidth="0.5" fill="none" />
          <circle cx="150" cy="200" r="40" fill="url(#node-glow)" className="animate-pulse" />
          <circle cx="150" cy="200" r="3" fill="#60a5fa" />
          <circle cx="850" cy="220" r="50" fill="url(#node-glow)" className="animate-pulse" style={{ animationDelay: "1s" }} />
          <circle cx="850" cy="220" r="3" fill="#22d3ee" />
          <circle cx="200" cy="650" r="45" fill="url(#node-glow)" className="animate-pulse" style={{ animationDelay: "2s" }} />
          <circle cx="200" cy="650" r="3" fill="#60a5fa" />
        </svg>
      </div>
      <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none animate-drift-1" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none animate-drift-2" />

      {/* Floating widget */}
      <div className="absolute top-1/4 left-10 w-64 p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/60 shadow-[0_4px_30px_rgba(0,0,0,0.4)] hidden xl:flex flex-col gap-3 animate-float-slow select-none z-10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Class Performance</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">▲ 8.4%</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-white">92.4%</span>
          <span className="text-[10px] text-slate-500">Average Grade</span>
        </div>
        <div className="h-10 w-full flex items-end gap-1.5 pt-2">
          {[3, 6, 8, 5, 9, 7, 10].map((h, i) => (
            <div key={i} className={`w-full rounded-sm animate-pulse ${i % 2 === 0 ? "bg-blue-500/50" : "bg-cyan-500/30"}`} style={{ height: `${h * 4}px`, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-4 shadow-[0_0_20px_rgba(59,130,246,0.15)] text-3xl animate-float-slow">
            🎓
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {mode === "login" && "Faculty Portal"}
            {mode === "otp" && "OTP Sign In"}
            {mode === "forgot" && "Reset Password"}
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-light">
            {mode === "login" && "Sign in with your Faculty ID or email."}
            {mode === "otp" && "We'll send a one-time code to your registered email."}
            {mode === "forgot" && "Securely reset your password via OTP."}
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(59,130,246,0.15)]">

          {/* ── LOGIN MODE ──────────────────────────────────────────────────── */}
          {mode === "login" && (
            <>
              <div className="mb-5">
                <label className="label-text">Faculty ID or Email</label>
                <input
                  id="faculty-username"
                  type="text"
                  name="username"
                  placeholder="e.g. faculty_admin or name@email.com"
                  value={form.username}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="mb-2">
                <label className="label-text">Password</label>
                <div className="relative">
                  <input
                    id="faculty-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="input-field pr-12"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-slate-500 hover:text-white transition duration-150"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div className="flex justify-end mb-6">
                <button
                  className="btn-link"
                  onClick={() => {
                    setMode("forgot");
                    setForgotIdentifier(form.username);
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <button id="faculty-login-btn" onClick={handleLogin} disabled={loading} className="btn-primary mb-4">
                {loading ? "Signing in..." : "SIGN IN"}
              </button>

              <div className="text-center">
                <button
                  className="btn-link"
                  onClick={() => {
                    setMode("otp");
                    setOtpUsername(form.username);
                    setOtpSent(false);
                    setOtpCode("");
                  }}
                >
                  Sign in with OTP instead →
                </button>
              </div>
            </>
          )}

          {/* ── OTP LOGIN MODE ───────────────────────────────────────────────── */}
          {mode === "otp" && (
            <>
              <div className="mb-5">
                <label className="label-text">Faculty ID or Email</label>
                <input
                  id="otp-identifier"
                  type="text"
                  placeholder="Enter your ID or email"
                  value={otpUsername}
                  onChange={(e) => { setOtpUsername(e.target.value); setOtpSent(false); setOtpCode(""); }}
                  className="input-field"
                  disabled={otpSent}
                />
              </div>

              {otpSent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-5"
                >
                  <label className="label-text">
                    Verification Code{" "}
                    <span className="text-slate-500 normal-case font-normal">
                      {otpEmailHint ? `(sent to ${otpEmailHint})` : "(sent to your email)"}
                    </span>
                  </label>
                  <input
                    id="otp-code"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="otp-input"
                    autoFocus
                  />
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Didn't receive it?{" "}
                    <button className="btn-link" onClick={() => { setOtpSent(false); setOtpCode(""); setOtpEmailHint(""); }}>
                      Resend OTP
                    </button>
                  </p>
                </motion.div>
              )}

              <div className="flex justify-between items-center mb-6">
                <button className="btn-link" onClick={resetToLogin}>← Back to login</button>
              </div>

              <button
                id="otp-action-btn"
                onClick={otpSent ? handleVerifyLoginOtp : handleSendLoginOtp}
                disabled={otpLoading}
                className="btn-primary"
              >
                {otpLoading ? "Please wait..." : otpSent ? "VERIFY OTP & SIGN IN" : "SEND OTP"}
              </button>
            </>
          )}

          {/* ── FORGOT PASSWORD MODE (3-step) ────────────────────────────────── */}
          {mode === "forgot" && (
            <>
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-6 text-xs text-slate-500">
                <span className={`step-badge ${!forgotOtpSent ? "!bg-blue-500/30 !border-blue-400 !text-white" : ""}`}>1</span>
                <span className={!forgotOtpSent ? "text-white font-medium" : ""}>Enter ID</span>
                <div className="flex-1 h-px bg-slate-800" />
                <span className={`step-badge ${forgotOtpSent && !forgotOtpVerified ? "!bg-blue-500/30 !border-blue-400 !text-white" : ""}`}>2</span>
                <span className={forgotOtpSent && !forgotOtpVerified ? "text-white font-medium" : ""}>Verify OTP</span>
                <div className="flex-1 h-px bg-slate-800" />
                <span className={`step-badge ${forgotOtpVerified ? "!bg-blue-500/30 !border-blue-400 !text-white" : ""}`}>3</span>
                <span className={forgotOtpVerified ? "text-white font-medium" : ""}>New Password</span>
              </div>

              {/* Step 1: Enter identifier */}
              {!forgotOtpSent && (
                <>
                  <div className="mb-5">
                    <label className="label-text">Faculty ID or Email</label>
                    <input
                      id="forgot-identifier"
                      type="text"
                      placeholder="Enter your Faculty ID or email"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      className="input-field"
                    />
                    <p className="text-xs text-slate-500 mt-2">We'll send a reset OTP to your registered email.</p>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <button className="btn-link" onClick={resetToLogin}>← Back to login</button>
                  </div>

                  <button id="forgot-send-otp-btn" onClick={handleForgotSendOtp} disabled={loading} className="btn-primary">
                    {loading ? "Sending..." : "SEND RESET OTP"}
                  </button>
                </>
              )}

              {/* Step 2 & 3 combined: Verify OTP + New Password */}
              {forgotOtpSent && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="mb-5">
                    <label className="label-text">
                      OTP Code{" "}
                      <span className="text-slate-500 normal-case font-normal">
                        {forgotEmailHint ? `(sent to ${forgotEmailHint})` : "(sent to your email)"}
                      </span>
                    </label>
                    <input
                      id="forgot-otp-code"
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                      className="otp-input"
                      autoFocus
                    />
                    <p className="text-xs text-slate-500 mt-2 text-center">
                      Didn't receive it?{" "}
                      <button className="btn-link" onClick={() => { setForgotOtpSent(false); setForgotOtp(""); setForgotEmailHint(""); }}>
                        Resend OTP
                      </button>
                    </p>
                  </div>

                  <div className="mb-5">
                    <label className="label-text">New Password</label>
                    <div className="relative">
                      <input
                        id="forgot-new-password"
                        type={showNewPw ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input-field pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-4 top-3 text-slate-500 hover:text-white transition"
                      >
                        {showNewPw ? "🙈" : "👁"}
                      </button>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="label-text">Confirm New Password</label>
                    <input
                      id="forgot-confirm-password"
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field"
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center mb-6 mt-4">
                    <button className="btn-link" onClick={resetToLogin}>← Back to login</button>
                  </div>

                  <button
                    id="forgot-reset-btn"
                    onClick={handleForgotVerifyOtpAndReset}
                    disabled={loading || !forgotOtp || !newPassword || newPassword !== confirmPassword}
                    className="btn-primary"
                  >
                    {loading ? "Resetting..." : "VERIFY OTP & RESET PASSWORD"}
                  </button>
                </motion.div>
              )}
            </>
          )}

          {/* DIVIDER & OTHER PORTALS */}
          <div className="border-t border-slate-800/60 mt-6 pt-6 flex items-center justify-between text-xs text-slate-500">
            <span>Access other portals:</span>
            <div className="flex gap-3">
              <button onClick={() => navigate("/")} className="text-slate-400 hover:text-blue-400 font-medium transition">
                Student
              </button>
              <span>•</span>
              <button onClick={() => navigate("/admin/login")} className="text-slate-400 hover:text-purple-400 font-medium transition">
                Admin
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-8 font-light">
          Having trouble logging in? Please contact portal administration.
        </p>
      </motion.div>
    </div>
  );
}

export default FacultyLogin;
