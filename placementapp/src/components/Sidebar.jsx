import { NavLink } from "react-router-dom";

function Sidebar({ sidebarOpen }) {
  return (
    <div className={`sidebar ${!sidebarOpen ? "collapsed" : ""}`}>

      <div className="sidebar-menu">

        <NavLink to="/dashboard/profile" className="sidebar-link">
          <i className="bi bi-person"></i>
          <span>Profile</span>
        </NavLink>

        <NavLink to="/dashboard/jobs" className="sidebar-link">
          <i className="bi bi-briefcase"></i>
          <span>Jobs</span>
        </NavLink>

        <NavLink to="/dashboard/course" className="sidebar-link">
          <i className="bi bi-book"></i>
          <span>Course</span>
        </NavLink>

        <NavLink to="/dashboard/exams" className="sidebar-link">
          <i className="bi bi-pencil-square"></i>
          <span>Exams</span>
        </NavLink>

        <NavLink to="/dashboard/exam-reports" className="sidebar-link">
          <i className="bi bi-bar-chart"></i>
          <span>Reports</span>
        </NavLink>

        <NavLink to="/dashboard/exam-leaderboard" className="sidebar-link">
          <i className="bi bi-trophy"></i>
          <span>Leaderboard</span>
        </NavLink>

        <NavLink to="/dashboard/playground" className="sidebar-link">
          <i className="bi bi-code-slash"></i>
          <span>Playground</span>
        </NavLink>

        <NavLink to="/dashboard/logout" className="sidebar-link">
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </NavLink>

      </div>

    </div>
  );
}

export default Sidebar;