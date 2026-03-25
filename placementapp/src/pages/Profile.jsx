import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ProfileCard() {
  const [editMode, setEditMode] = useState(false);
  const [ats, setAts] = useState(null);
  const [jobDesc, setJobDesc] = useState("");

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
    axios.get("http://localhost:8000/api/profile/")
      .then(res => {
        setFormData({
          ...res.data,
          resume: null,
          resumeUrl: res.data.resume
        });
      });
  }, []);

  // 📝 change
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFile = (e) =>
    setFormData({ ...formData, resume: e.target.files[0] });

  // ➕ Add
  const addSkill = () => {
    if (!skill) return;
    setFormData({ ...formData, skills: [...formData.skills, skill] });
    setSkill("");
  };

  const addProject = () => {
    if (!project.title) return;
    setFormData({ ...formData, projects: [...formData.projects, project] });
    setProject({ title: "", desc: "", link: "" });
  };

  const addEdu = () => {
    if (!edu.college) return;
    setFormData({ ...formData, education: [...formData.education, edu] });
    setEdu({ college: "", degree: "", year: "" });
  };

  const removeItem = (type, i) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter((_, idx) => idx !== i)
    });
  };

  // 🤖 ATS
  const checkATS = () => {
    const jd = jobDesc.toLowerCase();
    let score = 50;

    formData.skills.forEach(s => {
      if (jd.includes(s.toLowerCase())) score += 5;
    });

    if (formData.projects.length) score += 10;
    if (formData.github) score += 10;
    if (formData.linkedin) score += 5;

    setAts(Math.min(score, 100));
  };

  // ✅ Submit
  const handleSubmit = async () => {
    const data = new FormData();

    Object.keys(formData).forEach(key => {
      if (key === "resume" && formData.resume) {
        data.append("resume", formData.resume);
      } else {
        data.append(key, JSON.stringify(formData[key]));
      }
    });

    await axios.put("http://localhost:8000/api/profile/update/", data);
    alert("Profile Saved ✅");
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-light d-flex justify-content-center p-4">

      <div className="card shadow-lg w-100" style={{ maxWidth: "1000px", borderRadius: "20px" }}>
        <div className="card-body p-4">

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold">{formData.name || "Your Name"}</h3>
              <p className="text-muted mb-0">{formData.email}</p>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "View" : "Edit"}
            </button>
          </div>

          {/* BASIC */}
          <div className="row g-3 mb-4">
            {["name", "email", "phone", "state", "cgpa"].map(field => (
              <div className="col-md-4" key={field}>
                {editMode ? (
                  <input
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    placeholder={field}
                    className="form-control"
                  />
                ) : (
                  <div><strong>{field}:</strong> {formData[field]}</div>
                )}
              </div>
            ))}
          </div>

          {/* SOCIAL */}
          <div className="mb-4">
            <h5>Social Links</h5>
            {editMode ? (
              <div className="row g-3">
                <div className="col-md-6">
                  <input name="github" value={formData.github} onChange={handleChange} className="form-control" placeholder="GitHub" />
                </div>
                <div className="col-md-6">
                  <input name="linkedin" value={formData.linkedin} onChange={handleChange} className="form-control" placeholder="LinkedIn" />
                </div>
              </div>
            ) : (
              <>
                <p>{formData.github}</p>
                <p>{formData.linkedin}</p>
              </>
            )}
          </div>

          {/* SKILLS */}
          <div className="mb-4">
            <h5>Skills</h5>

            {editMode && (
              <div className="d-flex gap-2 mb-2">
                <input value={skill} onChange={(e) => setSkill(e.target.value)} className="form-control" />
                <button onClick={addSkill} className="btn btn-primary">Add</button>
              </div>
            )}

            {formData.skills.map((s, i) => (
              <span key={i} className="badge bg-primary me-2 mb-2">
                {s}
                {editMode && (
                  <span onClick={() => removeItem("skills", i)} style={{ cursor: "pointer", marginLeft: "5px" }}> ✕</span>
                )}
              </span>
            ))}
          </div>

          {/* PROJECTS */}
          <div className="mb-4">
            <h5>Projects</h5>

            {editMode && (
              <>
                <input placeholder="Title" className="form-control mb-2"
                  value={project.title}
                  onChange={(e) => setProject({ ...project, title: e.target.value })}
                />
                <input placeholder="Description" className="form-control mb-2"
                  value={project.desc}
                  onChange={(e) => setProject({ ...project, desc: e.target.value })}
                />
                <button onClick={addProject} className="btn btn-success mb-2">
                  Add Project
                </button>
              </>
            )}

            {formData.projects.map((p, i) => (
              <div key={i} className="border p-2 rounded mb-2">
                <b>{p.title}</b>
                <p>{p.desc}</p>
                {editMode && (
                  <button onClick={() => removeItem("projects", i)} className="btn btn-sm btn-danger">
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* EDUCATION */}
          <div className="mb-4">
            <h5>Academic Background</h5>

            {editMode && (
              <>
                <input placeholder="College" className="form-control mb-2"
                  value={edu.college}
                  onChange={(e) => setEdu({ ...edu, college: e.target.value })}
                />
                <input placeholder="Degree" className="form-control mb-2"
                  value={edu.degree}
                  onChange={(e) => setEdu({ ...edu, degree: e.target.value })}
                />
                <button onClick={addEdu} className="btn btn-purple mb-2">
                  Add Education
                </button>
              </>
            )}

            {formData.education.map((e, i) => (
              <div key={i}>
                {e.college} - {e.degree}
              </div>
            ))}
          </div>

          {/* ATS */}
          <div className="mb-4">
            <h5>ATS Checker</h5>

            <textarea
              className="form-control mb-2"
              placeholder="Paste Job Description"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />

            <button onClick={checkATS} className="btn btn-warning">
              Check ATS
            </button>

            {ats && <p className="mt-2">Score: {ats}%</p>}
          </div>

          {/* SAVE */}
          {editMode && (
            <div className="text-end">
              <button onClick={handleSubmit} className="btn btn-success px-4">
                Save Profile
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}