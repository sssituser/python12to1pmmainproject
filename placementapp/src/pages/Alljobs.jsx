import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaArrowLeft, FaArrowRight } from "react-icons/fa";

function AllJobs() {

  const navigate = useNavigate();

  const [jobsData, setJobsData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");

  // Fetch jobs from Django backend
  useEffect(() => {

    fetch("http://127.0.0.1:8000/api/jobs/")
      .then((res) => res.json())
      .then((data) => {
        console.log("Jobs:", data);
        setJobsData(data);
      })
      .catch((err) => console.log(err));

  }, []);

  // Search Filter
  const filteredJobs = jobsData.filter((job) =>
    job.company?.toLowerCase().includes(search.toLowerCase()) ||
    job.job_title?.toLowerCase().includes(search.toLowerCase()) ||
    job.primary_skills?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / perPage);

  const lastIndex = page * perPage;
  const firstIndex = lastIndex - perPage;

  const records = filteredJobs.slice(firstIndex, lastIndex);

  return (
    <div className="container mt-4">

      <h4 className="mb-3 text-black">All Job Openings</h4>

      {/* Search */}
      <input
        className="form-control mb-3"
        placeholder="Search by role, skill, company"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      <div className="table-responsive">

        <table className="table table-bordered align-middle shadow table-striped">

          <thead className="table-primary">
            <tr>
              <th>Company</th>
              <th>Job Title</th>
              <th>Primary Skills</th>
              <th>Deadline</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {records.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No Jobs Found
                </td>
              </tr>
            ) : (

              records.map((job) => (

                <tr key={job.id}>

                  <td>{job.company}</td>

                  <td>{job.job_title}</td>

                  <td>{job.primary_skills}</td>

                  <td>{job.deadline || "N/A"}</td>

                  <td>{job.location}</td>

                  <td>
                    {job.status === "Applied" ? (
                      <span className="badge bg-success">Applied</span>
                    ) : job.status === "Timed Out" ? (
                      <span className="badge bg-danger">Timed Out</span>
                    ) : (
                      <span className="badge bg-warning text-dark">Open</span>
                    )}
                  </td>

                  <td>
                    <div className="d-flex gap-2">

                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => navigate(`/dashboard/jobs/${job.id}`)}
                      >
                        <FaEye className="me-1" /> View
                      </button>

                      <button
                        className="btn btn-success btn-sm"
                        disabled={job.status === "Timed Out" || job.status === "Applied"}
                      >
                        Apply
                      </button>

                    </div>
                  </td>

                </tr>

              ))

            )}

          </tbody>

          {/* Pagination Footer */}

          <tfoot>
            <tr>
              <td colSpan="7">

                <div className="d-flex justify-content-between align-items-center">

                  {/* Prev Button */}

                  <div className="d-flex align-items-center gap-3">

                    <button
                      className="btn btn-light btn-sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <FaArrowLeft /> Prev
                    </button>

                    <span className="fw-bold">
                      Page {page} of {totalPages || 1}
                    </span>

                  </div>

                  {/* Page Numbers */}

                  <div className="d-flex align-items-center gap-2">

                    <select
                      className="form-select form-select-sm"
                      style={{ width: "130px" }}
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value));
                        setPage(1);
                      }}
                    >
                      <option value={3}>3 / page</option>
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                    </select>

                    {[...Array(totalPages)].map((_, i) => (

                      <button
                        key={i}
                        className={`btn btn-sm ${page === i + 1 ? "btn-primary" : "btn-light"}`}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </button>

                    ))}

                    <button
                      className="btn btn-light btn-sm"
                      disabled={page === totalPages || totalPages === 0}
                      onClick={() => setPage(page + 1)}
                    >
                      Next <FaArrowRight />
                    </button>

                  </div>

                </div>

              </td>
            </tr>
          </tfoot>

        </table>

      </div>

    </div>
  );
}

export default AllJobs;