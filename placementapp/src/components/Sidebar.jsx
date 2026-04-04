import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  User,
  Briefcase,
  Book,
  FileText,
  BarChart,
  Trophy,
  Code,
  LogOut,
  ChevronDown,
  Folder,
  CheckCircle,
} from "lucide-react";

function Sidebar() {
  const [open, setOpen] = useState(false);
  const [jobsOpen, setJobsOpen] = useState(false);
  const [playOpen, setPlayOpen] = useState(false);

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/");
  };

  const linkClass =
    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium no-underline transition";

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        setOpen(false);
        setJobsOpen(false);
        setPlayOpen(false);
      }}
      className={`bg-slate-900 text-gray-300 min-h-screen flex flex-col justify-between
      transition-all duration-300 ${open ? "w-64" : "w-20"}`}
    >

      {/* HEADER */}
      <div>
        <div className="h-16 flex items-center px-4 text-white font-semibold border-b border-slate-700">
          {open ? "Student Dashboard" : "SD"}
        </div>

        {/* MENU */}
        <div className="p-2 space-y-2">

          {/* PROFILE */}
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) =>
              `${linkClass} ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <User size={18} />
            {open && "Profile"}
          </NavLink>

          {/* JOBS */}
          <div>
            <button
              onClick={() => setJobsOpen(!jobsOpen)}
              className={`${linkClass} w-full justify-between hover:bg-slate-800`}
            >
              <span className="flex items-center gap-3">
                <Briefcase size={18} />
                {open && "Jobs"}
              </span>

              {open && (
                <ChevronDown
                  size={16}
                  className={`transition ${jobsOpen && "rotate-180"}`}
                />
              )}
            </button>

            {jobsOpen && open && (
              <div className="ml-6 mt-2 space-y-1 text-sm">

                <NavLink
                  to="/dashboard/alljobs"
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-800 hover:text-white"
                >
                  <Folder size={14} />
                  All Jobs
                </NavLink>

                <NavLink
                  to="/dashboard/appliedjobs"
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-800 hover:text-white"
                >
                  <CheckCircle size={14} />
                  Applied Jobs
                </NavLink>

              </div>
            )}
          </div>

          {/* COURSE */}
          <NavLink
            to="/dashboard/course"
            className={({ isActive }) =>
              `${linkClass} ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Book size={18} />
            {open && "Course"}
          </NavLink>





          {/* REPORTS */}


          <NavLink
            to="/dashboard/exam-reports"
            className={({ isActive }) =>
              `${linkClass} ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <BarChart size={18} />
            {open && "Reports"}
          </NavLink>

          {/* LEADERBOARD */}
          <NavLink
            to="/dashboard/exam-leaderboard"
            className={({ isActive }) =>
              `${linkClass} ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Trophy size={18} />
            {open && "Leaderboard"}
          </NavLink>

          {/* PLAYGROUND */}
          <div>
            <button
              onClick={() => setPlayOpen(!playOpen)}
              className={`${linkClass} w-full justify-between hover:bg-slate-800`}
            >
              <span className="flex items-center gap-3">
                <Code size={18} />
                {open && "Playground"}
              </span>

              {open && (
                <ChevronDown
                  size={16}
                  className={`transition ${playOpen && "rotate-180"}`}
                />
              )}
            </button>

            {playOpen && open && (
              <div className="ml-6 mt-2 space-y-1 text-sm">

                <NavLink
                  to="/dashboard/playground"
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-800 hover:text-white"
                >
                  <Code size={14} />
                  TechLab
                </NavLink>

                <NavLink
                  to="/dashboard/playground-results"
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-800 hover:text-white"
                >
                  <CheckCircle size={14} />
                  Results
                </NavLink>

              </div>
            )}
          </div>

          {/* LEAVE */}
          <NavLink
            to="/dashboard/leave-request"
            className={({ isActive }) =>
              `${linkClass} ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <FileText size={18} />
            {open && "Leave Request"}
          </NavLink>

        </div>
      </div>

      {/* LOGOUT */}
      <div className="p-3 border-t border-slate-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-600 hover:text-white transition"
        >
          <LogOut size={18} />
          {open && "Logout"}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;