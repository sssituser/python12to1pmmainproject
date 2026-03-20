import React, { useEffect, useState } from "react";

function AppliedJobs(){

const [jobs,setJobs] = useState([]);
const [search, setSearch] = useState("");
useEffect(() => {

  const token = localStorage.getItem("access");

  fetch("http://127.0.0.1:8000/api/applied-jobs/",{
    headers:{
      "Authorization": `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log("GET DATA:", data);
    setJobs(Array.isArray(data) ? data : data.results || []);
  });

}, []);

const filteredJobs = jobs.filter(j =>
  j.job_details?.job_title?.toLowerCase().includes(search.toLowerCase()) ||
  j.job_details?.company?.toLowerCase().includes(search.toLowerCase()) ||
  j.username?.toLowerCase().includes(search.toLowerCase())
);


return(

<div className="container mt-4">

<div className="card shadow-lg p-4 border-0">

<h3 className="fw-bold mb-3">📄 Applied Jobs</h3>

<p className="text-muted">
Total Applications: {filteredJobs.length}
</p>

<input
  type="text"
  placeholder="🔍 Search by job, company, user"
  className="form-control mb-4 shadow-sm"
  style={{borderRadius:"10px"}}
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

<div className="table-responsive">

<table className="table table-hover align-middle">

<thead className="table-dark">
<tr>
<th>Job</th>
<th>Company</th>
<th>Student</th>
<th>Applied Date</th>
</tr>
</thead>

<tbody>

{filteredJobs.length === 0 ? (
  <tr>
    <td colSpan="4" className="text-center text-muted py-4">
      No Applied Jobs 😕
    </td>
  </tr>
) : (
  filteredJobs.map(j => (
    <tr key={j.id}>

      <td className="fw-semibold">
        {j.job_details?.job_title}
      </td>

      <td>
        <span className="badge bg-primary px-3 py-2">
          {j.job_details?.company}
        </span>
      </td>

      <td>
        <span className="text-success fw-bold">
          👤 {j.username}
        </span>
      </td>

      <td className="text-muted">
        {new Date(j.applied_date).toLocaleString()}
      </td>

    </tr>
  ))
)}

</tbody>

</table>

</div>

</div>

</div>

)

}

export default AppliedJobs