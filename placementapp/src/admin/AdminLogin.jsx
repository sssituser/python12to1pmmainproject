import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Settings, ShieldCheck, Activity, Database } from "lucide-react";
import { useSEO } from "../utils/useSEO";
import { motion } from "framer-motion";

function AdminLogin() {
  // ✅ SEO Hook Integration
  useSEO(
    "Admin Sign In",
    "Secure administrator login page for the SSSIT Learning Management Portal. Authorized administrators only."
  );

  // ✅ Inject structured JSON-LD data dynamically for Search Engines
  useEffect(() => {
    const scriptId = "lms-admin-login-jsonld";
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.innerHTML = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Admin Sign In - SSSIT Learning Management Portal",
        "description": "Secure configuration and administrator portal login for SSSIT LMS system.",
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
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Performance Optimized Handlers using useCallback
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleLogin = useCallback(async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://${window.location.hostname}:8000/api/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role === 'admin') {
          localStorage.setItem("access", data.access);
          localStorage.setItem("refresh", data.refresh);
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/admin");
        } else {
          setError("Access denied. Admin privileges required.");
        }
      } else {
        setError(data.error || data.detail || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [credentials, navigate]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white overflow-hidden relative font-sans">
      {/* Violet/Indigo ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-500/5 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[130px] pointer-events-none animate-pulse" />

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold tracking-wider uppercase mb-6 shadow-[0_0_20px_rgba(139,92,246,0.08)]">
            <Shield className="w-3.5 h-3.5" />
            Admin Command
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight leading-[1.15]">
            SSSIT Control
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-violet-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(139,92,246,0.15)]">
              Panel Center
            </span>
          </h1>

          <p className="text-slate-400 mt-6 text-base max-w-md font-light leading-relaxed">
            Configure Learning Management services, authorize database rules, audit portal access histories, and monitor server configurations.
          </p>

          {/* Premium UI Admin Operations Workflow Steps */}
          <div className="mt-10 relative h-40 w-full max-w-md bg-slate-900/30 backdrop-blur-md rounded-2xl border border-slate-800/50 p-6 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]">
            <div className="relative flex justify-between items-center h-full z-10">
              {/* Animated Progress connector */}
              <div className="absolute left-6 right-6 top-[30%] h-[1px] bg-slate-800 -translate-y-1/2 overflow-hidden rounded">
                <div 
                  className="h-full w-1/3 bg-gradient-to-r from-transparent via-violet-400 to-transparent" 
                  style={{
                    animation: "flow-line 3s infinite linear"
                  }}
                />
              </div>

              {/* Step 1: Config */}
              <div className="flex flex-col items-center gap-2 relative group cursor-help">
                <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center shadow-lg group-hover:border-violet-500/50 transition-all duration-300">
                  <Settings className="w-5 h-5 text-slate-400 group-hover:text-violet-400 transition-colors" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-200 transition-colors">Configuration</span>
              </div>

              {/* Step 2: Access */}
              <div className="flex flex-col items-center gap-2 relative group cursor-help">
                <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center shadow-lg group-hover:border-violet-500/50 transition-all duration-300">
                  <ShieldCheck className="w-5 h-5 text-slate-400 group-hover:text-violet-400 transition-colors" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-200 transition-colors">Security Rules</span>
              </div>

              {/* Step 3: Auditing */}
              <div className="flex flex-col items-center gap-2 relative group cursor-help">
                <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center shadow-lg group-hover:border-violet-500/50 transition-all duration-300">
                  <Activity className="w-5 h-5 text-slate-400 group-hover:text-violet-400 transition-colors" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-200 transition-colors">Global Auditing</span>
              </div>

              {/* Step 4: DB Active */}
              <div className="flex flex-col items-center gap-2 relative group cursor-help">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.15)] group-hover:border-violet-400 transition-all duration-300">
                  <Database className="w-5 h-5 text-violet-400 animate-bounce" />
                </div>
                <span className="text-[10px] text-violet-400 font-semibold group-hover:text-violet-300 transition-colors">Database Active</span>
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
          className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-slate-900/35 backdrop-blur-xl border border-slate-800/80 shadow-[0_0_60px_-15px_rgba(139,92,246,0.12)] flex flex-col"
        >
          {/* Logo / Badge Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/30">
              <Shield className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">SSSIT LMS</h2>
              <p className="text-[10px] text-violet-400 font-semibold tracking-widest uppercase">Admin Panel</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-1.5">
              Secure Sign In
            </h3>
            <p className="text-slate-400 text-xs font-light">
              Access the administrative core for Learning Management configurations.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-light">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={credentials.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition text-white placeholder-slate-600 text-sm"
                  placeholder="Enter admin username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={credentials.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition text-white placeholder-slate-600 text-sm"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex justify-center py-3.5 px-4 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_4px_25px_-4px_rgba(139,92,246,0.25)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "SIGN IN"
                )}
              </button>
            </div>

            {/* PORTAL LINKS */}
            <div className="border-t border-slate-800/60 pt-5 flex items-center justify-between text-xs text-slate-500">
              <span>Access other portals:</span>
              <div className="flex gap-3">
                <Link to="/" className="text-slate-400 hover:text-emerald-400 font-medium transition">
                  Student
                </Link>
                <span>•</span>
                <Link to="/faculty/login" className="text-slate-400 hover:text-blue-400 font-medium transition">
                  Faculty
                </Link>
              </div>
            </div>
          </form>
        </motion.div>

        <div className="text-center text-xs text-slate-600 mt-8 space-y-1">
          <p>© 2026 SSSIT Learning Management System</p>
          <p className="font-light">Authorized administrator access only</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
