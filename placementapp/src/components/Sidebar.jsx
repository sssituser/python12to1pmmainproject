import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {

return (
<div className="sidebar">
    <div className="sidebar-menu">
    <NavLink to="/profile" className="sidebar-link">Profile</NavLink>
      <NavLink to="/resume" className="sidebar-link">Resume</NavLink>

    <NavLink to="/jobs" className="sidebar-link">Jobs</NavLink>
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