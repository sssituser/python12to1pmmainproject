import axios from "axios";
import { Edit3 } from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUsername = storedUser.username || "guest";
  const localStorageKey = `sssit-profile-${currentUsername}`;
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    parentPhone: "",
    studentId: "",
    state: "",
    cgpa: "",
    github: "",
    linkedin: "",
    profileImage: null,
    profileImageUrl: "",
    resume: null,
    resumeUrl: "",
    skills: [],
    projects: [],
    education: [],
    courses: []
  });

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loadingLeaveRequests, setLoadingLeaveRequests] = useState(false);

  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [skill, setSkill] = useState("");
  const [project, setProject] = useState({ title: "", desc: "", link: "" });
  const [edu, setEdu] = useState({ college: "", degree: "", year: "" });

  const getStoredToken = (key) => {
    const raw = localStorage.getItem(key);
    return raw ? raw.replace(/^"|"$/g, "") : null;
  };

  const clearSession = (message) => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    // Clear all profile-related caches
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("sssit-profile")) localStorage.removeItem(key);
    });
    if (message) toast.error(message);
    navigate("/");
  };

  const getAuthHeaders = (token) => ({ Authorization: `Bearer ${token}` });

  // Fetch leave requests
  const fetchLeaveRequests = (token) => {
    setLoadingLeaveRequests(true);
    axios.get(`http://${window.location.hostname}:8000/api/leave-requests/my-requests/`, {
      headers: getAuthHeaders(token)
    })
      .then(res => {
        setLeaveRequests(Array.isArray(res.data) ? res.data : []);
        setLoadingLeaveRequests(false);
      })
      .catch(err => {
        console.error("Error fetching leave requests:", err);
        setLeaveRequests([]);
        setLoadingLeaveRequests(false);
      });
  };

  useEffect(() => {
    const token = getStoredToken("access");
    if (!token) {
      clearSession("Session expired. Please log in again.");
      return;
    }

    setLoading(true);

    // Fetch profile data
    axios.get(`http://${window.location.hostname}:8000/api/profile/`, {
      headers: getAuthHeaders(token)
    })
      .then(res => {
        const nextData = {
          name: res.data.name || res.data.email?.split('@')[0] || "Student",
          email: res.data.email || "",
          phone: res.data.phone || "",
          parentPhone: res.data.parent_phone || res.data.parentPhone || "",
          studentId: res.data.student_id || res.data.studentId || "",
          state: res.data.state || "",
          cgpa: res.data.cgpa || "",
          github: res.data.github || "",
          linkedin: res.data.linkedin || "",
          profileImage: null,
          profileImageUrl: res.data.profile_image || res.data.profileImageUrl || "",
          resume: null,
          resumeUrl: res.data.resume || res.data.resumeUrl || "",
          skills: Array.isArray(res.data.skills) ? res.data.skills : [],
          projects: Array.isArray(res.data.projects) ? res.data.projects : [],
          education: Array.isArray(res.data.education) ? res.data.education : [],
          courses: res.data.enrolled_courses || []
        };
        
        // Sync the main 'user' object in localStorage
        try {
          const userObj = JSON.parse(localStorage.getItem("user") || "{}");
          userObj.enrolledCourses = nextData.courses;
          userObj.course = nextData.courses[0] || "";
          localStorage.setItem("user", JSON.stringify(userObj));
        } catch (e) {}

        setFormData(nextData);
        localStorage.setItem(localStorageKey, JSON.stringify(nextData));
        setLoading(false);
      })
      .catch(err => {
        console.error("Profile fetch error:", err);
        if (err.response?.status === 401) {
          clearSession("Unauthorized. Please log in again.");
          return;
        }
        
        const cached = localStorage.getItem(localStorageKey);
        if (cached) {
          try {
            setFormData(JSON.parse(cached));
          } catch (pe) {}
        }
        setLoading(false);
      });

    // Fetch leave requests
    fetchLeaveRequests(token);

    // Listen for leave request updates and exam completions
    const handleLeaveRequestUpdate = () => fetchLeaveRequests(token);
    const handleExamUpdate = () => {
       console.log("🔄 Profile - Exam completed, refreshing data...");
       axios.get(`http://${window.location.hostname}:8000/api/profile/`, { 
         headers: getAuthHeaders(token) 
       }).then(res => setFormData(prev => ({...prev, ...res.data})));
    };
    window.addEventListener("leaveRequestUpdated", handleLeaveRequestUpdate);
    window.addEventListener("examDataUpdated", handleExamUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "leaveRequestUpdated") handleLeaveRequestUpdate();
    });

    return () => {
       window.removeEventListener("leaveRequestUpdated", handleLeaveRequestUpdate);
       window.removeEventListener("examDataUpdated", handleExamUpdate);
    };
  }, [localStorageKey]);

  // 📝 change
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFile = (e) =>
    setFormData({ ...formData, resume: e.target.files[0] });

  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profileImage: file });
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const addNotification = (title, message) => {
    try {
      const raw = localStorage.getItem("notifications") || "[]";
      const list = JSON.parse(raw);
      const next = [
        {
          id: Date.now(),
          title,
          message,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...(Array.isArray(list) ? list : []),
      ].slice(0, 20);
      localStorage.setItem("notifications", JSON.stringify(next));
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (error) {
      console.error("Notifications update failed", error);
    }
  };

  // ➕ Add
const addSkill = () => {
  if (!skill.trim()) return;

  const currentSkills = Array.isArray(formData.skills) ? formData.skills : [];

  setFormData({
    ...formData,
    skills: [...currentSkills, { name: skill, level: 50 }]
  });

  setSkill("");
};

  const addProject = () => {
    if (!project.title.trim()) return;
    const currentProjects = Array.isArray(formData.projects) ? formData.projects : [];
    setFormData({ ...formData, projects: [...currentProjects, project] });
    setProject({ title: "", desc: "", link: "" });
  };

  const addEdu = () => {
    if (!edu.college.trim()) return;
    const currentEducation = Array.isArray(formData.education) ? formData.education : [];
    setFormData({ ...formData, education: [...currentEducation, edu] });
    setEdu({ college: "", degree: "", year: "" });
  };

  const removeItem = (type, i) => {
    const currentArray = Array.isArray(formData[type]) ? formData[type] : [];
    setFormData({
      ...formData,
      [type]: currentArray.filter((_, idx) => idx !== i)
    });
  };

  // ✅ Submit
  const resolveMediaUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `http://${window.location.hostname}:8000${path}`;
  };

  const profileImageSrc =
    profileImagePreview ||
    resolveMediaUrl(formData.profileImageUrl) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || "Student")}&background=2563EB&color=ffffff`;

  const handleSubmit = async () => {
    const token = getStoredToken("access");
    if (!token) {
      clearSession("Missing access token. Please log in again.");
      return;
    }

    const normalizedSkills = Array.isArray(formData.skills)
      ? formData.skills.map((skillItem) =>
          typeof skillItem === "string"
            ? { name: skillItem }
            : {
                id: skillItem?.id,
                name: skillItem?.name || skillItem?.title || "",
                level: skillItem?.level || 50,
              }
        )
      : [];

      const updateSkillLevel = (index, value) => {
      const updated = [...formData.skills];
      updated[index] = {
      ...updated[index],
      level: Number(value)
      };
      setFormData({ ...formData, skills: updated });
      };

    const normalizedProjects = Array.isArray(formData.projects)
      ? formData.projects.map((projectItem) =>
          projectItem && typeof projectItem === "object"
            ? {
                id: projectItem?.id,
                title: projectItem.title || "",
                description: projectItem.desc || projectItem.description || "",
              }
            : { title: String(projectItem || ""), description: "" }
        )
      : [];

    const normalizedEducation = Array.isArray(formData.education)
      ? formData.education
      : [];

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "resume") {
        if (value instanceof File) {
          data.append("resume", value);
        }
        return;
      }

      if (key === "profileImage") {
        if (value instanceof File) {
          data.append("profile_image", value);
        }
        return;
      }

      if (key === "resumeUrl" || key === "profileImageUrl") {
        return;
      }

      if (key === "skills") {
        data.append("skills", JSON.stringify(normalizedSkills));
        return;
      }

      if (key === "projects") {
        data.append("projects", JSON.stringify(normalizedProjects));
        return;
      }

      if (key === "education") {
        if (Array.isArray(normalizedEducation) && normalizedEducation.length > 0) {
          data.append("education", JSON.stringify(normalizedEducation));
        }
        return;
      }

      if (key === "studentId") {
        data.append("student_id", value);
        return;
      }

      if (key === "parentPhone") {
        // Only send parent_phone if it has a value
        if (value && value.trim() !== "") {
          data.append("parent_phone", value);
        }
        return;
      }

      if (key === "phone") {
        // Only send phone if it has a value
        if (value && value.trim() !== "") {
          data.append("phone", value);
        }
        return;
      }

      if (key === "state") {
        // Only send state if it has a value
        if (value && value.trim() !== "") {
          data.append("state", value);
        }
        return;
      }

      if (key === "courses") {
        data.append("courses", JSON.stringify(value));
        return;
      }

      if (value !== undefined && value !== null) {
        data.append(key, value);
      }
    });

    console.log("DEBUG: Form data being sent:", Object.fromEntries(data.entries()));

    try {
      await axios.put(`http://${window.location.hostname}:8000/api/profile/update/`, data, {
        headers: getAuthHeaders(token)
      });

      const refreshed = await axios.get(`http://${window.location.hostname}:8000/api/profile/`, {
        headers: getAuthHeaders(token)
      });
      console.log("DEBUG: Refreshed API response after save:", refreshed.data);
      const refreshedData = {
        name: refreshed.data.name || "",
        email: refreshed.data.email || "",
        phone: refreshed.data.phone || "",
        parentPhone: refreshed.data.parent_phone || refreshed.data.parentPhone || "",
        studentId: refreshed.data.student_id || refreshed.data.studentId || "",
        state: refreshed.data.state || "",
        cgpa: refreshed.data.cgpa || "",
        github: refreshed.data.github || "",
        linkedin: refreshed.data.linkedin || "",
        profileImage: null,
        profileImageUrl: refreshed.data.profile_image || refreshed.data.profileImageUrl || formData.profileImageUrl || "",
        resume: null,
        resumeUrl: refreshed.data.resume || refreshed.data.resumeUrl || formData.resumeUrl || "",
        skills: Array.isArray(refreshed.data.skills) ? refreshed.data.skills : [],
        projects: Array.isArray(refreshed.data.projects) ? refreshed.data.projects : [],
        education: Array.isArray(refreshed.data.education) ? refreshed.data.education : [],
        courses: refreshed.data.enrolled_courses || (refreshed.data.course_title ? [refreshed.data.course_title] : [])
      };
      setFormData(refreshedData);
      localStorage.setItem(localStorageKey, JSON.stringify(refreshedData));
      setProfileImagePreview("");
      addNotification("Profile Updated", "Your profile was saved successfully.");
      toast.success("profile saved successfully");
      setEditMode(false);
      
      // Notify Navbar to refresh profile image
      localStorage.setItem("profileImageUpdated", Date.now().toString());
      
      // Also update the profile image in localStorage for immediate effect
      if (refreshedData.profileImageUrl) {
        const imageUrl = refreshedData.profileImageUrl.startsWith('http') 
          ? refreshedData.profileImageUrl 
          : `http://${window.location.hostname}:8000${refreshedData.profileImageUrl}`;
        localStorage.setItem("userProfileImage", imageUrl);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        clearSession("Unauthorized. Please log in again.");
        return;
      }
      console.error("Profile save error:", err.response?.data || err);
      toast.error(
        err.response?.data?.detail ||
        err.response?.data ||
        "Failed to save profile"
      );
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-white">
      <Toaster />

      {/* PROFILE CARD */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-slate-100 border border-gray-200">
                <img
                  src={profileImageSrc}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{formData.name || "Your Name"}</h2>
                <p className="text-gray-600 text-sm mt-1">{formData.email || "No email provided"}</p>
              </div>
            </div>

            <button
              onClick={() => setEditMode(true)}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition"
              title="Edit profile"
            >
              <Edit3 size={18} />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">

          {/* BASIC INFO */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["name", "email", "phone"].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field}
                  </label>
                  {editMode ? (
                    <input
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      placeholder={field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  ) : (
                    <p className="text-gray-700">{formData[field] || "-"}</p>
                  )}
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                {editMode ? (
                  <input
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="Student ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <p className="text-gray-700">{formData.studentId || "-"}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent's Mobile</label>
                {editMode ? (
                  <input
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    placeholder="Parent's Mobile Number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <p className="text-gray-700">{formData.parentPhone || "-"}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                {editMode ? (
                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <p className="text-gray-700">{formData.state || "-"}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
                {editMode ? (
                  <input
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleChange}
                    placeholder="CGPA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <p className="text-gray-700">{formData.cgpa || "-"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 leading-relaxed">
                   Enrolled Programs
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(Array.isArray(formData.courses) && formData.courses.length > 0) ? (
                    formData.courses.map((c, i) => (
                      <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-black rounded-lg border border-blue-100 uppercase tracking-tight">
                        {c}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 italic text-sm">No courses registered</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                {editMode ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFile}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <p className="text-gray-700">{formData.profileImageUrl ? "Uploaded" : "No image uploaded"}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Resume</label>
                {editMode ? (
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFile}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : formData.resumeUrl ? (
                  <a
                    href={resolveMediaUrl(formData.resumeUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Download Resume
                  </a>
                ) : (
                  <p className="text-gray-700">No resume uploaded</p>
                )}
              </div>
            </div>
          </div>

          {/* SOCIAL LINKS */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                {editMode ? (
                  <input
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="GitHub Profile URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <a href={formData.github} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                    {formData.github || "-"}
                  </a>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                {editMode ? (
                  <input
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="LinkedIn Profile URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <a href={formData.linkedin} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                    {formData.linkedin || "-"}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* SKILLS */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>

            {editMode && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  placeholder="Add a skill"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={addSkill}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Add Skill
                </button>
              </div>
            )}

            <div className="space-y-3">
              {(Array.isArray(formData.skills) && formData.skills.length > 0) ? (
                formData.skills.map((s, i) => {
                  const skillName = typeof s === "string" ? s : s?.name || "Skill";
                  const level = typeof s === "object" ? s?.level || 50 : 50;

                  return (
                    <div key={i} className="p-3 border rounded-lg bg-gray-50">

                      {/* HEADER */}
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{skillName}</span>
                        <span className="text-sm text-gray-600">{level}%</span>
                      </div>

                      {/* PROGRESS BAR */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${level}%` }}
                        ></div>
                      </div>

                      {/* EDIT MODE SLIDER */}
                      {editMode && (
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={level}
                            onChange={(e) => updateSkillLevel(i, e.target.value)}
                            className="w-full"
                          />

                          <button
                            onClick={() => removeItem("skills", i)}
                            className="text-red-600 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">No skills added</p>
              )}
            </div>
          </div>

          {/* PROJECTS */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects</h3>

            {editMode && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  placeholder="Project Title"
                  value={project.title}
                  onChange={(e) => setProject({ ...project, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <textarea
                  placeholder="Description"
                  value={project.desc}
                  onChange={(e) => setProject({ ...project, desc: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="3"
                />
                <button
                  onClick={addProject}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  Add Project
                </button>
              </div>
            )}

            <div className="space-y-3">
              {(Array.isArray(formData.projects) && formData.projects.length > 0) ? (
                formData.projects.map((p, i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{p.title}</h4>
                      {editMode && (
                        <button
                          onClick={() => removeItem("projects", i)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm">{p.desc}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No projects added</p>
              )}
            </div>
          </div>

          {/* EDUCATION */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>

            {editMode && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  placeholder="College/University"
                  value={edu.college}
                  onChange={(e) => setEdu({ ...edu, college: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => setEdu({ ...edu, degree: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={addEdu}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                >
                  Add Education
                </button>
              </div>
            )}

            <div className="space-y-2">
              {(Array.isArray(formData.education) && formData.education.length > 0) ? (
                formData.education.map((e, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg text-gray-700">
                    <span className="font-semibold">{e.college}</span> - {e.degree}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No education added</p>
              )}
            </div>
          </div>

          {/* LEAVE REQUESTS */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Requests</h3>
            
            {loadingLeaveRequests ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 mt-2">Loading leave requests...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaveRequests.length > 0 ? (
                  leaveRequests.map((leave, index) => (
                    <div key={leave.id || index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{leave.leave_type_display || leave.leave_type}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{leave.reason}</p>
                      {leave.approved_by && (
                        <p className="text-xs text-gray-500 mt-2">Approved by: {leave.approved_by}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No leave requests found</p>
                )}
              </div>
            )}
          </div>

        </div>

        {/* SAVE BUTTON */}
        {editMode && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <button
              onClick={handleSubmit}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              Save Profile
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
