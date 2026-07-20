import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useSEO } from "../utils/useSEO";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const API = "/api";

function FacultyLogin() {
  // ✅ SEO Hook Integration
  useSEO(
    "Faculty Sign In",
    "Sign in to the SSSIT Faculty Portal. Manage student exams, evaluate learning modules, grades, curriculum scheduling, and track student success."
  );

  // ✅ Inject structured JSON-LD data dynamically for Search Engines
  useEffect(() => {
    const scriptId = "lms-faculty-login-jsonld";
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.innerHTML = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Faculty Sign In - SSSIT Learning Management Portal",
        "description": "Secure sign in for SSSIT Faculty members to manage course materials, check student grade books, and schedule assessment tests.",
        "publisher": {
          "@type": "EducationalOrganization",
          "name": "SSSIT Computer Education",
          "url": window.location.origin
        }
      });
      document.head.appendChild(script);
    }
    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login"); // login | otp | forgot

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

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) navigate("/faculty/dashboard", { replace: true });
  }, [navigate]);

  // ✅ Performance Optimization: useCallback
  const handleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleLogin = useCallback(async () => {
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
  }, [form, navigate]);

  const handleSendLoginOtp = useCallback(async () => {
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
  }, [otpUsername]);

  const handleVerifyLoginOtp = useCallback(async () => {
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
  }, [otpUsername, otpCode, navigate]);

  const handleForgotSendOtp = useCallback(async () => {
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
  }, [forgotIdentifier]);

  const handleForgotVerifyOtpAndReset = useCallback(async () => {
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
  }, [forgotIdentifier, forgotOtp, newPassword, confirmPassword]);

  const resetToLogin = useCallback(() => {
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
  }, []);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white overflow-hidden relative font-sans">
      <Toaster />

      {/* Blue/Cyan ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[130px] pointer-events-none animate-pulse" />

      {/* LEFT SIDE - Info Panel (Split screen layout) */}
      <div className="w-1/2 hidden md:flex items-center justify-center relative border-r border-slate-800/40">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 px-16 max-w-2xl"
        >
          {/* Brand Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase mb-6 shadow-[0_0_20px_rgba(59,130,246,0.08)]">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 2.22l7.78 4.24L12 13.7 4.22 9.46 12 5.22zM6 13.11v3.32l6 3.27 6-3.27v-3.32l-6 3.27-6-3.27z" />
            </svg>
            Faculty Portal
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight leading-[1.15]">
            SSSIT Faculty
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(59,130,246,0.15)]">
              Management Hub
            </span>
          </h1>

          <p className="text-slate-400 mt-6 text-base max-w-md font-light leading-relaxed">
            Manage course materials, administer daily assessments, audit exam results, and monitor student academic growth inside the Learning Management System.
          </p>

          {/* Premium UI Faculty Workflow Steps */}
          <div className="mt-10 relative h-40 w-full max-w-md bg-slate-900/30 backdrop-blur-md rounded-2xl border border-slate-800/50 p-6 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]">
            <div className="relative flex justify-between items-center h-full z-10">
              {/* Animated Progress connector */}
              <div className="absolute left-6 right-6 top-[30%] h-[1px] bg-slate-800 -translate-y-1/2 overflow-hidden rounded">
                <div 
                  className="h-full w-1/3 bg-gradient-to-r from-transparent via-blue-400 to-transparent" 
                  style={{
                    animation: "flow-line 3s infinite linear"
                  }}
                />
              </div>

              {/* Step 1: Curriculum */}
              <div className="flex flex-col items-center gap-2 relative group cursor-help">
                <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center shadow-lg group-hover:border-blue-500/50 transition-all duration-300">
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-200 transition-colors">Curriculum</span>
              </div>

              {/* Step 2: Students */}
              <div className="flex flex-col items-center gap-2 relative group cursor-help">
                <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center shadow-lg group-hover:border-blue-500/50 transition-all duration-300">
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 20M3.12 18.176a9.06 9.06 0 007.88 4.324 9.086 9.086 0 007.88-4.324M3.12 18.176a4.125 4.125 0 017.533-2.493M3.12 18.176c-.501-.91-.786-1.957-.786-3.07v-.003c0-1.113.288-2.16.786-3.07M10.65 15.672a4.125 4.125 0 110-8.25 4.125 4.125 0 010 8.25z" />
                  </svg>
                </div>
                <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-200 transition-colors">Monitoring</span>
              </div>

              {/* Step 3: Exams */}
              <div className="flex flex-col items-center gap-2 relative group cursor-help">
                <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center shadow-lg group-hover:border-blue-500/50 transition-all duration-300">
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 2.24v10.75m-.75 3l7.5-7.5" />
                  </svg>
                </div>
                <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-200 transition-colors">Evaluation</span>
              </div>

              {/* Step 4: Insights */}
              <div className="flex flex-col items-center gap-2 relative group cursor-help">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)] group-hover:border-blue-400 transition-all duration-300">
                  <svg className="w-5 h-5 text-blue-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                  </svg>
                </div>
                <span className="text-[10px] text-blue-400 font-semibold group-hover:text-blue-300 transition-colors">Insights!</span>
              </div>
            </div>
            
            <style>{`
              @keyframes flow-line {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(300%); }
              }
            `}</style>
          </div>
        </motion.div>
      </div>

      {/* RIGHT SIDE - Form Panel (Split screen layout) */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-slate-900/35 backdrop-blur-xl border border-slate-800/80 shadow-[0_0_60px_-15px_rgba(59,130,246,0.12)] flex flex-col"
        >
          {/* Logo / Badge Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">SSSIT LMS</h2>
              <p className="text-[10px] text-blue-400 font-semibold tracking-widest uppercase">Faculty Console</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-1.5">
              {mode === "login" ? "Welcome Back" : mode === "forgot" ? "Reset Credentials" : "OTP Verification"}
            </h3>
            <p className="text-slate-400 text-xs font-light">
              {mode === "login" 
                ? "Sign in with your Faculty ID or email." 
                : mode === "forgot" 
                ? "Securely verify your details and create a new password."
                : "Request and enter a sign-in OTP sent directly to your inbox."
              }
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">

            {/* LOGIN MODE */}
            {mode === "login" && (
              <>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Faculty ID or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      id="faculty-username"
                      type="text"
                      name="username"
                      placeholder="e.g. faculty_admin or name@email.com"
                      value={form.username}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition duration-200 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Password
                    </label>
                    <span
                      onClick={() => {
                        setMode("forgot");
                        setForgotIdentifier(form.username);
                      }}
                      className="text-[10px] text-slate-500 hover:text-blue-400 cursor-pointer transition duration-150"
                    >
                      Forgot password?
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="faculty-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition duration-200 text-sm"
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-white transition duration-150"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.815 7.815L21 21m-3.95-3.95l-2.5-2.5m-2.5-2.5L12 12m0 0l-1.5-1.5m1.5 1.5l.007-.007M12 12l.007-.007" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <span
                    onClick={() => {
                      setMode("otp");
                      setOtpUsername(form.username);
                      setOtpSent(false);
                      setOtpCode("");
                    }}
                    className="text-[10px] text-slate-400 hover:text-blue-400 cursor-pointer underline decoration-slate-800 hover:decoration-blue-400/30 transition duration-150"
                  >
                    Sign in with OTP
                  </span>
                </div>
              </>
            )}

            {/* OTP MODE */}
            {mode === "otp" && (
              <>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Faculty ID or Email
                  </label>
                  <input
                    id="otp-identifier"
                    type="text"
                    placeholder="Enter registered ID or email"
                    value={otpUsername}
                    onChange={(e) => { setOtpUsername(e.target.value); setOtpSent(false); setOtpCode(""); }}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition duration-200 disabled:opacity-50 text-sm"
                    disabled={otpSent}
                  />
                </div>

                {otpSent && (
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Verification Code{" "}
                      <span className="text-slate-500 normal-case font-normal">
                        {otpEmailHint ? `(sent to ${otpEmailHint})` : "(sent to email)"}
                      </span>
                    </label>
                    <input
                      id="otp-code"
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full tracking-[0.5em] text-center font-bold px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition duration-200"
                      autoFocus
                    />
                    <p className="text-[10px] text-slate-500 mt-1.5 text-center">
                      Didn't receive it?{" "}
                      <span className="text-blue-400 cursor-pointer hover:underline" onClick={() => { setOtpSent(false); setOtpCode(""); setOtpEmailHint(""); }}>
                        Resend OTP
                      </span>
                    </p>
                  </div>
                )}

                <div className="flex justify-start">
                  <span className="text-xs text-blue-400 hover:underline cursor-pointer" onClick={resetToLogin}>
                    ← Back to login
                  </span>
                </div>
              </>
            )}

            {/* FORGOT PASSWORD MODE */}
            {mode === "forgot" && (
              <div className="space-y-4">
                {/* Step indicator */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                  <span className={`px-2 py-0.5 rounded-full ${!forgotOtpSent ? "bg-blue-500/20 text-white border border-blue-500/40" : "bg-slate-950 text-slate-600"}`}>Step 1</span>
                  <div className="flex-1 h-[1px] bg-slate-800/80 mx-2" />
                  <span className={`px-2 py-0.5 rounded-full ${forgotOtpSent ? "bg-blue-500/20 text-white border border-blue-500/40" : "bg-slate-950 text-slate-600"}`}>Step 2</span>
                </div>

                {!forgotOtpSent ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Faculty ID or Email
                      </label>
                      <input
                        id="forgot-identifier"
                        type="text"
                        placeholder="Enter registered Faculty ID or email"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition duration-200 text-sm"
                      />
                    </div>
                    <div className="flex justify-start">
                      <span className="text-xs text-blue-400 hover:underline cursor-pointer" onClick={resetToLogin}>
                        ← Back to login
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        OTP Code{" "}
                        <span className="text-slate-500 normal-case font-normal">
                          {forgotEmailHint ? `(sent to ${forgotEmailHint})` : "(sent to email)"}
                        </span>
                      </label>
                      <input
                        id="forgot-otp-code"
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                        className="w-full tracking-[0.5em] text-center font-bold px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition duration-200"
                        autoFocus
                      />
                      <p className="text-[10px] text-slate-500 mt-1.5 text-center">
                        Didn't receive?{" "}
                        <span className="text-blue-400 cursor-pointer hover:underline" onClick={() => { setForgotOtpSent(false); setForgotOtp(""); setForgotEmailHint(""); }}>
                          Resend OTP
                        </span>
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="forgot-new-password"
                          type={showNewPw ? "text" : "password"}
                          placeholder="Min. 8 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition pr-12 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          className="absolute right-3.5 top-3 text-slate-500 hover:text-white transition"
                        >
                          {showNewPw ? "🙈" : "👁"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Confirm Password
                      </label>
                      <input
                        id="forgot-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm"
                      />
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-[10px] text-red-400 mt-1">Passwords do not match</p>
                      )}
                    </div>

                    <div className="flex justify-start">
                      <span className="text-xs text-blue-400 hover:underline cursor-pointer" onClick={resetToLogin}>
                        ← Back to login
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={
              mode === "login"
                ? handleLogin
                : mode === "forgot"
                ? forgotOtpSent
                  ? handleForgotVerifyOtpAndReset
                  : handleForgotSendOtp
                : otpSent
                ? handleVerifyLoginOtp
                : handleSendLoginOtp
            }
            disabled={loading || otpLoading}
            className="w-full mt-6 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] text-white shadow-[0_4px_25px_-4px_rgba(59,130,246,0.25)] transition-all duration-200 disabled:opacity-50"
          >
            {loading || otpLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : mode === "login" ? (
              "SIGN IN"
            ) : mode === "forgot" ? (
              forgotOtpSent ? "VERIFY & RESET" : "SEND RESET OTP"
            ) : otpSent ? (
              "VERIFY & SIGN IN"
            ) : (
              "SEND OTP"
            )}
          </button>

          {/* OTHER PORTALS */}
          <div className="border-t border-slate-800/60 mt-8 pt-5 flex items-center justify-between text-xs text-slate-500">
            <span>Access other portals:</span>
            <div className="flex gap-3">
              <span onClick={() => navigate("/")} className="text-slate-400 hover:text-emerald-400 font-medium cursor-pointer transition">
                Student
              </span>
              <span>•</span>
              <span onClick={() => navigate("/admin/login")} className="text-slate-400 hover:text-purple-400 font-medium cursor-pointer transition">
                Admin
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default FacultyLogin;
