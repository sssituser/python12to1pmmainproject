import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [strength, setStrength] = useState("Weak");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    if (name === "password") {
      if (value.length > 8 && /[A-Z]/.test(value)) {
        setStrength("Strong");
      } else if (value.length > 5) {
        setStrength("Medium");
      } else {
        setStrength("Weak");
      }
    }
  };

  const handleRegister = async () => {
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/register/", form);
      toast.success("Account created 🎉");
      navigate("/");
    } catch {
      toast.error("Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white">
      <Toaster />

      <div className="w-full max-w-md p-8 bg-[#161b22] rounded-xl border border-[#30363d] shadow-lg">

        <h1 className="text-2xl font-semibold text-center mb-6">
          Create Account
        </h1>

        {/* USERNAME */}
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className="input"
        />

        {/* EMAIL */}
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="input"
        />

        {/* PASSWORD */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="input"
        />

        {/* STRENGTH BAR */}
        <div className="mb-3">
          <div className="h-2 w-full bg-gray-700 rounded">
            <div
              className={`h-2 rounded ${
                strength === "Strong"
                  ? "bg-green-500 w-full"
                  : strength === "Medium"
                  ? "bg-yellow-500 w-2/3"
                  : "bg-red-500 w-1/3"
              }`}
            />
          </div>
          <p className="text-xs mt-1 text-gray-400">
            Strength: {strength}
          </p>
        </div>

        {/* CONFIRM PASSWORD */}
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          onChange={handleChange}
          className="input"
        />

        {/* ROLE */}
        <select
          name="role"
          onChange={handleChange}
          className="input mb-6"
        >
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
        </select>

        {/* BUTTON */}
        <button
          onClick={handleRegister}
          className="w-full py-3 rounded-md bg-green-600 hover:bg-green-500 transition font-medium"
        >
          Create Account
        </button>

        {/* LOGIN LINK */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-green-400 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}

export default Register;