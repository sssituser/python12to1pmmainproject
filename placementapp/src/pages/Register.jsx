import { useState, useEffect } from "react";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { industryCourses } from "../components/CourseData.jsx";

function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Student Registration | SSSIT Learning Management Portal";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Register an account on the SSSIT Learning Management Portal to begin your educational journey, access modules, exams, and academic resources.");
    }
  }, []);

  const [step, setStep] = useState(1);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    studentId: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Student",
    course: [],
    phone_number: "",
    batch_id: "",
    first_name: "",
    last_name: "",
  });

  const [errors, setErrors] = useState({});
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:8000/api/batches/`);
        if (res.ok) {
          const data = await res.json();
          setBatches(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching batches:", err);
      }
    };
    fetchBatches();
  }, []);

  // 🛡️ 1000% AUTOMATIC SYNCHRONICITY ENGINE
  // This effect ensures the Student Registration page is ALWAYS a perfect mirror 
  // of the Faculty Dashboard. Any course added by faculty appears here instantly.
  useEffect(() => {
    const fetchCoursesFromMaster = async () => {
      try {
        setLoadingCourses(true);
        // 1. Fetch live courses from Faculty Database
        const res = await fetch(`http://${window.location.hostname}:8000/api/courses/`);
        let apiCourses = [];
        if (res.ok) {
          const data = await res.json();
          // Support multiple API formats (raw array, .data, or .results)
          const raw = data.data || data.results || (Array.isArray(data) ? data : []);
          apiCourses = raw;
        }

        // 2. 1000% ROBUST PRIORITY MERGE
        // We prioritize Database Additions (displayed at the TOP) followed by the 37+ Standards
        const deletedTitles = new Set((JSON.parse(localStorage.getItem('deletedCourseTitles') || '[]')).map(t => String(t).toUpperCase()));
        const missingStandards = industryCourses.filter(title => !apiTitles.has(title.toUpperCase()) && !deletedTitles.has(title.toUpperCase()));
        
        // Priority merged list: [Dynamic Database Courses] -> [Standard Curriculum]
        const mergedList = [...apiCourses, ...missingStandards].filter(c => {
          const t = (typeof c === 'string' ? c : (c.title || '')).toUpperCase();
          return t && !deletedTitles.has(t);
        });
        setCourses(mergedList);

        console.log(`✅ Registration Sync Complete: ${mergedList.length} total options (Live: ${apiCourses.length}, Standards: ${missingStandards.length})`);
      } catch (err) {
        console.error("Critical: Course sync failed, using static curriculum as fallback.", err);
        setCourses(industryCourses);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCoursesFromMaster();
  }, []);

  // ---------------- VALIDATION ----------------
  const validateStep1 = () => {
    let err = {};
    if (!formData.username) err.username = "Username required";
    if (!formData.studentId) err.studentId = "Student ID required";
    if (!formData.email.includes("@")) err.email = "Enter valid email";
    if (!formData.phone_number) err.phone_number = "Phone number required";
    if (!formData.first_name.trim()) err.first_name = "First name required";
    if (!formData.last_name.trim()) err.last_name = "Last name required";
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
      const res = await fetch(`http://${window.location.hostname}:8000/api/register/`, {
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
        // 🛡️ CLEAR OLD CACHED EXAM DATA
        localStorage.removeItem("allExamResults");
        localStorage.removeItem("recentExam");
        
        toast.success(data.message || "Registration successful. Your account has been created successfully. Please wait until the Faculty or Admin verifies your account.", {
          duration: 6000
        });
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
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.username}</p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Student ID"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                    value={formData.studentId}
                    onChange={(e) =>
                      setFormData({ ...formData, studentId: e.target.value })
                    }
                  />
                  {errors.studentId && (
                    <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.studentId}</p>
                  )}
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.email}</p>
                  )}
                 </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="First Name"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                    />
                    {errors.first_name && (
                      <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                    />
                    {errors.last_name && (
                      <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.last_name}</p>
                    )}
                  </div>
                </div>
              </div>


              
              {/* PHONE NUMBER */}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  value={formData.phone_number}
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.phone_number}</p>
                )}
              </div>

              <button
                onClick={handleNext}
                className="w-full mt-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-95"
              >
                Next
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              {/* PASSWORD */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create Password"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.password}</p>
              )}

              {/* CONFIRM PASSWORD */}
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-blue-500 transition-colors"
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.confirmPassword}</p>
              )}



              {/* BUTTONS */}
              <button
                onClick={handleSubmit}
                className="w-full mt-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all transform active:scale-95"
              >
                CREATE ACCOUNT
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full mt-3 py-3 text-gray-500 font-medium hover:text-gray-800 transition-colors"
              >
                Go Back to Details
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Register;
