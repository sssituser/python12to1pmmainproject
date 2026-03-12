import { NavLink } from "react-router-dom";
import { useState } from "react";

function Sidebar({ sidebarOpen }) {
  const [openJobs,setOpenJobs] = useState(false);
  return (
    <div className={`sidebar ${!sidebarOpen ? "collapsed" : ""}`}>
      <div className="sidebar-menu">

        <NavLink to="profile" className="sidebar-link">
          <i className="bi bi-person"></i>
          <span>Profile</span>
        </NavLink>

        {/* Jobs Dropdown */}

<div className="sidebar-link" onClick={()=>setOpenJobs(!openJobs)}>
  <i className="bi bi-briefcase"></i>
  <span>Jobs</span>
  <i className={`bi ${openJobs ? "bi-chevron-up" : "bi-chevron-down"} ms-auto`}></i>
</div>

{openJobs && (

<div className="submenu">

  <NavLink to="/dashboard/alljobs" className="sidebar-sublink">
    All Jobs
  </NavLink>

  <NavLink to="/dashboard/appliedjobs" className="sidebar-sublink">
    Applied Jobs
  </NavLink>

</div>

)}
        <NavLink to="course" className="sidebar-link">
          <i className="bi bi-book"></i>
          <span>Course</span>
        </NavLink>

        <NavLink to="exams" className="sidebar-link">
          <i className="bi bi-pencil-square"></i>
          <span>Exams</span>
        </NavLink>

        <NavLink to="exam-reports" className="sidebar-link">
          <i className="bi bi-bar-chart"></i>
          <span>Reports</span>
        </NavLink>

        <NavLink to="exam-leaderboard" className="sidebar-link">
          <i className="bi bi-trophy"></i>
          <span>Leaderboard</span>
        </NavLink>

        <NavLink to="playground" className="sidebar-link">
          <i className="bi bi-code-slash"></i>
          <span>Playground</span>
        </NavLink>

        <NavLink to="leave-request" className="sidebar-link">
        <i className="bi bi-calendar-check"></i>
        <span>Leave Request</span>
        </NavLink>

        <NavLink to="logout" className="sidebar-link">
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </NavLink>

      </div>
    </div>
  );
}

export default Sidebar;