import React, { useState, useEffect } from "react";
import {
    AlertTriangle,
    BarChart3,
    BookOpen,
    Briefcase,
    CalendarDays,
    ClipboardList,
    ClipboardCheck,
    FileText,
    LayoutDashboard,
    LogOut,
    Shield,
    User,
    Sparkles,
    Users2,
    MessageSquare,
    ScrollText,
    Layers,
    Video,
    TrendingUp,
    ChevronRight,
    GraduationCap,
    Menu,
    X
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function FacultyLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const location = useLocation();
  const isExpanded = sidebarOpen || hoverOpen;

  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    currentUser = null;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      const storedProfileImage = localStorage.getItem("profileImage");
      if (storedProfileImage) {
        setProfileImage(storedProfileImage);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const menuSections = [
    {
      title: "Core Operations",
      items: [
        { name: "Dashboard", path: "/faculty/dashboard", icon: <LayoutDashboard size={19} /> },
        { name: "Profile", path: "/faculty/profile", icon: <User size={19} /> },
        { name: "Statistics", path: "/faculty/stats", icon: <BarChart3 size={19} /> },
      ]
    },
    {
      title: "Academic Management",
      items: [
        { name: "Courses", path: "/faculty/course", icon: <BookOpen size={19} /> },
        { name: "Batches", path: "/faculty/batches", icon: <Layers size={19} /> },
        { name: "Live Classes", path: "/faculty/live-classes", icon: <Video size={19} /> },
        { name: "Student Approvals", path: "/faculty/student-approvals", icon: <Shield size={19} /> },
      ]
    },
    {
      title: "Placements & Career",
      items: [
        { name: "Jobs Drive", path: "/faculty/jobs", icon: <Briefcase size={19} /> },
        { name: "Applications", path: "/faculty/applications", icon: <FileText size={19} /> },
      ]
    },
    {
      title: "Assessments & Leaves",
      items: [
        { name: "Exams", path: "/faculty/exam", icon: <ClipboardList size={19} /> },
        { name: "Upload Marks", path: "/faculty/upload-marks", icon: <ClipboardCheck size={19} /> },
        { name: "Exam Failures", path: "/faculty/exam-failure", icon: <AlertTriangle size={19} /> },
        { name: "Leave Requests", path: "/faculty/leaves", icon: <CalendarDays size={19} /> },
      ]
    },
    {
      title: "AI Power Tools",
      isAi: true,
      items: [
        { name: "AI Reports", path: "/faculty/ai/reports", icon: <ScrollText size={19} className="text-amber-600" /> },
        { name: "Candidate Ranker", path: "/faculty/ai/candidates", icon: <Users2 size={19} className="text-purple-600" /> },
        { name: "AI Assistant", path: "/faculty/ai/chat", icon: <MessageSquare size={19} className="text-blue-600" /> },
      ]
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getDisplayName = () => {
    if (!currentUser) return "Faculty Member";
    if (currentUser.first_name && currentUser.last_name) {
      return `${currentUser.first_name} ${currentUser.last_name}`;
    }
    return currentUser.username || "Faculty Member";
  };

  const getDisplayEmail = () => {
    return currentUser?.email || "faculty@university.edu";
  };

  const getInitials = () => {
    if (!currentUser) return "F";
    if (currentUser.first_name && currentUser.last_name) {
      return (currentUser.first_name[0] + currentUser.last_name[0]).toUpperCase();
    }
    return (currentUser.username?.[0] || "F").toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-medium text-sm animate-pulse">Loading Faculty Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR - LIGHT THEME */}
      <aside
        onMouseEnter={() => setHoverOpen(true)}
        onMouseLeave={() => setHoverOpen(false)}
        className={`bg-white text-slate-700 h-screen flex flex-col justify-between transition-all duration-300 ease-in-out fixed md:sticky top-0 left-0 z-50 md:z-30 shrink-0 border-r border-slate-200 shadow-xl shadow-slate-200/50
          ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 w-64 md:w-20"}
          ${hoverOpen ? "md:w-64" : ""}
        `}
      >
        {/* BRAND HEADER */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <GraduationCap size={22} className="text-white" />
            </div>
            {isExpanded && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-wide text-slate-900 truncate">
                  SSSIT Faculty
                </span>
                <span className="text-[10px] text-blue-600 font-bold tracking-wider uppercase">Academic Portal</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-500 hover:text-slate-800 p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {isExpanded && (
                <div className="px-3 py-1 flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${section.isAi ? 'text-amber-600 flex items-center gap-1' : 'text-slate-400'}`}>
                    {section.isAi && <Sparkles size={11} />}
                    {section.title}
                  </span>
                  <div className="flex-1 border-t border-slate-100"></div>
                </div>
              )}
              {!isExpanded && <div className="border-t border-slate-100 my-2"></div>}

              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {item.icon}
                      </div>
                      {isExpanded && (
                        <span className="truncate flex-1">{item.name}</span>
                      )}
                      {isExpanded && isActive && (
                        <ChevronRight size={14} className="text-white/80 shrink-0" />
                      )}
                      {/* Tooltip on collapsed desktop view */}
                      {!isExpanded && (
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50">
                          {item.name}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* USER PROFILE FOOTER */}
        <div className="border-t border-slate-100 p-3 shrink-0 bg-slate-50/70">
          <div
            onClick={() => navigate("/faculty/profile")}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-all cursor-pointer group shadow-xs border border-transparent hover:border-slate-200"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs ring-2 ring-blue-500/10 overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.innerText = getInitials();
                  }}
                />
              ) : (
                getInitials()
              )}
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                  {getDisplayName()}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {getDisplayEmail()}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 transition-all duration-200 mt-2 border border-rose-200/60 bg-white"
          >
            <LogOut size={16} />
            {isExpanded && <span>Logout Account</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className={`flex-1 overflow-y-auto transition-colors bg-slate-50 p-4 md:p-6`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default FacultyLayout;

