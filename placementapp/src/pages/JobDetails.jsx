import React from "react";
import {useParams} from "react-router-dom";

function JobDetails(){

const {id} = useParams()

return(

<div className="container mt-4">

<h4>Job Round Details</h4>

<div className="card p-4 mt-3">

<h5>AI ML Intern</h5>

<p><b>Company:</b> Apple Logic</p>
<p><b>Bond:</b> 1.6</p>
<p><b>Salary:</b> 15k for 3 months, Later 4.5 LPA</p>
<p><b>Location:</b> Hyderabad</p>

<h6 className="mt-3">Technologies</h6>

<p>Python, Pandas, Scikit Learn, Machine Learning</p>

</div>

</div>

)

}

export default JobDetails;