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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic user data loading
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem("access");
        const userStr = localStorage.getItem("user");
        
        if (!token || !userStr) {
          navigate("/faculty/login");
          return;
        }

        const user = JSON.parse(userStr);
        setCurrentUser(user);
        
        // Load profile image
        try {
          const response = await fetch("http://127.0.0.1:8000/api/faculty/profile/", {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.avatar) {
              const imageUrl = data.avatar.startsWith('http') 
                ? data.avatar 
                : `http://127.0.0.1:8000${data.avatar}`;
              setProfileImage(imageUrl);
            }
          }
        } catch (error) {
          console.log("Failed to load profile image:", error);
        }
        
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        const userStr = e.newValue;
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
          } catch (error) {
            console.error("Error parsing user data:", error);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

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
    ...(isAdmin ? [{ name: "Admin Center", path: "/faculty/admin", icon: <ShieldCheck size={18}/> }] : []),
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
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        className={`bg-slate-900 text-gray-300 min-h-screen flex flex-col justify-between transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* HEADER */}
        <div>
          <div className="h-16 flex items-center px-4 text-white font-semibold border-b border-slate-700">
            {sidebarOpen ? "Faculty Panel" : "FP"}
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
                {sidebarOpen && item.name}
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
              {sidebarOpen && (
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
              {sidebarOpen && "Logout"}
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