import React,{useState} from "react";
import {useNavigate} from "react-router-dom";

function AllJobs(){

const navigate = useNavigate();

const jobs = [

{ id:1, company:"Postman", role:"Software Engineer", skills:"MySQL", location:"Hyderabad", logo:"https://logo.clearbit.com/postman.com" },

{ id:2, company:"Wipro", role:"Python Developer", skills:"Python", location:"Bangalore", logo:"https://logo.clearbit.com/wipro.com" },

{ id:3, company:"Infosys", role:"Full Stack Developer", skills:"React", location:"Hyderabad", logo:"https://logo.clearbit.com/infosys.com" },

{ id:4, company:"TCS", role:"Java Developer", skills:"Java", location:"Chennai", logo:"https://logo.clearbit.com/tcs.com" },

{ id:5, company:"Amazon", role:"Backend Engineer", skills:"NodeJS", location:"Hyderabad", logo:"https://logo.clearbit.com/amazon.com" },

{ id:6, company:"Google", role:"ML Engineer", skills:"Python", location:"Bangalore", logo:"https://logo.clearbit.com/google.com" }

]

const [page,setPage] = useState(1)
const [loading,setLoading] = useState(false)

const perPage = 3

const lastIndex = page * perPage
const firstIndex = lastIndex - perPage

const records = jobs.slice(firstIndex,lastIndex)

const pages = Math.ceil(jobs.length/perPage)

function changePage(n){

setLoading(true)

setTimeout(()=>{

setPage(n)
setLoading(false)

},1000)

}

return(

<div className="container mt-4">

<h4 className="mb-3">All Job Openings</h4>

<input
className="form-control mb-3"
placeholder="Search by role, skill, company"
/>

<div className="table-responsive" style={{maxHeight:"400px"}}>

<table className="table table-bordered align-middle">

<thead className="table-primary">

<tr>

<th>Company</th>
<th>Job Title</th>
<th>Skills</th>
<th>Location</th>
<th>Action</th>

</tr>

</thead>

<tbody>

{loading ? (

<tr>

<td colSpan="5" className="text-center">

<div className="spinner-border text-primary"></div>

</td>

</tr>

) : (

records.map(job=>(

<tr key={job.id}>

<td>

<div className="d-flex align-items-center gap-2">

<img
src={job.logo}
alt=""
style={{width:"35px",height:"35px"}}
/>

{job.company}

</div>

</td>

<td>{job.role}</td>

<td>{job.skills}</td>

<td>{job.location}</td>

<td>

<button
className="btn btn-sm btn-primary"
onClick={()=>navigate(`/jobs/${job.id}`)}
>

View

</button>

</td>

</tr>

))

)}

</tbody>

</table>

</div>

<nav>

<ul className="pagination mt-3">

{[...Array(pages)].map((_,i)=>(

<li
key={i}
className={`page-item ${page===i+1?"active":""}`}
>

<button
className="page-link"
onClick={()=>changePage(i+1)}
>

{i+1}

</button>

</li>

))}

</ul>

</nav>

</div>

)

}

export default AllJobs;