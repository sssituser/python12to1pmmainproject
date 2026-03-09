import { NavLink } from "react-router-dom";

function Sidebar({ sidebarOpen }) {
  return (
    <div className={`sidebar ${!sidebarOpen ? "collapsed" : ""}`}>
      <div className="sidebar-menu">

        <NavLink to="profile" className="sidebar-link">
          <i className="bi bi-person"></i>
          <span>Profile</span>
        </NavLink>

        <NavLink to="jobs" className="sidebar-link">
          <i className="bi bi-briefcase"></i>
          <span>Jobs</span>
        </NavLink>

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

        <NavLink to="logout" className="sidebar-link">
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </NavLink>

      </div>
    </div>
  );
}

export default Sidebar;