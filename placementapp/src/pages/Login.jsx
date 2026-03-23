import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Globe from "../components/Globe";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          role, // ✅ role added
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {}

      if (response.ok) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        const user = {
          username,
          role,
        };

        localStorage.setItem("user", JSON.stringify(user));

        toast.success(`Welcome ${username}`);

        // 🎯 Role-based redirect
        if (role === "faculty") {
          navigate("/faculty/dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }

        window.location.reload();
      } else {
        toast.error(data.detail || "Invalid credentials");
      }
    } catch {
      toast.error("Server error. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">

      {/* LEFT SIDE */}
      <div className="w-1/2 h-full bg-black relative flex items-center justify-center overflow-hidden">
        <Globe />

        <div className="absolute left-16 text-white z-10 max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-4xl font-bold">Hello</span>
            <div className="w-4 h-4 bg-green-500 animate-pulse"></div>
          </div>

          <p className="text-gray-400 text-lg mb-2">Welcome to</p>

          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Placement Portal
          </h1>

          <p className="text-gray-400">
            Practice coding, prepare for interviews and land your dream job.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-1/2 h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">

        <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-10 w-[420px] hover:scale-[1.01] transition-all">

          <h1 className="text-3xl font-semibold mb-1">
            Welcome back
          </h1>

          <p className="text-gray-500 mb-6">
            Login to continue
          </p>

          {/* 🔘 ROLE SWITCH */}
          <div className="relative flex bg-gray-100 rounded-lg p-1 mb-6">
            <div
              className={`absolute top-1 bottom-1 w-1/2 rounded-md bg-green-600 transition-all duration-300 ${
                role === "faculty" ? "left-1/2" : "left-1"
              }`}
            ></div>

            <button
              onClick={() => setRole("student")}
              className={`flex-1 z-10 py-2 text-sm font-medium ${
                role === "student" ? "text-white" : "text-gray-600"
              }`}
            >
              Student
            </button>

            <button
              onClick={() => setRole("faculty")}
              className={`flex-1 z-10 py-2 text-sm font-medium ${
                role === "faculty" ? "text-white" : "text-gray-600"
              }`}
            >
              Faculty
            </button>
          </div>

          {/* USERNAME */}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />

          {/* PASSWORD */}
          <div className="relative mb-3">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-black"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {/* OPTIONS */}
          <div className="flex justify-between text-sm mb-6">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" />
              Remember me
            </label>

            <a href="#" className="text-green-600 hover:underline">
              Forgot password?
            </a>
          </div>

          {/* LOGIN BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-500 active:scale-[0.98] transition-all shadow-lg"
          >
            {loading ? "Logging in..." : `Log In as ${role}`}
          </button>

        </div>
      </div>
    </div>
  );
}

export default Login;