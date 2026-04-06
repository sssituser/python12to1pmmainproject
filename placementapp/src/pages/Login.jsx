import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Globe from "../components/Globe";

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
        "http://127.0.0.1:8000/api/send_otp/",
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
        "http://127.0.0.1:8000/api/verify_otp/",
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
      localStorage.setItem(
        "user",
        JSON.stringify({ 
          username: savedUser.username, 
          role: normalizedRole,
          course: res.data.user?.course || "" 
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
        "http://127.0.0.1:8000/api/reset-password/",
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
      const res = await axios.post(
        "http://127.0.0.1:8000/api/login/",
        { studentId: form.studentId, password: form.password, role: "student" },
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

      // 🛡️ CLEAR OLD CACHED EXAM DATA (ensures fresh session)
      localStorage.removeItem("allExamResults");
      localStorage.removeItem("recentExam");
      localStorage.removeItem("examFailure");
      const normalizedRole = (res.data.user?.role || "student").toString().trim().toLowerCase();
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: res.data.user?.username || form.studentId,
          studentId: res.data.user?.studentId || form.studentId,
          role: normalizedRole,
          course: res.data.user?.course || ""
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
            Track your career journey 
          </p>
        </motion.div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center px-6">

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm p-8 rounded-2xl bg-slate-900 border border-slate-700"
        >
          <h2 className="text-2xl text-center mb-6 font-semibold">
            Student Login
          </h2>

          {/* USERNAME OR STUDENT ID */}
          <input
            type="text"
            name="studentId"
            placeholder="Username or Student ID"
            value={form.studentId}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none transition"
          />

          {mode === "login" && (
            <>
              {/* PASSWORD */}
              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none transition"
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
                <span
                  onClick={() => {
                    setMode("forgot");
                    setForgotUsername(form.studentId);
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="cursor-pointer hover:text-white"
                >
                  Forgot password?
                </span>
                <span
                  onClick={() => {
                    setMode("otp");
                    setOtpUsername(form.studentId);
                    setOtpCode("");
                    setOtpSent(false);
                  }}
                  className="cursor-pointer hover:text-green-400"
                >
                  OTP Login
                </span>
              </div>
            </>
          )}

          {mode === "forgot" && (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  name="forgotUsername"
                  placeholder="Email"
                  value={forgotUsername}
                  onChange={(e) => setForgotUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none transition"
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none transition"
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none transition"
                />
              </div>
              <div className="text-sm text-gray-400 mb-6">
                <span
                  onClick={() => setMode("login")}
                  className="cursor-pointer text-green-400 hover:underline"
                >
                  Back to login
                </span>
              </div>
            </>
          )}

          {mode === "otp" && (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Username or Email"
                  value={otpUsername}
                  onChange={(e) => setOtpUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none transition"
                />
              </div>
              {otpSent && (
                <div className="mb-4">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-green-400 focus:ring-1 focus:ring-green-400 outline-none transition"
                  />
                </div>
              )}
              <div className="text-sm text-gray-400 mb-6">
                <span
                  onClick={() => setMode("login")}
                  className="cursor-pointer text-green-400 hover:underline"
                >
                  Back to login
                </span>
              </div>
            </>
          )}

          {/* BUTTON */}
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
            className="w-full py-3 rounded-lg font-medium bg-green-500 hover:bg-green-600 transition duration-300"
          >
            {loading || otpLoading
              ? "Processing..."
              : mode === "login"
              ? "SIGN IN"
              : mode === "forgot"
              ? "RESET PASSWORD"
              : otpSent
              ? "VERIFY OTP"
              : "SEND OTP"}
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