import { useState } from "react";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Student",
    course: "",
  });

  const [errors, setErrors] = useState({});

  // ---------------- VALIDATION ----------------
  const validateStep1 = () => {
    let err = {};
    if (!formData.username) err.username = "Username required";
    if (!formData.email.includes("@")) err.email = "Enter valid email";
    return err;
  };

  const validateStep2 = () => {
    let err = {};
    if (formData.password.length < 6)
      err.password = "Minimum 6 characters";
    if (formData.password !== formData.confirmPassword)
      err.confirmPassword = "Passwords do not match";
    return err;
  };

  const handleNext = () => {
    const err = validateStep1();
    setErrors(err);
    if (Object.keys(err).length === 0) setStep(2);
  };

  const handleSubmit = async () => {
    const err = validateStep2();
    setErrors(err);

    if (Object.keys(err).length > 0) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || data.message || "Registration failed");
        return;
      }

      // ROLE BASED FLOW
      if (formData.role === "Student") {
        toast.success("Account created! Please login.");
        navigate("/");
      }

      if (formData.role === "Faculty") {
        navigate("/verify-faculty", {
          state: { email: formData.email },
        });
      }

    } catch (err) {
      toast.error("Server error. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex relative">
      <Toaster />

      {/* 🔙 BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 text-white bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition"
      >
        <FaArrowLeft /> Back
      </button>

      {/* LEFT PANEL */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-800 to-indigo-900 text-white flex-col justify-center p-12">

        <h2 className="text-4xl font-bold mb-4">
          Placement Portal
        </h2>

        <p className="mb-8 text-gray-200">
          Register to access placement opportunities and track your journey.
        </p>

        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${step >= 1 ? "bg-slate-800" : "bg-slate-700"}`}>
            Step 1: Basic Details
          </div>
          <div className={`p-4 rounded-lg ${step >= 2 ? "bg-slate-800" : "bg-slate-700"}`}>
            Step 2: Security Setup
          </div>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 p-6">

        <div className="w-full max-w-md bg-white p-8 rounded-2xl">

          <h3 className="text-2xl font-semibold mb-6 text-gray-800">
            Create Account
          </h3>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <input
                type="text"
                placeholder="Username"
                className="form-control py-3 mb-2 focus:ring-2 focus:ring-blue-500"
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
              {errors.username && (
                <p className="text-red-500 text-sm">{errors.username}</p>
              )}

              <input
                type="email"
                placeholder="Email"
                className="form-control py-3 mt-3 focus:ring-2 focus:ring-blue-500"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}

              {/* CUSTOM COURSE INPUT */}
              <input
                type="text"
                placeholder="Enter your course name"
                className="form-control py-3 mt-3 focus:ring-2 focus:ring-blue-500"
                onChange={(e) =>
                  setFormData({ ...formData, course: e.target.value })
                }
                value={formData.course}
              />
              {errors.course && (
                <p className="text-red-500 text-sm">{errors.course}</p>
              )}

              <button
                onClick={handleNext}
                className="btn btn-primary w-100 mt-4 py-3"
              >
                Next →
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              {/* PASSWORD */}
              <div className="relative mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="form-control py-3 focus:ring-2 focus:ring-blue-500"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 cursor-pointer text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}

              {/* CONFIRM PASSWORD */}
              <div className="relative mb-3">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="form-control py-3 focus:ring-2 focus:ring-blue-500"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <span
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-3 cursor-pointer text-gray-500"
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword}
                </p>
              )}

              {/* ROLE */}
              <select
                className="form-select py-3 mb-3 focus:ring-2 focus:ring-blue-500"
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option>Student</option>
                <option>Faculty</option>
              </select>

              {/* FACULTY INFO */}
              {formData.role === "Faculty" && (
                <p className="text-sm text-orange-600 mb-3">
                  🔐 Faculty accounts require OTP verification
                </p>
              )}

              {/* BUTTON */}
              <button
                onClick={handleSubmit}
                className="btn btn-success w-100 py-3 text-lg shadow-md hover:scale-[1.02] transition"
              >
                CREATE ACCOUNT
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default Register;