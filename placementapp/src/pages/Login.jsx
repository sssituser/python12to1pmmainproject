import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Globe from "../components/Globe";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ AUTO REDIRECT IF ALREADY LOGGED IN
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ==============================
  // LOGIN FUNCTION (FIXED)
  // ==============================
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

      console.log("LOGIN RESPONSE:", res.data);

      // ✅ STORE TOKENS
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh || "");

      // ✅ STORE USER INFO
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: res.data.user?.username || form.username,
          role: res.data.user?.role || "student",
        })
      );

      toast.success("Login successful 🚀");

      // ✅ REDIRECT
      navigate("/dashboard");

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
    <div className="min-h-screen flex bg-black text-white overflow-hidden">
      <Toaster />

      {/* LEFT SIDE */}
      <div className="w-1/2 hidden md:flex items-center justify-center relative">

        <div className="absolute inset-0 opacity-70 pointer-events-none">
          <Globe />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 px-16"
        >
          <h1 className="text-6xl font-bold leading-tight">
            Placement
            <br />
            <span className="text-green-400">Portal</span>
          </h1>

          <p className="text-gray-400 mt-4 text-lg">
            Track your career journey 🚀
          </p>
        </motion.div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center px-6">

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md p-8 rounded-2xl
          bg-white/5 backdrop-blur-xl
          border border-white/10
          shadow-[0_0_40px_rgba(0,255,0,0.15)]"
        >
          <h2 className="text-2xl text-center mb-6 font-semibold">
            Student Login
          </h2>

          {/* USERNAME */}
          <input
            type="text"
            name="username"
            placeholder="Username or Email"
            value={form.username}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-3 rounded-lg
            bg-white/5 border border-white/10
            focus:border-green-400 focus:ring-1 focus:ring-green-400
            outline-none transition"
          />

          {/* PASSWORD */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg
              bg-white/5 border border-white/10
              focus:border-green-400 focus:ring-1 focus:ring-green-400
              outline-none transition"
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-white"
            >
              👁
            </span>
          </div>

          {/* OPTIONS */}
          <div className="flex justify-between text-sm text-gray-400 mb-6">
            <span className="cursor-pointer hover:text-white">
              Forgot password?
            </span>
            <span className="cursor-pointer hover:text-green-400">
              OTP Login
            </span>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-lg font-medium
            bg-green-500 hover:bg-green-600
            transition duration-300
            shadow-[0_0_15px_rgba(0,255,0,0.3)]"
          >
            {loading ? "Signing in..." : "SIGN IN"}
          </button>

          {/* REGISTER */}
          <p className="text-center text-sm mt-5 text-gray-400">
            New here?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-green-400 cursor-pointer hover:underline"
            >
              Create account
            </span>
          </p>

          {/* FACULTY LOGIN */}
          <p className="text-center text-xs mt-3 text-gray-500">
            Faculty?{" "}
            <span
              onClick={() => navigate("/faculty/login")}
              className="text-green-400 cursor-pointer"
            >
              Login here
            </span>
          </p>
        </motion.div>

      </div>
    </div>
  );
}

export default Login;