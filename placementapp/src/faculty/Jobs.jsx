import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Jobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    job_title: "",
    company: "",
    location: "",
    job_type: "",
    experience: "",
    salary: "",
    primary_skills: "",
    eligibility: "",
    description: "",
    responsibilities: "",
    external_application_link: "",
    deadline: ""
  });

  function fetchJobs() {
    const token = localStorage.getItem("access");

    fetch("http://127.0.0.1:8000/api/admin/jobs/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          navigate("/faculty/login", { replace: true });
          return [];
        }
        if (!res.ok) {
          console.error("Failed to load jobs", res.status);
          return [];
        }
        return await res.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : data.results;
        setJobs(list || []);
      })
      .catch(err => {
        console.error("Fetch jobs error", err);
      });
  }

  useEffect(() => {
    fetchJobs();
  }, []);

//   function handleChange(e) {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   }
    function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    }


function createJob(e) {
  e.preventDefault();

  const token = localStorage.getItem("access");

  if (!token) {
    console.error("Please login again ❌");
    return;
  }

  console.log("FORM DATA:", form);

  const url = form.id
    ? `http://127.0.0.1:8000/api/admin/jobs/${form.id}/`   // UPDATE
    : `http://127.0.0.1:8000/api/admin/jobs/`;             // CREATE

  const method = form.id ? "PATCH" : "POST";

  const payload = {
  job_title: form.job_title,
  company: form.company,
  location: form.location,
  job_type: form.job_type,
  experience: form.experience,
  salary: form.salary,
  primary_skills: form.primary_skills,
  eligibility: form.eligibility,
  description: form.description,
  responsibilities: form.responsibilities,
  external_application_link: form.external_application_link,
  deadline: form.deadline
};

fetch(url, {
  method: method,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify(payload)   // ✅ FIXED
})
    .then(async (res) => {
      const data = await res.json();

      console.log("STATUS:", res.status);
      console.log("RESPONSE:", data);

      if (res.status === 200 || res.status === 201) {
        console.log(form.id ? "Job Updated ✅" : "Job Posted ✅");
        setShowForm(false);

        setForm({
          job_title: "",
          company: "",
          location: "",
          job_type: "",
          experience: "",
          salary: "",
          primary_skills: "",
          eligibility: "",
          description: "",
          responsibilities: "",
          external_application_link: "",
          deadline: ""
        });

        fetchJobs();
      } else {
        console.error("Error ❌ Check console");
      }
    })
    .catch(err => {
      console.log("ERROR:", err);
      console.error("Server error ❌");
    });
}

  

  function deleteJob(id) {
    const token = localStorage.getItem("access");

    fetch(`http://127.0.0.1:8000/api/admin/jobs/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          navigate("/faculty/login", { replace: true });
          return;
        }
        if (!res.ok) {
          console.error("Delete failed", res.status);
        }
      })
      .finally(() => fetchJobs());
  }

  return (

    <div className="container">
        <button
          className="btn btn-primary mb-3"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close Form ❌" : "Add Job ➕"}
        </button>

      <h3 className="mb-4">💼 Job Management</h3>

      {/* ================= FORM ================= */}
      {showForm && (
      <div className="card shadow p-4 mb-4">

        <h5>Post New Job</h5>

        <form onSubmit={createJob}>
          <div className="row">

            <div className="col-md-6 mb-2">
              <input name="job_title" placeholder="Job Title"
                className="form-control"
                value={form.job_title}
                onChange={handleChange} required />
            </div>

            <div className="col-md-6 mb-2">
              <input name="company" placeholder="Company"
                className="form-control"
                value={form.company}
                onChange={handleChange} required />
            </div>

            <div className="col-md-6 mb-2">
              <input name="location" placeholder="Location"
                className="form-control"
                value={form.location}
                onChange={handleChange} />
            </div>

            {/* DROPDOWN */}
            <div className="col-md-6 mb-2">
              <select name="job_type" className="form-control"
                value={form.job_type} onChange={handleChange}>
                <option value="">Job Type</option>
                <option>Full Time</option>
                <option>Internship</option>
                <option>Remote</option>
              </select>
            </div>

            {/* DROPDOWN */}
            <div className="col-md-6 mb-2">
              <select name="experience" className="form-control"
                value={form.experience} onChange={handleChange}>
                <option value="">Experience</option>
                <option>0–1 Years</option>
                <option>1–3 Years</option>
                <option>3–5 Years</option>
                <option>5+ Years</option>
              </select>
            </div>

            {/* DROPDOWN */}
            <div className="col-md-6 mb-2">
              <select name="salary" className="form-control"
                value={form.salary} onChange={handleChange}>
                <option value="">Salary</option>
                <option>3–4 LPA</option>
                <option>4–6 LPA</option>
                <option>6–10 LPA</option>
                <option>10+ LPA</option>
              </select>
            </div>

            <div className="col-md-6 mb-2">
              <input name="primary_skills" placeholder="Skills"
                className="form-control"
                value={form.primary_skills}
                onChange={handleChange} />
            </div>

            <div className="col-md-6 mb-2">
              <input name="eligibility" placeholder="Eligibility"
                className="form-control"
                value={form.eligibility}
                onChange={handleChange} />
            </div>

            {/* ✅ FIXED */}
            <div className="col-md-12 mb-2">
              <textarea name="description" placeholder="Description"
                className="form-control"
                value={form.description}
                onChange={handleChange} />
            </div>

            {/* ✅ FIXED */}
            <div className="col-md-12 mb-2">
              <textarea name="responsibilities" placeholder="Responsibilities"
                className="form-control"
                value={form.responsibilities}
                onChange={handleChange} />
            </div>

            <div className="col-md-6 mb-2">
              <input type="date" name="deadline"
                className="form-control"
                value={form.deadline}
                onChange={handleChange} />
            </div>

            <div className="col-md-6 mb-2">
              <input name="external_application_link" placeholder="External Application Link"
                className="form-control"
                value={form.external_application_link}
                onChange={handleChange} />
            </div>

          </div>

          <button type="submit" className="btn btn-success mt-2">
            {form.id ? "UPDATE JOB " : "POST JOB "}
          </button>

        </form>
      </div>
     )}

      {/* ================= TABLE ================= */}

<div className="card shadow p-4">

  <h5>All Jobs</h5>

  <div style={{ overflowX: "auto" }}>

    <table
      className="table table-hover align-middle"
      style={{ minWidth: "1200px" }}
    >

      <thead className="bg-slate-800 text-white">
        <tr className="align-middle">
          <th className="px-4 py-4 text-start font-bold border-r border-slate-700" style={{ minWidth: "180px" }}>Job</th>
          <th className="px-4 py-4 text-center font-bold border-r border-slate-700" style={{ minWidth: "150px" }}>Company</th>
          <th className="px-4 py-4 text-center font-bold border-r border-slate-700" style={{ minWidth: "120px" }}>Type</th>
          <th className="px-4 py-4 text-center font-bold border-r border-slate-700" style={{ minWidth: "140px" }}>Experience</th>
          <th className="px-4 py-4 text-center font-bold border-r border-slate-700" style={{ minWidth: "120px" }}>Salary</th>
          <th className="px-4 py-4 text-center font-bold border-r border-slate-700" style={{ minWidth: "180px" }}>Location</th>
          <th className="px-4 py-4 text-center font-bold border-r border-slate-700" style={{ minWidth: "130px" }}>Deadline</th>
          <th className="px-4 py-4 text-center font-bold" style={{ minWidth: "220px" }}>Action</th>
        </tr>
      </thead>

      <tbody>
        {jobs.length === 0 ? (
          <tr>
            <td colSpan="10" className="text-center">
              No jobs available
            </td>
          </tr>
        ) : (
          jobs.map(j => (
            <tr key={j.id} style={{ verticalAlign: "middle" }}>

              <td className="text-start fw-semibold">
                {j.job_title}
              </td>

              <td className="text-center">
                {j.company}
              </td>

              <td className="text-center">
                {j.job_type}
              </td>

              <td className="text-center">
                {j.experience}
              </td>

              <td className="text-center">
                {j.salary}
              </td>

              <td className="text-center">
                {j.location}
              </td>

              <td className="text-center">
                {j.deadline
                  ? (() => {
                      const d = new Date(j.deadline);
                      return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth()+1)
                        .toString()
                        .padStart(2, "0")}-${d.getFullYear()}`;
                    })()
                  : ""}
              </td>

              <td>
                <div className="d-flex justify-content-center gap-2">

                    <button
                        className="btn btn-info btn-sm px-3"
                        onClick={() => setSelectedJob(j)}
                    >
                        VIEW
                    </button>
                    <button
                      className="btn btn-warning btn-sm px-3"
                      onClick={() => {
                        // Populate form with ALL job fields to prevent data loss
                        setForm({
                          id: j.id,
                          job_title: j.job_title || "",
                          company: j.company || "",
                          location: j.location || "",
                          job_type: j.job_type || "",
                          experience: j.experience || "",
                          salary: j.salary || "",
                          primary_skills: j.primary_skills || "",
                          eligibility: j.eligibility || "",
                          description: j.description || "",
                          responsibilities: j.responsibilities || "",
                          external_application_link: j.external_application_link || "",
                          deadline: j.deadline || ""
                        });          
                        setShowForm(true);  
                        window.scrollTo({ top: 0, behavior: "smooth" }); 
                      }}
                    >
                      EDIT
                    </button>
                                        

                    <button
                        className="btn btn-danger btn-sm px-3"
                        onClick={() => deleteJob(j.id)}
                    >
                        DELETE
                    </button>

                    </div>
              </td>

            </tr>
          ))
        )}
      </tbody>

    </table>

  </div>
</div>

      {/* ================= MODAL ================= */}
      {selectedJob && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">

              <h5>{selectedJob.job_title}</h5>
              <p><b>Company:</b> {selectedJob.company}</p>
              <p><b>Description:</b> {selectedJob.description}</p>
              {/* <p><b>Responsibilities:</b> {selectedJob.responsibilities}</p> */}
              <p><b>Responsibilities:</b></p>
                <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
                {selectedJob.responsibilities &&
                    selectedJob.responsibilities
                    .split("-")
                    .filter(item => item.trim() !== "")
                    .map((item, index) => (
                        <li key={index}>{item.trim()}</li>
                    ))
                }
                </ul>

              <button
                className="btn btn-secondary"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Jobs;