import { NavLink } from "react-router-dom";
import { useState } from "react";

function Sidebar({ sidebarOpen }) {

  const [openJobs, setOpenJobs] = useState(true);
  const [openPlayground, setOpenPlayground] = useState(false);

  return (

    <div
      className={`bg-blue-950 text-white min-h-screen transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-20"
      } flex flex-col`}
    >

      {/* Title */}
      <div className="p-4 text-lg font-semibold border-b border-blue-800">
        {sidebarOpen ? "Student Dashboard" : "SD"}
      </div>

      <div className="flex flex-col p-2 space-y-1">

        {/* Profile */}
        <NavLink
          to="/dashboard/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded hover:bg-blue-700 ${
              isActive ? "bg-blue-700" : ""
            }`
          }
        >
          <i className="bi bi-person text-lg"></i>
          {sidebarOpen && <span>Profile</span>}
        </NavLink>


        {/* Jobs Dropdown */}
        <div
          onClick={() => setOpenJobs(!openJobs)}
          className="flex items-center gap-3 p-3 rounded hover:bg-blue-700 cursor-pointer"
        >
          <i className="bi bi-briefcase text-lg"></i>
          {sidebarOpen && <span>Jobs</span>}

          {sidebarOpen && (
            <i
              className={`bi ms-auto ${
                openJobs ? "bi-chevron-up" : "bi-chevron-down"
              }`}
            ></i>
          )}
        </div>

        {/* Jobs submenu */}
        {openJobs && sidebarOpen && (

          <div className="ml-8 flex flex-col">

            <NavLink
              to="/dashboard/alljobs"
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 text-sm hover:text-blue-300 ${
                  isActive ? "text-blue-300" : ""
                }`
              }
            >
              <i className="bi bi-briefcase-fill"></i>
              <span>All Jobs</span>
            </NavLink>

            <NavLink
              to="/dashboard/appliedjobs"
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 text-sm hover:text-blue-300 ${
                  isActive ? "text-blue-300" : ""
                }`
              }
            >
              <i className="bi bi-check-circle-fill"></i>
              <span>Applied Jobs</span>
            </NavLink>

          </div>

        )}


        {/* Course */}
        <NavLink
          to="/dashboard/course"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded hover:bg-blue-700 ${
              isActive ? "bg-blue-700" : ""
            }`
          }
        >
          <i className="bi bi-book text-lg"></i>
          {sidebarOpen && <span>Course</span>}
        </NavLink>


        {/* Exams */}
        <NavLink
          to="/dashboard/exams"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded hover:bg-blue-700 ${
              isActive ? "bg-blue-700" : ""
            }`
          }
        >
          <i className="bi bi-pencil-square text-lg"></i>
          {sidebarOpen && <span>Exams</span>}
        </NavLink>


        {/* Reports */}
        <NavLink
          to="/dashboard/exam-reports"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded hover:bg-blue-700 ${
              isActive ? "bg-blue-700" : ""
            }`
          }
        >
          <i className="bi bi-bar-chart text-lg"></i>
          {sidebarOpen && <span>Reports</span>}
        </NavLink>


        {/* Leaderboard */}
        <NavLink
          to="/dashboard/exam-leaderboard"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded hover:bg-blue-700 ${
              isActive ? "bg-blue-700" : ""
            }`
          }
        >
          <i className="bi bi-trophy text-lg"></i>
          {sidebarOpen && <span>Leaderboard</span>}
        </NavLink>


        {/* Playground Dropdown */}
        <div
          onClick={() => setOpenPlayground(!openPlayground)}
          className="flex items-center gap-3 p-3 rounded hover:bg-blue-700 cursor-pointer"
        >
          <i className="bi bi-code-slash text-lg"></i>

          {sidebarOpen && <span>Playground</span>}

          {sidebarOpen && (
            <i
              className={`bi ms-auto ${
                openPlayground ? "bi-chevron-up" : "bi-chevron-down"
              }`}
            ></i>
          )}
        </div>

        {/* Playground submenu */}
        {openPlayground && sidebarOpen && (

          <div className="ml-8 flex flex-col">

            <NavLink
              to="/dashboard/playground"
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 text-sm hover:text-blue-300 ${
                  isActive ? "text-blue-300" : ""
                }`
              }
            >
              <i className="bi bi-terminal"></i>
              <span>Tech Lab</span>
            </NavLink>

            <NavLink
              to="/dashboard/playground-results"
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 text-sm hover:text-blue-300 ${
                  isActive ? "text-blue-300" : ""
                }`
              }
            >
              <i className="bi bi-clipboard-data"></i>
              <span>Results</span>
            </NavLink>

          </div>

        )}


        {/* Leave Request */}
        <NavLink
          to="/dashboard/leave-request"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded hover:bg-blue-700 ${
              isActive ? "bg-blue-700" : ""
            }`
          }
        >
          <i className="bi bi-calendar-check text-lg"></i>
          {sidebarOpen && <span>Leave Request</span>}
        </NavLink>


        {/* Logout */}
        <NavLink
          to="/logout"
          className="flex items-center gap-3 p-3 rounded hover:bg-red-600 mt-auto"
        >
          <i className="bi bi-box-arrow-right text-lg"></i>
          {sidebarOpen && <span>Logout</span>}
        </NavLink>

      </div>

    </div>

  );
}

export default Sidebar;