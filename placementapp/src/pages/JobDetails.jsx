import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function JobDetails() {

const { id } = useParams();
const navigate = useNavigate();
const [job, setJob] = useState(null);
const [applied, setApplied] = useState(false);


// Fetch job details
useEffect(() => {

  const token = localStorage.getItem("access");   // ✅ GET TOKEN

  fetch(`http://127.0.0.1:8000/api/jobs/${id}/`, {
    headers: {
      "Authorization": `Bearer ${token}`   // ✅ VERY IMPORTANT
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log("JOB DETAILS:", data);   // 👈 DEBUG
    setJob(data);
  })
  .catch(err => console.log(err));

}, [id]);


// Apply Job Function
function applyJob(jobId){

  const token = localStorage.getItem("access");

  fetch("http://127.0.0.1:8000/api/applied-jobs/",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      job: jobId,
    })
  })
  .then(res => res.json().then(data => ({status: res.status, data})))
  .then(({status, data}) => {

    console.log("STATUS:", status);
    console.log("DATA:", data);

    if(status === 201){
      alert("Job Applied Successfully ✅");
      setApplied(true);   // ✅ disable button
    } 
    else {
      alert("Already applied ⚠️");
      setApplied(true);   // ✅ still disable
    }

  })
  .catch(err => {
    console.log(err);
    alert("Server error ❌");
  });
}

if (!job) {
return <h4 className="text-center mt-5">Loading job details...</h4>;
}

return (


<div className="container mt-4">

  <div className="row">

    {/* LEFT SIDE */}
    <div className="col-md-8">

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
          <li>Develop scalable applications</li>
          <li>Collaborate with cross-functional teams.</li>
          <li>Write clean and maintainable code</li>
          <li>Participate in code reviews</li>
          <li>Improve performance and reliability</li>
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


    {/* RIGHT SIDE */}
    <div className="col-md-4">

      <div className="card shadow p-4">

        <h5 className="fw-bold mb-3">Job Summary</h5>

        <p><strong>Company :</strong> {job.company}</p>
        <p><strong>Role :</strong> {job.job_title}</p>
        <p><strong>Location :</strong> {job.location}</p>
        <p><strong>Deadline :</strong> {job.deadline || "N/A"}</p>

        <hr />

        {job.status !== "Closed" && job.status !== "Timed Out" && (

  applied ? (
    <button className="btn btn-secondary w-100 mb-2" disabled>
      Applied ✅
    </button>
  ) : (
    <button
      className="btn btn-success w-100 mb-2"
      onClick={() => applyJob(job.id)}
    >
      Apply Now
    </button>
  )

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
