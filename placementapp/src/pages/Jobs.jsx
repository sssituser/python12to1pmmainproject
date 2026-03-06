import React, { useState } from "react";
import { motion } from "framer-motion";

function Jobs() {

  const [search,setSearch] = useState("");

  const jobs = [
    {
      company: "Postman",
      role: "Assistant Software Engineer",
      skills: "MySQL, C++",
      location: "Hyderabad",
      deadline: "Oct 10 2025",
      status: "Open"
    },
    {
      company: "Wipro",
      role: "Python Developer",
      skills: "Python, SQL",
      location: "Bangalore",
      deadline: "Oct 15 2025",
      status: "Open"
    },
    {
      company: "Infosys",
      role: "Full Stack Developer",
      skills: "React, Node",
      location: "Hyderabad",
      deadline: "Oct 20 2025",
      status: "Closed"
    },
    {
      company: "TCS",
      role: "Software Developer",
      skills: "Java, Spring",
      location: "Chennai",
      deadline: "Oct 22 2025",
      status: "Open"
    }
  ];


  const filteredJobs = jobs.filter((job)=>
    job.company.toLowerCase().includes(search.toLowerCase()) ||
    job.role.toLowerCase().includes(search.toLowerCase())
  )


  return (

<div className="container-fluid p-4">

<h3 className="fw-bold mb-4">All Job Openings</h3>

{/* SEARCH SECTION */}

<div className="row mb-4">

<div className="col-md-4">

<input
type="text"
className="form-control shadow-sm"
placeholder="Search by company or role"
onChange={(e)=>setSearch(e.target.value)}
/>

</div>

<div className="col-md-2">

<select className="form-select shadow-sm">

<option>All Locations</option>
<option>Hyderabad</option>
<option>Bangalore</option>
<option>Chennai</option>

</select>

</div>

</div>

{/* JOB TABLE */}

<motion.div
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
transition={{duration:0.6}}
className="bg-white shadow rounded-4 p-3"
>

<table className="table align-middle">

<thead className="table-primary">

<tr>

<th>Company</th>
<th>Job Title</th>
<th>Primary Skills</th>
<th>Location</th>
<th>Deadline</th>
<th>Status</th>
<th>Action</th>

</tr>

</thead>

<tbody>

{filteredJobs.map((job,index)=>(

<tr key={index} className="hover:bg-gray-100 transition">

<td className="fw-semibold">

<div className="d-flex align-items-center gap-2">

<img
src="https://cdn-icons-png.flaticon.com/512/5968/5968705.png"
width="28"
/>

{job.company}

</div>

</td>

<td>{job.role}</td>

<td>

<span className="badge bg-info text-dark">
{job.skills}
</span>

</td>

<td>{job.location}</td>

<td>{job.deadline}</td>

<td>

<span
className={`badge ${
job.status==="Open"
?"bg-success"
:"bg-danger"
}`}
>

{job.status}

</span>

</td>

<td>

<button className="btn btn-primary btn-sm me-2">

View

</button>

<button className="btn btn-outline-success btn-sm">

Apply

</button>

</td>

</tr>

))}

</tbody>

</table>

</motion.div>

</div>

  );
}

export default Jobs;