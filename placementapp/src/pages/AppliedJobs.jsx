import React, {useEffect, useState} from "react"

function AppliedJobs(){

const [jobs,setJobs] = useState([])

useEffect(()=>{

fetch("http://127.0.0.1:8000/api/applied-jobs/")
.then(res=>res.json())
.then(data=>setJobs(data))

},[])

return(

<div className="container mt-4">

<h4>Applied Jobs</h4>

<table className="table table-bordered mt-3">

<thead>
<tr>
<th>Company</th>
<th>Job</th>
<th>Applied Date</th>
</tr>
</thead>

<tbody>

{jobs.map(j=>(
<tr key={j.id}>
<td>{j.job}</td>
<td>{j.student_name}</td>
<td>{j.applied_date}</td>
</tr>
))}

</tbody>

</table>

</div>

)

}

export default AppliedJobs