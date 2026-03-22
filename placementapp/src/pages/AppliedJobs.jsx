import React, { useEffect, useState } from "react";

function AppliedJobs() {

  const [jobs, setJobs] = useState([]);
  const getStatus = (date) => {
  const days = (new Date() - new Date(date)) / (1000 * 60 * 60 * 24);

  if (days < 2) return "Applied";
  if (days < 5) return "Under Review";
  return "Shortlisted";
};
const [appliedIds, setAppliedIds] = useState([]);

useEffect(() => {
  fetch("http://127.0.0.1:8000/api/applied-jobs/")
    .then(res => res.json())
    .then(data => {
      setAppliedIds(data.map(j => j.job.id));
    });
}, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/applied-jobs/")
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="container mt-4">

      <h4 className="mb-3">Applied Jobs</h4>

      {jobs.length === 0 ? (
        <p>No jobs applied yet</p>
      ) : (

        <div className="row">

          {jobs.map((j) => (

            <div key={j.id} className="col-md-6 mb-3">

              <div className="card shadow-sm p-3">

                <h5>{j.job.company}</h5>

                <p className="mb-1"><b>Role:</b> {j.job.job_title}</p>

                <p className="mb-1"><b>Skills:</b> {j.job.primary_skills}</p>

                <p className="mb-1"><b>Location:</b> {j.job.location}</p>

                <p className="mb-1">
                  <b>Applied On:</b>{" "}
                  {new Date(j.applied_date).toLocaleDateString()}
                </p>

                <span className="badge bg-warning mt-2">
                  Applied
                </span>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default AppliedJobs;