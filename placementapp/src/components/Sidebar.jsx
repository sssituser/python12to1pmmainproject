import React, { useState } from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {

  const [open,setOpen] = useState(false)

  return (
    <div className="sidebar">
      <div className="sidebar-menu">

        <NavLink to="/profile" className="sidebar-link">Profile</NavLink>

        <NavLink to="/resume" className="sidebar-link">Resume</NavLink>
        <div>

<div 
className="sidebar-link"
onClick={()=>setOpen(!open)}
style={{cursor:"pointer"}}
>
Jobs ▾
</div>

{open && (

<div style={{paddingLeft:"15px"}}>

<div className="mb-2">
<NavLink to="/jobs/all" className="sidebar-link">
All Jobs
</NavLink>
</div>

<div>
<NavLink to="/jobs/applied" className="sidebar-link">
Applied Jobs
</NavLink>
</div>

</div>
        
        
          )}

        </div>

        <NavLink to="/course" className="sidebar-link">Course</NavLink>

        <NavLink to="/exams" className="sidebar-link">Exams</NavLink>

        <NavLink to="/exam-reports" className="sidebar-link">Exam Reports</NavLink>

        <NavLink to="/exam-leaderboard" className="sidebar-link">Exam Leaderboard</NavLink>

        <NavLink to="/playground" className="sidebar-link">Code Playground</NavLink>

        <NavLink to="/logout" className="sidebar-link">Logout</NavLink>

      </div>
    </div>
  );
}

export default Sidebar;