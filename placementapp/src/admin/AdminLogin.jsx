import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useSEO } from "../utils/useSEO";

function AdminLogin() {
  useSEO("Admin Sign In", "Secure admin login for the SSSIT Placement Portal. Authorised administrators only.");
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
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
        // Check if user is admin
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
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center p-4 relative overflow-hidden font-sans text-white">
      <style>{`
        @keyframes float-pulse {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.03); }
        }
        @keyframes drift {
          0% { transform: translate(0, 0) scale(1); opacity: 0.1; }
          50% { transform: translate(-20px, 30px) scale(1.05); opacity: 0.25; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
        }
        .animate-float-pulse {
          animation: float-pulse 5s ease-in-out infinite;
        }
        .animate-drift-admin-1 {
          animation: drift 10s ease-in-out infinite;
        }
        .animate-drift-admin-2 {
          animation: drift 14s ease-in-out infinite reverse;
        }
      `}</style>

      {/* Dynamic Security Matrix Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.12]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="sec-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M 0,200 L 2000,200 M 0,400 L 2000,400 M 0,600 L 2000,600 M 150,0 L 150,2000 M 450,0 L 450,2000 M 750,0 L 750,2000" stroke="#475569" strokeWidth="0.5" fill="none" />
          <circle cx="300" cy="250" r="60" fill="url(#sec-glow)" className="animate-pulse" />
          <circle cx="300" cy="250" r="3" fill="#a78bfa" />
          <circle cx="700" cy="500" r="50" fill="url(#sec-glow)" className="animate-pulse" style={{ animationDelay: "1.5s" }} />
          <circle cx="700" cy="500" r="3" fill="#818cf8" />
        </svg>
      </div>

      {/* Decorative glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-violet-500/10 blur-[100px] pointer-events-none animate-drift-admin-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none animate-drift-admin-2" />

      {/* Floating System Status Widgets (Interactive Desktop Preview) */}
      <div className="absolute top-1/4 right-10 w-64 p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/60 shadow-[0_4px_30px_rgba(0,0,0,0.4)] hidden xl:flex flex-col gap-3 animate-float-pulse select-none z-10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Server Status</span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">
            <span className="h-1 w-1 rounded-full bg-emerald-400 animate-ping" />
            ONLINE
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-white">99.98%</span>
          <span className="text-[10px] text-slate-500">Uptime</span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full w-[95%] animate-pulse" />
        </div>
      </div>

      <div className="absolute bottom-1/4 left-10 w-64 p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/60 shadow-[0_4px_30px_rgba(0,0,0,0.4)] hidden xl:flex flex-col gap-3 animate-float-pulse select-none z-10" style={{ animationDelay: "2.5s" }}>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">System Audits</span>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-violet-400">🛡️</span>
            <span className="truncate font-light">Firewall Rules: Shielded</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-indigo-400">🔑</span>
            <span className="truncate font-light">Token Cryptography: RSA 256</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.15)] mb-4 animate-float-pulse">
            <Shield className="h-8 w-8 text-violet-400" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Admin Panel
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-light">
            Secure admin access for placement platform configuration.
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(139,92,246,0.15)]">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-light">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition text-white placeholder-slate-600"
                placeholder="Enter admin username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition text-white placeholder-slate-600 pr-12"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_4px_20px_-2px_rgba(139,92,246,0.3)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* DIVIDER & OTHER PORTALS */}
            <div className="border-t border-slate-800/60 pt-6 flex items-center justify-between text-xs text-slate-500">
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
        </div>

        <div className="text-center text-xs text-slate-600 mt-8 space-y-1">
          <p>© 2026 Placement Management System</p>
          <p className="font-light">Authorized administrator access only</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
