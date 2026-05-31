import React, { useEffect, useState, Suspense } from "react";
import { lazyWithRetry as lazy } from "../utils/lazyWithRetry";
import axios from "axios";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";


function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    studentId: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login");
  const [forgotUsername, setForgotUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpUsername, setOtpUsername] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSendOtp = async () => {
    if (!otpUsername.trim()) {
      toast.error("Enter your username or email to receive OTP");
      return;
    }

    setOtpLoading(true);
    try {
      await axios.post(
        `http://${window.location.hostname}:8000/api/send_otp/`,
        { username: otpUsername.trim() },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success("OTP sent. Check your email or username inbox.");
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      toast.error("Unable to send OTP. Try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpUsername.trim() || !otpCode.trim()) {
      toast.error("Provide username/email and OTP");
      return;
    }

    setOtpLoading(true);
    try {
      const res = await axios.post(
        `http://${window.location.hostname}:8000/api/verify_otp/`,
        { username: otpUsername.trim(), otp: otpCode.trim(), role: "student" },
        { headers: { "Content-Type": "application/json" } }
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
      // 🛡️ PERMANENT LEAVE IDENTITY SYNC (OTP)
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
  };

  const handleResetPassword = async () => {
    if (!forgotUsername.trim() || !newPassword.trim()) {
      toast.error("Enter username/email and a new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password and confirm password must match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `http://${window.location.hostname}:8000/api/reset-password/`,
        {
          username: forgotUsername.trim(),
          password: newPassword.trim(),
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        toast.success("Password reset successfully. Please login.");
        setMode("login");
        setForgotUsername("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error(res.data.error || "Password reset failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // LOGIN FUNCTION (FIXED)
  // ==============================
  const handleLogin = async () => {
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
      
      console.log("DEBUG: Sending login request:", requestData);
      
      const res = await axios.post(
        `http://${hostname}:8000/api/login/`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log("LOGIN RESPONSE:", res.data);

      if (!res.data.access) {
        throw new Error("Login failed - no access token");
      }

      // STORE TOKENS
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh || "");

      // 🛡️ SYNC DATA (ensures fresh session state)
      const normalizedRole = (res.data.user?.role || "student").toString().trim().toLowerCase();
      // 🛡️ PERMANENT LEAVE IDENTITY SYNC (ensures 1000% history permanence)
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

      toast.success("Login successful ");

      // REDIRECT BASED ON ROLE
      const redirectTo = normalizedRole === "faculty" ? "/faculty/dashboard" : "/dashboard";
      navigate(redirectTo, { replace: true });

    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.detail || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white overflow-hidden relative font-sans">
      <Toaster />

      {/* Decorative background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />

      {/* LEFT SIDE - Branding & Globe */}
      <div className="w-1/2 hidden md:flex items-center justify-center relative border-r border-slate-800/30">

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 px-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-6 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            🎓 Student Portal
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight leading-none">
            Placement
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(52,211,153,0.2)]">
              Portal
            </span>
          </h1>

          <p className="text-slate-400 mt-6 text-lg max-w-md font-light leading-relaxed">
            Empowering your career path with industry connections, practice assessments, and real-time placement tracking.
          </p>

          {/* GPU-Accelerated Placement Pipeline Animation */}
          <div className="mt-10 relative h-36 w-full max-w-md bg-slate-900/20 backdrop-blur-sm rounded-2xl border border-slate-800/40 p-5 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <style>{`
              @keyframes flow-line {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(300%); }
              }
              .animate-flow-line {
                animation: flow-line 2.5s infinite linear;
              }
            `}</style>
            
            <div className="relative flex justify-between items-center h-full z-10">
              {/* Connector Line */}
              <div className="absolute left-6 right-6 top-[35%] h-[2px] bg-slate-800 -translate-y-1/2 overflow-hidden rounded">
                <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-flow-line" />
              </div>

              {/* Step 1: Profile */}
              <div className="flex flex-col items-center gap-1.5 relative group">
                <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center shadow-[0_0_12px_rgba(0,0,0,0.5)] group-hover:border-emerald-500/40 transition duration-300">
                  <span className="text-base">📄</span>
                  <div className="absolute -inset-1 rounded-xl bg-emerald-500/5 blur opacity-0 group-hover:opacity-100 transition duration-300" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Resume Build</span>
              </div>

              {/* Step 2: Assessment */}
              <div className="flex flex-col items-center gap-1.5 relative group">
                <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center shadow-[0_0_12px_rgba(0,0,0,0.5)] group-hover:border-emerald-500/40 transition duration-300">
                  <span className="text-base">💻</span>
                  <div className="absolute -inset-1 rounded-xl bg-emerald-500/5 blur opacity-0 group-hover:opacity-100 transition duration-300" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Assessment</span>
              </div>

              {/* Step 3: Interview */}
              <div className="flex flex-col items-center gap-1.5 relative group">
                <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center shadow-[0_0_12px_rgba(0,0,0,0.5)] group-hover:border-emerald-500/40 transition duration-300">
                  <span className="text-base">🤝</span>
                  <div className="absolute -inset-1 rounded-xl bg-emerald-500/5 blur opacity-0 group-hover:opacity-100 transition duration-300" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Interview</span>
              </div>

              {/* Step 4: Placed */}
              <div className="flex flex-col items-center gap-1.5 relative group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:border-emerald-400 transition duration-300">
                  <span className="text-base animate-pulse">🎉</span>
                  <div className="absolute -inset-1.5 rounded-xl bg-emerald-400/10 blur opacity-100 animate-pulse" />
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold">Placed!</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT SIDE - Login Card */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 shadow-[0_0_50px_-12px_rgba(16,185,129,0.15)] flex flex-col"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-400 text-sm font-light">
              Enter your credentials to access your student account.
            </p>
          </div>

          {/* USERNAME OR STUDENT ID */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Username or Student ID
            </label>
            <input
              type="text"
              name="studentId"
              placeholder="e.g. 2345091"
              value={form.studentId}
              onChange={handleChange}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition duration-200"
            />
          </div>

          {mode === "login" && (
            <>
              {/* PASSWORD */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  <span
                    onClick={() => {
                      setMode("forgot");
                      setForgotUsername(form.studentId);
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="text-xs text-slate-500 hover:text-emerald-400 cursor-pointer transition duration-150"
                  >
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition duration-200 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition duration-150 text-sm"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* OPTIONS */}
              <div className="flex justify-end text-xs text-slate-400 mb-6">
                <span
                  onClick={() => {
                    setMode("otp");
                    setOtpUsername(form.studentId);
                    setOtpCode("");
                    setOtpSent(false);
                  }}
                  className="cursor-pointer hover:text-emerald-400 underline decoration-slate-800 hover:decoration-emerald-400/30 transition duration-150"
                >
                  Sign in with OTP
                </span>
              </div>
            </>
          )}

          {mode === "forgot" && (
            <>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="text"
                  name="forgotUsername"
                  placeholder="name@domain.com"
                  value={forgotUsername}
                  onChange={(e) => setForgotUsername(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition duration-200"
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition duration-200"
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition duration-200"
                />
              </div>
              <div className="text-xs text-slate-400 mb-6">
                <span
                  onClick={() => setMode("login")}
                  className="cursor-pointer text-emerald-400 hover:underline"
                >
                  Back to login
                </span>
              </div>
            </>
          )}

          {mode === "otp" && (
            <>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Username or Email
                </label>
                <input
                  type="text"
                  placeholder="Enter email or username"
                  value={otpUsername}
                  onChange={(e) => setOtpUsername(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition duration-200"
                />
              </div>
              {otpSent && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full tracking-[0.5em] text-center font-bold px-4 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition duration-200"
                  />
                </div>
              )}
              <div className="text-xs text-slate-400 mb-6">
                <span
                  onClick={() => setMode("login")}
                  className="cursor-pointer text-emerald-400 hover:underline"
                >
                  Back to login
                </span>
              </div>
            </>
          )}

          {/* MAIN BUTTON */}
          <button
            onClick={
              mode === "login"
                ? handleLogin
                : mode === "forgot"
                ? handleResetPassword
                : otpSent
                ? handleVerifyOtp
                : handleSendOtp
            }
            disabled={loading || otpLoading}
            className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-black shadow-[0_4px_20px_-2px_rgba(16,185,129,0.3)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              "RESET PASSWORD"
            ) : otpSent ? (
              "VERIFY OTP"
            ) : (
              "SEND OTP"
            )}
          </button>

          {/* REGISTER LINK */}
          <p className="text-center text-xs mt-6 text-slate-500">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-emerald-400 cursor-pointer font-semibold hover:underline"
            >
              Sign up here
            </span>
          </p>

          {/* DIVERGING ROLES FOOTER */}
          <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
            <span>Access other portals:</span>
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

