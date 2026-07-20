import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useSEO from "../utils/useSEO";

const API = "/api";

function Login() {
  const navigate = useNavigate();

  // ✅ SEO Hook Integration
  useSEO(
    "Student Sign In",
    "Sign in to the SSSIT Learning Management Portal. Access your enrolled courses, watch video lectures, attempt exams, and track your career placement path."
  );

  // ✅ Inject structured JSON-LD data dynamically for Search Engines
  useEffect(() => {
    const scriptId = "lms-login-jsonld";
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.innerHTML = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Student Sign In - SSSIT Learning Management Portal",
        "description": "Secure portal login for SSSIT students to access courses, daily assessments, and learning schedules.",
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

  const [form, setForm] = useState({
    studentId: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login"); // login | forgot | otp
  
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotEmailHint, setForgotEmailHint] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [otpUsername, setOtpUsername] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmailHint, setOtpEmailHint] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // ✅ AUTO REDIRECT IF ALREADY LOGGED IN
  useEffect(() => {
    const token = localStorage.getItem("access");
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");

    if (token && savedUser?.role === "faculty") {
      navigate("/faculty/dashboard", { replace: true });
      return;
    }

    if (token && savedUser?.role === "student") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // ✅ Performance Optimized Handlers using useCallback
  const handleChange = useCallback((e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleSendOtp = useCallback(async () => {
    if (!otpUsername.trim()) {
      toast.error("Enter your username or email to receive OTP");
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
      console.error(err);
      toast.error(err?.response?.data?.error || "Unable to send OTP. Try again.");
    } finally {
      setOtpLoading(false);
    }
  }, [otpUsername]);

  const handleVerifyOtp = useCallback(async () => {
    if (!otpUsername.trim() || !otpCode.trim()) {
      toast.error("Provide username/email and OTP");
      return;
    }

    setOtpLoading(true);
    try {
      const res = await axios.post(
        `${API}/verify_otp/`,
        { username: otpUsername.trim(), otp: otpCode.trim(), role: "student" }
      );

      if (!res.data.access) {
        throw new Error("OTP verification failed");
      }

      const savedUser = res.data.user || {
        username: otpUsername.trim(),
        role: "student",
      };

      const normalizedRole = savedUser.role?.toString().trim().toLowerCase() || "student";

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh || "");
      
      if (savedUser.username) {
        localStorage.setItem("permanentName", savedUser.name || savedUser.username);
        localStorage.setItem("permanentEmail", savedUser.email || "");
        localStorage.setItem("permanentStudentId", savedUser.studentId || savedUser.username);
        localStorage.setItem("permanentPhone", savedUser.phone || "");
      }

      localStorage.setItem(
        "user",
        JSON.stringify({ 
          username: savedUser.username, 
          studentId: savedUser.studentId || savedUser.username,
          name: savedUser.name || "",
          email: savedUser.email || "",
          phone: savedUser.phone || "",
          role: normalizedRole,
          course: savedUser.course || "",
          enrolledCourses: savedUser.enrolled_courses || []
        })
      );

      toast.success("OTP verified. Redirecting...");
      navigate(normalizedRole === "faculty" ? "/faculty/dashboard" : "/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  }, [otpUsername, otpCode, navigate]);

  const handleForgotSendOtp = useCallback(async () => {
    if (!forgotUsername.trim()) {
      toast.error("Enter your username or email");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/forgot-password/send-otp/`, { username: forgotUsername.trim() });
      const hint = res.data.email_hint || "";
      setForgotEmailHint(hint);
      toast.success(hint ? `OTP sent to ${hint}` : "OTP sent! Check your email.");
      setForgotOtpSent(true);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  }, [forgotUsername]);

  const handleResetPassword = useCallback(async () => {
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
        username: forgotUsername.trim(),
        otp: forgotOtp.trim(),
        new_password: newPassword.trim(),
      });
      if (res.data.success) {
        toast.success("Password reset! Please login.");
        setMode("login");
        setForgotUsername("");
        setForgotOtp("");
        setForgotOtpSent(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error(res.data.error || "Reset failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  }, [forgotUsername, forgotOtp, newPassword, confirmPassword]);

  const handleLogin = useCallback(async () => {
    if (!form.studentId || !form.password) {
      toast.error("Fill all fields");
      return;
    }

    setLoading(true);
    try {
      const hostname = window.location.hostname;
      const requestData = { 
        username: form.studentId, 
        studentId: form.studentId, 
        password: form.password, 
        role: "student" 
      };
      
      const res = await axios.post(
        `http://${hostname}:8000/api/login/`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.data.access) {
        throw new Error("Login failed - no access token");
      }

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh || "");

      const normalizedRole = (res.data.user?.role || "student").toString().trim().toLowerCase();
      const userData = res.data.user || {};
      
      if (userData.username || form.studentId) {
        localStorage.setItem("permanentName", userData.name || userData.username || form.studentId);
        localStorage.setItem("permanentEmail", userData.email || "");
        localStorage.setItem("permanentStudentId", userData.studentId || form.studentId);
        localStorage.setItem("permanentPhone", userData.phone || "");
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          username: userData.username || form.studentId,
          studentId: userData.studentId || form.studentId,
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          role: normalizedRole,
          course: userData.course || "",
          enrolledCourses: userData.enrolled_courses || []
        })
      );

      toast.success("Login successful");
      const redirectTo = normalizedRole === "faculty" ? "/faculty/dashboard" : "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }, [form, navigate]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white overflow-hidden relative font-sans">
      <Toaster />

      {/* Dynamic ambient blur background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-[130px] pointer-events-none animate-pulse" />

      {/* LEFT SIDE - Info Panel */}
      <div className="w-1/2 hidden md:flex items-center justify-center relative border-r border-slate-800/40">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 px-16 max-w-2xl"
        >
          {/* Brand Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-6 shadow-[0_0_20px_rgba(16,185,129,0.08)]">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 2.22l7.78 4.24L12 13.7 4.22 9.46 12 5.22zM6 13.11v3.32l6 3.27 6-3.27v-3.32l-6 3.27-6-3.27z" />
            </svg>
            LMS Portal
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight leading-[1.15]">
            SSSIT Learning
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(52,211,153,0.15)]">
              Management Portal
            </span>
          </h1>

          <p className="text-slate-400 mt-6 text-base max-w-md font-light leading-relaxed">
            Unleash your potential with our comprehensive academic portal. Study curriculum content, participate in active assessments, and prepare for placement opportunities.
          </p>

          {/* Premium UI Learning Path Steps */}
          <div className="mt-10 relative h-40 w-full max-w-md bg-slate-900/30 backdrop-blur-md rounded-2xl border border-slate-800/50 p-6 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]">
            <div className="relative flex justify-between items-center h-full z-10">
              {/* Animated Progress connector */}
              <div className="absolute left-6 right-6 top-[30%] h-[1px] bg-slate-800 -translate-y-1/2 overflow-hidden rounded">
                <div 
                  className="h-full w-1/3 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" 
                  style={{
                    animation: "flow-line 3s infinite linear"
                  }}
                />
              </div>

              {/* Step 1: Enroll */}
              <div className="flex flex-col items-center gap-2 relative group cursor-help">
                <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center shadow-lg group-hover:border-emerald-500/50 transition-all duration-300">
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-200 transition-colors">Course Materials</span>
              </div>

              {/* Step 2: Lectures */}
              <div className="flex flex-col items-center gap-2 relative group cursor-help">
                <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center shadow-lg group-hover:border-emerald-500/50 transition-all duration-300">
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                </div>
                <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-200 transition-colors">Video Lessons</span>
              </div>

              {/* Step 3: Exams */}
              <div className="flex flex-col items-center gap-2 relative group cursor-help">
                <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center shadow-lg group-hover:border-emerald-500/50 transition-all duration-300">
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 2.24v10.75m-.75 3l7.5-7.5" />
                  </svg>
                </div>
                <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-200 transition-colors">Assessments</span>
              </div>

              {/* Step 4: Graduate */}
              <div className="flex flex-col items-center gap-2 relative group cursor-help">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:border-emerald-400 transition-all duration-300">
                  <svg className="w-5 h-5 text-emerald-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A5.905 5.905 0 018 3.447 49.024 49.024 0 0112 5.3c1.358 0 2.678-.223 3.96-.653a5.9 5.9 0 015.116 5.885 50.36 50.36 0 00-2.658.813m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold group-hover:text-emerald-300 transition-colors">Success!</span>
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

      {/* RIGHT SIDE - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-slate-900/35 backdrop-blur-xl border border-slate-800/80 shadow-[0_0_60px_-15px_rgba(16,185,129,0.12)] flex flex-col"
        >
          {/* Logo / Cap Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">SSSIT LMS</h2>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">Learning Hub</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-1.5">
              {mode === "login" ? "Welcome Back" : mode === "forgot" ? "Reset Password" : "OTP Sign In"}
            </h3>
            <p className="text-slate-400 text-xs font-light">
              {mode === "login" 
                ? "Enter your credentials to access your student account." 
                : mode === "forgot" 
                ? "Verify your account and create a new password."
                : "Receive a login code directly on your registered email."
              }
            </p>
          </div>

          {/* Form Content Wrapper */}
          <div className="space-y-4">
            
            {/* Input Student ID */}
            {mode === "login" && (
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Username or Student ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="studentId"
                    placeholder="e.g. 2345091"
                    value={form.studentId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition duration-200"
                  />
                </div>
              </div>
            )}

            {mode === "login" && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  <span
                    onClick={() => {
                      setMode("forgot");
                      setForgotUsername(form.studentId);
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="text-[10px] text-slate-500 hover:text-emerald-400 cursor-pointer transition duration-150"
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
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition duration-200"
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
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <span
                  onClick={() => {
                    setMode("otp");
                    setOtpUsername(form.studentId);
                    setOtpCode("");
                    setOtpSent(false);
                  }}
                  className="text-[10px] text-slate-400 hover:text-emerald-400 cursor-pointer underline decoration-slate-800 hover:decoration-emerald-400/30 transition duration-150"
                >
                  Sign in with OTP
                </span>
              </div>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === "forgot" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    name="forgotUsername"
                    placeholder="Enter Student ID or registered email"
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    disabled={forgotOtpSent}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition duration-200 disabled:opacity-50"
                  />
                </div>

                {forgotOtpSent && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Verification Code{" "}
                        <span className="text-slate-500 normal-case font-normal">
                          {forgotEmailHint ? `(sent to ${forgotEmailHint})` : "(sent to email)"}
                        </span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                        className="w-full tracking-[0.5em] text-center font-bold px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition duration-200"
                        autoFocus
                      />
                      <p className="text-[10px] text-slate-500 mt-1.5 text-center">
                        Didn't receive it?{" "}
                        <span
                          onClick={() => { setForgotOtpSent(false); setForgotOtp(""); setForgotEmailHint(""); }}
                          className="text-emerald-400 cursor-pointer hover:underline"
                        >
                          Resend OTP
                        </span>
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition duration-200"
                      />
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-[10px] text-red-400 mt-1">Passwords do not match</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-start">
                  <span
                    onClick={() => {
                      setMode("login");
                      setForgotUsername("");
                      setForgotOtp("");
                      setForgotOtpSent(false);
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="text-xs text-emerald-400 hover:underline cursor-pointer"
                  >
                    Back to login
                  </span>
                </div>
              </div>
            )}

            {/* OTP SIGN IN FORM */}
            {mode === "otp" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Student ID or registered email"
                    value={otpUsername}
                    onChange={(e) => { setOtpUsername(e.target.value); setOtpSent(false); setOtpCode(""); }}
                    disabled={otpSent}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition duration-200 disabled:opacity-50"
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
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full tracking-[0.5em] text-center font-bold px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition duration-200"
                      autoFocus
                    />
                    <p className="text-[10px] text-slate-500 mt-1.5 text-center">
                      Didn't receive it?{" "}
                      <span
                        onClick={() => { setOtpSent(false); setOtpCode(""); setOtpEmailHint(""); }}
                        className="text-emerald-400 cursor-pointer hover:underline"
                      >
                        Resend OTP
                      </span>
                    </p>
                  </div>
                )}

                <div className="flex justify-start">
                  <span
                    onClick={() => setMode("login")}
                    className="text-xs text-emerald-400 hover:underline cursor-pointer"
                  >
                    Back to login
                  </span>
                </div>
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
                  ? handleResetPassword
                  : handleForgotSendOtp
                : otpSent
                ? handleVerifyOtp
                : handleSendOtp
            }
            disabled={loading || otpLoading}
            className="w-full mt-6 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-black shadow-[0_4px_25px_-4px_rgba(16,185,129,0.25)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || otpLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24" fill="none">
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
              "SEND SIGN-IN OTP"
            )}
          </button>

          {/* SIGN UP REDIRECT */}
          <p className="text-center text-xs mt-6 text-slate-500">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-emerald-400 cursor-pointer font-semibold hover:underline"
            >
              Sign up here
            </span>
          </p>

          {/* PORTALS FOOTER */}
          <div className="mt-8 pt-5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
            <span>Other portals:</span>
            <div className="flex gap-3">
              <span
                onClick={() => navigate("/faculty/login")}
                className="text-slate-400 hover:text-emerald-400 font-medium cursor-pointer transition"
              >
                Faculty
              </span>
              <span>•</span>
              <span
                onClick={() => navigate("/admin/login")}
                className="text-slate-400 hover:text-purple-400 font-medium cursor-pointer transition"
              >
                Admin
              </span>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}

export default Login;
