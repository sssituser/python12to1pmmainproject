import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function AllJobs() {
  const navigate = useNavigate();

  const [jobsData, setJobsData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [search, setSearch] = useState("");
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

  const toggleDescription = (id) => {
    setExpandedDescriptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ==============================
  // APPLY JOB
  // ==============================
  async function applyJob(jobId, externalLink = null) {
    const token = localStorage.getItem("access");

    // 🔐 Block if not logged in
    if (!token) {
    alert("Please login first ");
      return;
    }

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/applied-jobs/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ job: jobId }),
        }
      );

      const data = await res.json();

      if (res.status === 201) {
        console.log("Applied Successfully ✅");

        setJobsData((prev) =>
          prev.map((job) =>
            job.id === jobId ? { ...job, status: "Applied" } : job
          )
        );

        // ✅ Open external link if provided
        if (externalLink) {
          window.open(externalLink, "_blank");
        }
      } else {
        console.log(data?.detail || data?.error || "Already Applied ⚠️");
        
        // Even if already applied, if they click again, maybe they want to see the link
        if (externalLink) {
          window.open(externalLink, "_blank");
        }
      }
    } catch (err) {
      console.log(err);
      console.error("Error ❌");
    }
  }

  // ==============================
  // FETCH JOBS + APPLIED STATUS
  // ==============================
  useEffect(() => {
    const token = localStorage.getItem("access");

    async function fetchData() {
      try {
        // ✅ PUBLIC JOBS
        const jobsRes = await fetch("http://127.0.0.1:8000/api/jobs/");
        const jobs = await jobsRes.json();

        let appliedIds = [];

        // 🔐 Fetch applied jobs only if logged in
        if (token) {
          try {
            const appliedRes = await fetch(
              "http://127.0.0.1:8000/api/applied-jobs/",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (appliedRes.ok) {
              const appliedJobs = await appliedRes.json();

              // ✅ Safe handling
              if (Array.isArray(appliedJobs)) {
                appliedIds = appliedJobs.map((a) =>
                  typeof a.job === "object" ? a.job.id : a.job
                );
              }
            } else {
              console.log("Unauthorized → skipping applied jobs");
            }
          } catch (err) {
            console.log("Applied jobs error:", err);
          }
        }

        // ✅ Always update jobs
        const updated = jobs.map((j) => ({
          ...j,
          status: appliedIds.includes(j.id) ? "Applied" : j.status,
        }));

        setJobsData(updated);
      } catch (err) {
        console.log("Jobs fetch error:", err);
      }
    }

    fetchData();
  }, []);

  // ==============================
  // SEARCH
  // ==============================
  const filteredJobs = jobsData.filter((job) =>
    job.company?.toLowerCase().includes(search.toLowerCase()) ||
    job.job_title?.toLowerCase().includes(search.toLowerCase()) ||
    job.primary_skills?.toLowerCase().includes(search.toLowerCase())
  );

  // ==============================
  // PAGINATION
  // ==============================
  const totalPages = Math.ceil(filteredJobs.length / perPage);
  const records = filteredJobs.slice(
    (page - 1) * perPage,
    page * perPage
  );

  // ==============================
  // UI
  // ==============================
  return (
    <div className="container mt-4">
      <h4>All Job Openings</h4>

      <input
        className="form-control mb-3"
        placeholder="Search jobs..."
        style={{ width: "300px" }}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />

      {/* Jobs List */}
      <table className="table table-bordered table-hover shadow-sm">
        <thead className="table-dark">
          <tr>
            <th className="text-center align-middle">Company</th>
            <th className="text-center align-middle">Job Title</th>
            <th className="text-center align-middle">Description</th>
            <th className="text-center align-middle">Skills</th>
            <th className="text-center align-middle">Deadline</th>
            <th className="text-center align-middle">Location</th>
            <th className="text-center align-middle">Status</th>
            <th className="text-center align-middle">Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredJobs.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                No Jobs
              </td>
            </tr>
          ) : (
            filteredJobs.map((job) => (
              <tr key={job.id}>
                <td>{job.company}</td>
                <td>{job.job_title}</td>
                <td className="text-start" style={{ minWidth: "300px" }}>
                  {job.description ? (
                    job.description.length > 100 ? (
                      <>
                        {expandedDescriptions.has(job.id)
                          ? job.description
                          : `${job.description.substring(0, 100)}... `}
                        <span
                          onClick={() => toggleDescription(job.id)}
                          className="text-primary font-weight-bold"
                          style={{ cursor: "pointer", fontSize: "0.8rem", textDecoration: "underline" }}
                        >
                          {expandedDescriptions.has(job.id) ? "View Less" : "View More"}
                        </span>
                      </>
                    ) : (
                      job.description
                    )
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="text-center">{job.primary_skills || "N/A"}</td>
                <td>{job.deadline}</td>
                <td>{job.location}</td>

                <td>
                  {job.status === "Applied" ? (
                    <span className="badge bg-success">Applied</span>
                  ) : job.status === "Closed" ? (
                    <span className="badge bg-secondary">Closed</span>
                  ) : (
                    <span className="badge bg-primary">Open</span>
                  )}
                </td>

                <td className="text-center align-middle">
                  <div className="d-flex flex-column gap-2 align-items-center justify-content-center" style={{ minWidth: "100px" }}>
                    <button
                      className="btn btn-sm btn-primary w-100 py-2 font-weight-bold"
                      onClick={() =>
                        navigate(`/dashboard/jobs/${job.id}`)
                      }
                    >
                      VIEW
                    </button>

                    {job.status === "Applied" ? (
                      <button className="btn btn-secondary btn-sm w-100 py-2 font-weight-bold" disabled>
                        APPLIED
                      </button>
                    ) : (
                      <button
                        className={`btn btn-sm w-100 py-2 font-weight-bold ${job.status === 'Closed' ? 'btn-secondary shadow-sm' : 'btn-success shadow'}`}
                        onClick={() => job.status !== 'Closed' && applyJob(job.id, job.external_application_link)}
                        disabled={job.status === 'Closed'}
                      >
                        {job.status === 'Closed' ? 'CLOSED' : 'APPLY'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AllJobs;