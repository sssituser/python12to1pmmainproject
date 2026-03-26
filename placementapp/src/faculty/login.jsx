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
        "http://127.0.0.1:8000/api/login/",
        form
      );

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh || "");
      localStorage.setItem("user", JSON.stringify({ role: "faculty", username: form.username }));

      toast.success("Welcome Faculty 🎓");

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Toaster />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-500/20 rounded-full mb-4">
            <span className="text-3xl">👨‍🏫</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Faculty Portal</h1>
          <p className="text-gray-400 text-sm">Sign in to manage courses and students</p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
          
          {/* USERNAME */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Faculty ID or Email
            </label>
            <input
              type="text"
              name="username"
              placeholder="Enter your faculty ID"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg
              bg-white/10 border border-white/20
              focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30
              outline-none transition text-white placeholder-gray-500"
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg
                bg-white/10 border border-white/20
                focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30
                outline-none transition text-white placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold
            bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600
            transition duration-300 text-white mb-4"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* DIVIDER */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-center text-xs text-gray-400">
              Student?{" "}
              <button
                onClick={() => navigate("/")}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Student Login
              </button>
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Need help? Contact the admin
        </p>
      </motion.div>
    </div>
  );
}

export default FacultyLogin;