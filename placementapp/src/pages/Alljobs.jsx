import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function AllJobs() {
  const navigate = useNavigate();

  const [jobsData, setJobsData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [search, setSearch] = useState("");

  // ==============================
  // APPLY JOB
  // ==============================
  async function applyJob(jobId) {
    const token = localStorage.getItem("access");

    // 🔐 Block if not logged in
    if (!token) {
    alert("Please login first 🔐");
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
      } else {
        console.log(data?.detail || data?.error || "Already Applied ⚠️");
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
        placeholder="Search..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Company</th>
            <th>Job Title</th>
            <th>Description</th>
            <th>Skills</th>
            <th>Deadline</th>
            <th>Location</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                No Jobs
              </td>
            </tr>
          ) : (
            records.map((job) => (
              <tr key={job.id}>
                <td>{job.company}</td>
                <td>{job.job_title}</td>
                <td>{job.description || "N/A"}</td>
                <td>{job.primary_skills}</td>
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

                <td>
                  <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={() =>
                      navigate(`/dashboard/jobs/${job.id}`)
                    }
                  >
                    <FaEye />
                  </button>

                  {job.status === "Applied" ? (
                    <button className="btn btn-secondary btn-sm" disabled>
                      Applied
                    </button>
                  ) : (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => applyJob(job.id)}
                    >
                      Apply
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="d-flex justify-content-between">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          <FaArrowLeft />
        </button>

        <span>
          Page {page} / {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(page + 1)}
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
}

export default AllJobs;