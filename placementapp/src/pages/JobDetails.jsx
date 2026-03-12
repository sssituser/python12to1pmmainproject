import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function JobDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);

  useEffect(() => {

    fetch(`http://127.0.0.1:8000/api/jobs/${id}/`)
      .then(res => res.json())
      .then(data => {
        console.log(data);
        setJob(data);
      })
      .catch(err => console.log(err));

  }, [id]);

  if (!job) {
    return <h4 className="text-center mt-5">Loading job details...</h4>;
  }

  return (

    <div className="container mt-4">

      <div className="row">

        {/* LEFT SIDE */}

        <div className="col-md-8">

          {/* Job Header */}

          <div className="card shadow p-4 mb-4">

            <h3 className="fw-bold">{job.job_title}</h3>
            <h5 className="text-muted">{job.company}</h5>

            <div className="mt-3 d-flex flex-wrap gap-3">

              <span className="badge bg-light text-dark">
                📍 {job.location}
              </span>

              <span className="badge bg-light text-dark">
                💻 {job.primary_skills}
              </span>

              <span className="badge bg-light text-dark">
                📅 Deadline: {job.deadline || "N/A"}
              </span>

            </div>

          </div>

          {/* Job Description */}

          <div className="card shadow p-4 mb-4">

            <h5 className="fw-bold mb-3">Job Description</h5>

            <p>
              {job.description || "No description available"}
            </p>

          </div>

          {/* Responsibilities */}

          <div className="card shadow p-4 mb-4">

            <h5 className="fw-bold mb-3">Responsibilities</h5>

            <ul>
              <li>Develop scalable applications.</li>
              <li>Collaborate with cross-functional teams.</li>
              <li>Write clean and maintainable code.</li>
              <li>Participate in code reviews.</li>
              <li>Improve performance and reliability.</li>
            </ul>

          </div>

          {/* Skills */}

          <div className="card shadow p-4 mb-4">

            <h5 className="fw-bold mb-3">Required Skills</h5>

            <div className="d-flex flex-wrap gap-2">

              {job.primary_skills?.split(",").map((skill, i) => (

                <span key={i} className="badge bg-primary">
                  {skill.trim()}
                </span>

              ))}

            </div>

          </div>

        </div>

        {/* RIGHT SIDE SUMMARY */}

        <div className="col-md-4">

          <div className="card shadow p-4">

            <h5 className="fw-bold mb-3">Job Summary</h5>

            <p><strong>Company :</strong> {job.company}</p>
            <p><strong>Role :</strong> {job.job_title}</p>
            <p><strong>Location :</strong> {job.location}</p>
            <p><strong>Deadline :</strong> {job.deadline || "N/A"}</p>

            <hr />

            {job.status !== "Closed" && job.status !== "Timed Out" && (

              <button className="btn btn-success w-100 mb-2">
                Apply Now
              </button>

            )}

            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => navigate(-1)}
            >
              Back
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}

export default JobDetails;