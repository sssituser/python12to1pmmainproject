import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Profile() {
  const [editMode, setEditMode] = useState(false);
  const [ats, setAts] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    cgpa: "",
    github: "",
    linkedin: "",
    resume: null,
    resumeUrl: "",
    skills: [],
    projects: [],
    education: []
  });

  const [skill, setSkill] = useState("");
  const [project, setProject] = useState({ title: "", desc: "", link: "" });
  const [edu, setEdu] = useState({ college: "", degree: "", year: "" });

  // 🔄 Fetch
  useEffect(() => {
    const token = localStorage.getItem("access");
    axios.get("http://127.0.0.1:8000/api/profile/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          state: res.data.state || "",
          cgpa: res.data.cgpa || "",
          github: res.data.github || "",
          linkedin: res.data.linkedin || "",
          resume: null,
          resumeUrl: res.data.resume || "",
          skills: Array.isArray(res.data.skills) ? res.data.skills : [],
          projects: Array.isArray(res.data.projects) ? res.data.projects : [],
          education: Array.isArray(res.data.education) ? res.data.education : []
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching profile:", err);
        setLoading(false);
      });
  }, []);

  // 📝 change
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFile = (e) =>
    setFormData({ ...formData, resume: e.target.files[0] });

  // ➕ Add
  const addSkill = () => {
    if (!skill.trim()) return;
    const currentSkills = Array.isArray(formData.skills) ? formData.skills : [];
    setFormData({ ...formData, skills: [...currentSkills, skill] });
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

  // 🤖 ATS
  const checkATS = () => {
    const jd = jobDesc.toLowerCase();
    let score = 50;

    const skills = Array.isArray(formData.skills) ? formData.skills : [];
    const projects = Array.isArray(formData.projects) ? formData.projects : [];

    skills.forEach(s => {
      if (jd.includes(s.toLowerCase())) score += 5;
    });

    if (projects.length) score += 10;
    if (formData.github) score += 10;
    if (formData.linkedin) score += 5;

    setAts(Math.min(score, 100));
  };

  // ✅ Submit
  const handleSubmit = async () => {
    const token = localStorage.getItem("access");
    const data = new FormData();

    Object.keys(formData).forEach(key => {
      if (key === "resume" && formData.resume) {
        data.append("resume", formData.resume);
      } else if (key !== "resumeUrl") {
        data.append(key, JSON.stringify(formData[key]));
      }
    });

    try {
      await axios.put("http://127.0.0.1:8000/api/profile/update/", data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Profile Saved ✅");
      setEditMode(false);
    } catch (err) {
      toast.error("Failed to save profile");
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-white">

      {/* PROFILE CARD */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{formData.name || "Your Name"}</h2>
              <p className="text-gray-600 text-sm mt-1">{formData.email}</p>
            </div>

            <button
              onClick={() => setEditMode(!editMode)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              {editMode ? "Cancel" : "Edit"}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">

          {/* BASIC INFO */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["name", "email", "phone", "state"].map(field => (
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
              <div className="flex gap-2 mb-4">
                <input
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  placeholder="Add a skill"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Add
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {(Array.isArray(formData.skills) && formData.skills.length > 0) ? (
                formData.skills.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {s}
                    {editMode && (
                      <button
                        onClick={() => removeItem("skills", i)}
                        className="ml-1 font-bold hover:text-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))
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

          {/* ATS CHECKER */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ATS Score Checker</h3>
            <textarea
              placeholder="Paste Job Description here"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-3"
              rows="4"
            />

            <button
              onClick={checkATS}
              className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition"
            >
              Check ATS Score
            </button>

            {ats && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-lg font-semibold text-gray-900">
                  ATS Score: <span className={ats >= 70 ? "text-green-600" : ats >= 50 ? "text-yellow-600" : "text-red-600"}>
                    {ats}%
                  </span>
                </p>
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