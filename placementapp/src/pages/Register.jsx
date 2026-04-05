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
    phone_number: "",
  });

  const [errors, setErrors] = useState({});
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Fetch courses from backend
  useState(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await fetch("http://127.0.0.1:8000/api/courses/");
        if (res.ok) {
          const data = await res.json();
          // The API returns { success: true, data: [...] } or just [...]
          const courseList = Array.isArray(data) ? data : (data.data || []);
          setCourses(courseList);
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  // ---------------- VALIDATION ----------------
  const validateStep1 = () => {
    let err = {};
    if (!formData.username) err.username = "Username required";
    if (!formData.email.includes("@")) err.email = "Enter valid email";
    if (!formData.phone_number) err.phone_number = "Phone number required";
    if (!formData.course) err.course = "Please select a course";
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
          <div 
            onClick={() => setStep(1)}
            className={`p-4 rounded-lg cursor-pointer transition-all ${step === 1 ? "bg-slate-800 ring-2 ring-blue-400" : "bg-slate-700 hover:bg-slate-600"}`}
          >
            Step 1: Basic Details
          </div>
          <div 
            onClick={() => {
              // Only allow switching to step 2 if step 1 is valid
              const err = validateStep1();
              if (Object.keys(err).length === 0) {
                setStep(2);
                setErrors({});
              } else {
                setErrors(err);
                toast.error("Please complete Step 1 first");
              }
            }}
            className={`p-4 rounded-lg cursor-pointer transition-all ${step === 2 ? "bg-slate-800 ring-2 ring-blue-400" : "bg-slate-700 hover:bg-slate-600"}`}
          >
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
                value={formData.username}
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
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}

              {/* COURSE SELECTION */}
              <select
                className="form-select py-3 mt-3 focus:ring-2 focus:ring-blue-500"
                value={formData.course}
                onChange={(e) =>
                  setFormData({ ...formData, course: e.target.value })
                }
              >
                <option value="">-- Select Your Course --</option>
                {courses.length > 0 ? (
                  courses.map((c) => (
                    <option key={c.id} value={c.title}>{c.title}</option>
                  ))
                ) : (
                  <>
                    <option value="Python Full Stack">Python Full Stack</option>
                    <option value="Java Full Stack">Java Full Stack</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                  </>
                )}
              </select>
              {errors.course && (
                <p className="text-red-500 text-sm mt-1">{errors.course}</p>
              )}
              
              <input
                type="text"
                placeholder="Phone Number"
                className="form-control py-3 mt-3 focus:ring-2 focus:ring-blue-500"
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                value={formData.phone_number}
              />
              {errors.phone_number && (
                <p className="text-red-500 text-sm">{errors.phone_number}</p>
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
                  value={formData.password}
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
              <div className="relative mb-4">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="form-control py-3 focus:ring-2 focus:ring-blue-500"
                  value={formData.confirmPassword}
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
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
              </select>

              {/* FACULTY INFO */}
              {formData.role === "Faculty" && (
                <p className="text-sm text-orange-600 mb-3">
                  Faculty accounts require OTP verification
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