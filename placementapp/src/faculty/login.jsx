import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function FacultyLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) navigate("/faculty/dashboard", { replace: true });
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      toast.error("Fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `http://${window.location.hostname}:8000/api/login/`,
        { ...form, role: "faculty" },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.data.access) {
        throw new Error("Login failed - no access token");
      }

      const role = res.data.user?.role?.toString().toLowerCase() || "faculty";

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh || "");
      localStorage.setItem("user", JSON.stringify({
        username: res.data.user?.username || form.username,
        role,
      }));

      toast.success(
        role === "admin"
          ? "Welcome Admin 🔐"
          : "Welcome Faculty 🎓"
      );

      navigate("/faculty/dashboard");
    } catch (err) {
      toast.error(
        err?.response?.data?.detail || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
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
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        .animate-drift-1 {
          animation: drift 8s ease-in-out infinite;
        }
        .animate-drift-2 {
          animation: drift 12s ease-in-out infinite reverse;
        }
      `}</style>

      {/* Dynamic Faculty Course Network Grid Overlay */}
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
          <circle cx="950" cy="600" r="55" fill="url(#node-glow)" className="animate-pulse" style={{ animationDelay: "1.5s" }} />
          <circle cx="950" cy="600" r="3" fill="#22d3ee" />
        </svg>
      </div>

      {/* Glow elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none animate-drift-1" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none animate-drift-2" />

      {/* Floating placement stats widgets (Interactive Desktop Preview) */}
      <div className="absolute top-1/4 left-10 w-64 p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/60 shadow-[0_4px_30px_rgba(0,0,0,0.4)] hidden xl:flex flex-col gap-3 animate-float-slow select-none z-10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Average Grade</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">▲ 8.4%</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-white">92.4%</span>
          <span className="text-[10px] text-slate-500">Class Performance</span>
        </div>
        <div className="h-10 w-full flex items-end gap-1.5 pt-2">
          <div className="w-full h-3 bg-blue-500/20 rounded-sm animate-pulse" />
          <div className="w-full h-6 bg-cyan-500/30 rounded-sm animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="w-full h-8 bg-blue-500/50 rounded-sm animate-pulse" style={{ animationDelay: "0.4s" }} />
          <div className="w-full h-5 bg-cyan-500/30 rounded-sm animate-pulse" style={{ animationDelay: "0.6s" }} />
          <div className="w-full h-9 bg-blue-500/70 rounded-sm animate-pulse" style={{ animationDelay: "0.8s" }} />
        </div>
      </div>

      <div className="absolute bottom-1/4 right-10 w-64 p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/60 shadow-[0_4px_30px_rgba(0,0,0,0.4)] hidden xl:flex flex-col gap-3 animate-float-slow select-none z-10" style={{ animationDelay: "2s" }}>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Recent Submissions</span>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="truncate font-light">Python Exam Uploaded</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="truncate font-light">Course A Grades Synced</span>
          </div>
        </div>
      </div>

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
            Faculty Portal
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-light">
            Sign in to manage courses, student profiles, and grades.
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(59,130,246,0.15)]">
          
          {/* USERNAME */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Faculty ID or Email
            </label>
            <input
              type="text"
              name="username"
              placeholder="e.g. faculty_admin"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-blue-550 focus:ring-1 focus:ring-blue-500 focus:outline-none transition text-white placeholder-slate-600"
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition text-white placeholder-slate-600 pr-12"
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

          {/* LOGIN BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white shadow-[0_4px_20px_-2px_rgba(59,130,246,0.3)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {loading ? "Signing in..." : "SIGN IN"}
          </button>

          {/* DIVIDER & OTHER PORTALS */}
          <div className="border-t border-slate-800/60 pt-6 flex items-center justify-between text-xs text-slate-500">
            <span>Access other portals:</span>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="text-slate-400 hover:text-blue-400 font-medium transition"
              >
                Student
              </button>
              <span>•</span>
              <button
                onClick={() => navigate("/admin/login")}
                className="text-slate-400 hover:text-purple-400 font-medium transition"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <p className="text-center text-xs text-slate-600 mt-8 font-light">
          Having trouble logging in? Please contact portal administration.
        </p>
      </motion.div>
    </div>
  );
}

export default FacultyLogin;

