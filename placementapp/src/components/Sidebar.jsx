import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  User,
  Briefcase,
  Book,
  BookOpen,
  FileText,
  BarChart,
  Trophy,
  Code,
  LogOut,
  ChevronDown,
  Folder,
  CheckCircle,
  ClipboardList,
  Sparkles,
  FileSearch,
  Lightbulb,
  MessageSquare,
} from "lucide-react";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const [hoverOpen, setHoverOpen] = useState(false);
  const [jobsOpen, setJobsOpen] = useState(() => {
    return localStorage.getItem("jobsOpen") === "true";
  });
  const [playOpen, setPlayOpen] = useState(() => {
    return localStorage.getItem("playOpen") === "true";
  });
  const [aiOpen, setAiOpen] = useState(() => {
    return localStorage.getItem("aiOpen") === "true";
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

  const toggleAi = () => {
    setAiOpen(prev => {
      const next = !prev;
      localStorage.setItem("aiOpen", next);
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
    <>
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        onMouseEnter={() => setHoverOpen(true)}
        onMouseLeave={() => setHoverOpen(false)}
        className={`bg-slate-900 text-gray-300 h-screen flex flex-col justify-between transition-all duration-300 fixed md:sticky top-0 left-0 z-50 md:z-30 shrink-0
          ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 w-64 md:w-20"}
          ${hoverOpen ? "md:w-64" : ""}
        `}
      >
        {/* TOP SECTION (Header + Menu) */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="h-16 flex items-center px-4 text-white font-semibold border-b border-slate-700 shrink-0">
            {open ? "Student Dashboard" : "SD"}
          </div>

          {/* MENU (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">

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

          {/* EXAMS HUB */}
          <NavLink
            to="/dashboard/exams"
            className={({ isActive }) =>
              `${linkClass} ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <ClipboardList size={18} />
            {open && "Exams"}
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
                  to="/dashboard/playground"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2 py-1 rounded transition ${
                      isActive
                        ? "bg-slate-800 text-white"
                        : "hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <Code size={14} />
                  Practice
                </NavLink>

                <NavLink
                  to="/dashboard/exams"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2 py-1 rounded transition ${
                      isActive
                        ? "bg-slate-800 text-white"
                        : "hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <BookOpen size={14} />
                  Exams
                </NavLink>

                <NavLink
                  to="/dashboard/playground-results"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2 py-1 rounded transition ${
                      isActive
                        ? "bg-slate-800 text-white"
                        : "hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <CheckCircle size={14} />
                  Results
                </NavLink>

              </div>
            )}
          </div>

          {/* AI TOOLS */}
          <div>
            <button
              onClick={toggleAi}
              className={`${linkClass} w-full justify-between hover:bg-slate-800`}
            >
              <span className="flex items-center gap-3">
                <Sparkles size={18} className="text-indigo-400" />
                {open && <span className="text-indigo-300 font-semibold">AI Tools</span>}
              </span>
              {open && (
                <ChevronDown
                  size={16}
                  className={`transition ${aiOpen && "rotate-180"}`}
                />
              )}
            </button>

            {aiOpen && open && (
              <div className="ml-6 mt-2 space-y-1 text-sm">
                <NavLink
                  to="/dashboard/ai/resume"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2 py-1 rounded transition ${
                      isActive ? "bg-indigo-600 text-white" : "hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <FileSearch size={14} />
                  Resume Analyzer
                </NavLink>

                <NavLink
                  to="/dashboard/ai/jobs"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2 py-1 rounded transition ${
                      isActive ? "bg-indigo-600 text-white" : "hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <Lightbulb size={14} />
                  Job Recommendations
                </NavLink>

                <NavLink
                  to="/dashboard/ai/chat"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2 py-1 rounded transition ${
                      isActive ? "bg-indigo-600 text-white" : "hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <MessageSquare size={14} />
                  AI Assistant
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
      <div className="p-3 border-t border-slate-700 shrink-0 bg-slate-950">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-600 hover:text-white transition"
        >
          <LogOut size={18} />
          {open && "Logout"}
        </button>
      </div>
    </div>
    </>
  );
}

export default Sidebar;
