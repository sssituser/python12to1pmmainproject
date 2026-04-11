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

function Sidebar({ sidebarOpen }) {
  const [hoverOpen, setHoverOpen] = useState(false);
  const [jobsOpen, setJobsOpen] = useState(() => {
    return localStorage.getItem("jobsOpen") === "true";
  });
  const [playOpen, setPlayOpen] = useState(() => {
    return localStorage.getItem("playOpen") === "true";
  });

  const toggleJobs = () => {
    setJobsOpen(prev => {
      const next = !prev;
      localStorage.setItem("jobsOpen", next);
      return next;
    });
  };

  const togglePlay = () => {
    setPlayOpen(prev => {
      const next = !prev;
      localStorage.setItem("playOpen", next);
      return next;
    });
  };

  // Consider it open if either manually toggled OR hovered
  const open = sidebarOpen || hoverOpen;

  const navigate = useNavigate();

  // Get user data from localStorage
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    currentUser = null;
  }

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getDisplayName = () => {
    if (!currentUser) return "Student";
    if (currentUser.first_name || currentUser.last_name) {
      return `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim();
    }
    return currentUser.username || "Student";
  };

  const getDisplayEmail = () => {
    if (!currentUser) return "student@university.edu";
    return currentUser.email || `${currentUser.username || 'student'}@university.edu`;
  };

  const getInitials = () => {
    if (!currentUser) return "S";
    if (currentUser.first_name && currentUser.last_name) {
      return currentUser.first_name[0] + currentUser.last_name[0];
    }
    return currentUser.username?.[0]?.toUpperCase() || "S";
  };

  const linkClass =
    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium no-underline transition";

  return (
    <div
      onMouseEnter={() => setHoverOpen(true)}
      onMouseLeave={() => setHoverOpen(false)}
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
              onClick={toggleJobs}
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
              onClick={togglePlay}
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
                  to="/dashboard/playground/python"
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-800 hover:text-white"
                >
                  <Code size={14} />
                  Coding
                </NavLink>

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
