import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaArrowLeft, FaArrowRight } from "react-icons/fa";

function AllJobs() {

  const navigate = useNavigate();

  const [jobsData, setJobsData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState(false);

  // Apply Job
  function applyJob(jobId){

  const token = localStorage.getItem("access");

  fetch("http://127.0.0.1:8000/api/applied-jobs/",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      job: jobId
    })
  })
  .then(res => res.json().then(data => ({status: res.status, data})))
  .then(({status, data}) => {

    console.log("STATUS:", status);
    console.log("DATA:", data);

    if(status === 201){
      alert("Job Applied Successfully ✅");
      setApplied(true);   // ✅ mark applied
    } else {
      alert("Already applied ⚠️");
      setApplied(true);   // ✅ still disable
    }

  })
  .catch(err => {
    console.log(err);
    alert("Server error ❌");
  });
}




  // Fetch Jobs
useEffect(() => {

  const token = localStorage.getItem("access");

  // 1️⃣ Get all jobs
  fetch("http://127.0.0.1:8000/api/jobs/", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(async (jobs) => {

    // 2️⃣ Get applied jobs
    const res2 = await fetch("http://127.0.0.1:8000/api/applied-jobs/", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const appliedJobs = await res2.json();

    // 3️⃣ Get applied job IDs
    const appliedIds = appliedJobs.map(a => a.job);

    // 4️⃣ Merge status
    const updatedJobs = jobs.map(j => ({
      ...j,
      status: appliedIds.includes(j.id) ? "Applied" : j.status
    }));

    setJobsData(updatedJobs);
  })
  .catch(err => console.log(err));

}, []);

  // Search
 const filteredJobs = Array.isArray(jobsData)
  ? jobsData.filter(job => {
      if (!search) return true;

      return (
        job.company?.toLowerCase().includes(search.toLowerCase()) ||
        job.job_title?.toLowerCase().includes(search.toLowerCase()) ||
        job.primary_skills?.toLowerCase().includes(search.toLowerCase())
      );
    })
  : [];

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / perPage)

  const lastIndex = page * perPage
  const firstIndex = lastIndex - perPage

  const records = filteredJobs.slice(firstIndex,lastIndex)


  return (

<div className="container mt-4">

<h4 className="mb-3 text-black">All Job Openings</h4>


{/* Search */}
<input
className="form-control mb-3"
placeholder="Search by role, skill, company"
value={search}
onChange={(e)=>{
setSearch(e.target.value)
setPage(1)
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

{records.length===0 ?

<tr>
<td colSpan="7" className="text-center">No Jobs Found</td>
</tr>

:

records.map(job=>(

<tr key={job.id}>

<td>{job.company}</td>

<td>{job.job_title}</td>

<td>{job.primary_skills}</td>

<td>{job.deadline || "N/A"}</td>

<td>{job.location}</td>

<td>

{job.status==="Applied" ?

<span className="badge bg-success">Applied</span>

: job.status==="TimedOut" ?

<span className="badge bg-danger">TimedOut</span>

: job.status==="Closed" ?

<span className="badge bg-secondary">Closed</span>

:

<span className="badge bg-success">Open</span>

}

</td>

<td>

<div className="d-flex gap-2">

<button
      className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
      onClick={()=>navigate(`/dashboard/jobs/${job.id}`)}
    >
      <FaEye/>
      <span>View</span>
    </button>

{/* <button
type='button'
className="btn btn-success btn-sm"
disabled={job.status==="TimedOut" || job.status==="Applied"}
onClick={()=>{
  console.log("CLICKED APPLY", job.id);
applyJob(job.id);}}
>
Apply
</button> */}
{job.status === "Applied" ? (
  <button className="btn btn-secondary btn-sm" disabled>
    Applied ✅
  </button>
) : (
  <button
    className="btn btn-success btn-sm"
    disabled={job.status === "Closed"}
    onClick={() => applyJob(job.id)}
  >
    Apply
  </button>
)}
</div>

</td>

</tr>

))

}

</tbody>


{/* Pagination */}

<tfoot>

<tr>

<td colSpan="7">

<div className="d-flex justify-content-between align-items-center">


<div className="d-flex align-items-center gap-3">

<button
className="btn btn-light btn-sm"
disabled={page===1}
onClick={()=>setPage(page-1)}
>
<FaArrowLeft/> Prev
</button>

<span className="fw-bold">
Page {page} of {totalPages || 1}
</span>

</div>


<div className="d-flex align-items-center gap-2">

<select
className="form-select form-select-sm"
style={{width:"130px"}}
value={perPage}
onChange={(e)=>{
setPerPage(Number(e.target.value))
setPage(1)
}}
>
<option value={3}>3 / page</option>
<option value={10}>10 / page</option>
<option value={20}>20 / page</option>
</select>


{[...Array(totalPages)].map((_,i)=>(

<button
key={i}
className={`btn btn-sm ${page===i+1 ? "btn-primary":"btn-light"}`}
onClick={()=>setPage(i+1)}
>
{i+1}
</button>

))}


<button
className="btn btn-light btn-sm"
disabled={page===totalPages || totalPages===0}
onClick={()=>setPage(page+1)}
>
Next <FaArrowRight/>
</button>

</div>

</div>

</td>

</tr>

</tfoot>

</table>

</div>

</div>

  )

}

export default AllJobs;