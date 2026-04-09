import React, { useState, useEffect } from "react";
import {
    AlertTriangle,
    BarChart3,
    BookOpen,
    Briefcase,
    CalendarDays,
    ClipboardList,
    FileText,
    LayoutDashboard,
    LogOut,
    ShieldCheck,
    User
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; // adjust path if needed

function FacultyLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const location = useLocation();
  const open = sidebarOpen || hoverOpen;

  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    currentUser = null;
  }

  useEffect(() => {
    // Simulate loading and set profile image
    const timer = setTimeout(() => {
      setLoading(false);
      // Try to get profile image from localStorage or user data
      const storedProfileImage = localStorage.getItem("profileImage");
      if (storedProfileImage) {
        setProfileImage(storedProfileImage);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const isAdmin = currentUser?.role?.toString().toLowerCase() === "admin";

  const menu = [
    { name: "Profile", path: "/faculty/profile", icon: <User size={18}/> },
    { name: "Dashboard", path: "/faculty/dashboard", icon: <LayoutDashboard size={18}/> },
    { name: "Courses", path: "/faculty/course", icon: <BookOpen size={18}/> },
    { name: "Statistics", path: "/faculty/stats", icon: <BarChart3 size={18}/> },
    { name: "Jobs", path: "/faculty/jobs", icon: <Briefcase size={18}/> },
    { name: "Applications", path: "/faculty/applications", icon: <FileText size={18}/> },
    { name: "Exams", path: "/faculty/exam", icon: <ClipboardList size={18}/> },
    { name: "Exam Failures", path: "/faculty/exam-failure", icon: <AlertTriangle size={18}/> },
    { name: "Leave Requests", path: "/faculty/leaves", icon: <CalendarDays size={18}/> },
  ];

  const linkClass =
    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition";

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Dynamic user info display
  const getDisplayName = () => {
    if (!currentUser) return "Loading...";
    
    if (currentUser.first_name && currentUser.last_name) {
      return `${currentUser.first_name} ${currentUser.last_name}`;
    }
    
    return currentUser.username || "Faculty Member";
  };

  const getDisplayEmail = () => {
    if (!currentUser) return "faculty@university.edu";
    return currentUser.email || "faculty@university.edu";
  };

  const getInitials = () => {
    if (!currentUser) return "U";
    
    if (currentUser.first_name && currentUser.last_name) {
      return currentUser.first_name[0] + currentUser.last_name[0];
    }
    
    return currentUser.username?.[0] || "U";
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white text-gray-900 overflow-hidden">
        <div className="w-64 bg-slate-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading faculty dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden">

      {/* SIDEBAR */}
      <div
        onMouseEnter={() => setHoverOpen(true)}
        onMouseLeave={() => setHoverOpen(false)}
        className={`bg-slate-900 text-gray-300 min-h-screen flex flex-col justify-between transition-all duration-300 ${
          open ? "w-64" : "w-20"
        }`}
      >
        {/* HEADER */}
        <div>
          <div className="h-16 flex items-center px-4 text-white font-semibold border-b border-slate-700">
            {open ? "Faculty Panel" : "FP"}
          </div>

          {/* MENU */}
          <div className="p-2 space-y-2">
            {menu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${linkClass} ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                {item.icon}
                {open && item.name}
              </NavLink>
            ))}
          </div>

          {/* USER PROFILE SECTION */}
          <div className="border-t border-slate-700 p-3">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer" onClick={() => navigate("/faculty/profile")}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = getInitials();
                    }}
                  />
                ) : (
                  getInitials()
                )}
              </div>
              {open && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {getDisplayEmail()}
                  </p>
                </div>
              )}
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-left transition hover:bg-red-600 hover:text-white mt-2"
            >
              <LogOut size={18} />
              {open && "Logout"}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 bg-white p-6 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default FacultyLayout;
