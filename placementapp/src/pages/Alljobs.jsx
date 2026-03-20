import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaArrowLeft, FaArrowRight } from "react-icons/fa";

function AllJobs() {
  const navigate = useNavigate();

  const [jobsData, setJobsData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");

  // ==============================
  // APPLY JOB
  // ==============================
  function applyJob(jobId) {
    const token = localStorage.getItem("access");

    fetch("http://127.0.0.1:8000/api/applied-jobs/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ job: jobId }),
    })
      .then((res) =>
        res.json().then((data) => ({ status: res.status, data }))
      )
      .then(({ status }) => {
        if (status === 201) {
          alert("Applied Successfully ✅");

          setJobsData((prev) =>
            prev.map((job) =>
              job.id === jobId ? { ...job, status: "Applied" } : job
            )
          );
        } else {
          alert("Already Applied ⚠️");
        }
      })
      .catch(() => alert("Error ❌"));
  }

  // ==============================
  // FETCH JOBS + APPLIED STATUS
  // ==============================
  useEffect(() => {
    const token = localStorage.getItem("access");

    async function fetchData() {
      try {
        const jobsRes = await fetch(
          "http://127.0.0.1:8000/api/jobs/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const jobs = await jobsRes.json();

        const appliedRes = await fetch(
          "http://127.0.0.1:8000/api/applied-jobs/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const appliedJobs = await appliedRes.json();
        const appliedIds = appliedJobs.map((a) => a.job);

        const updated = jobs.map((j) => ({
          ...j,
          status: appliedIds.includes(j.id) ? "Applied" : j.status,
        }));

        setJobsData(updated);
      } catch (err) {
        console.log(err);
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
              <td colSpan="7" className="text-center">
                No Jobs
              </td>
            </tr>
          ) : (
            records.map((job) => (
              <tr key={job.id}>
                <td>{job.company}</td>
                <td>{job.job_title}</td>
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
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
}

export default AllJobs;