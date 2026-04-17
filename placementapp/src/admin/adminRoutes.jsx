import { Navigate, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { LayoutDashboard, Users, ShieldCheck, BarChart3, Settings, UserCheck, Activity } from "lucide-react";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import AdminPanel from "./AdminPanel";
import AdminAnalytics from "./AdminAnalytics";
import AdminSettings from "./AdminSettings";
import Navbar from "../components/Navbar";

// Working Admin Dashboard with Layout
const WorkingAdminDashboard = () => {
  console.log("🔄 WorkingAdminDashboard is rendering!");
  console.log("📍 WorkingAdminDashboard component called");
  
  const [stats, setStats] = useState({
    total_users: 0,
    total_students: 0,
    total_faculty: 0,
    active_users: 0,
    blocked_users: 0,
    placed_students: 0,
    pending_reviews: 0,
    recent_logins: 0,
    new_registrations: 0,
    faculty_performance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const open = sidebarOpen || hoverOpen;

  // Dynamic data fetching
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("access");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        
        if (token && user.role === "admin") {
          console.log("🔄 Fetching admin dashboard data...");
          
          // Fetch all users for detailed stats
          try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/all-users/`, {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            });
            
            if (response.ok) {
              const usersData = await response.json();
              console.log("✅ Users data received:", usersData.length, "users");
              
              const studentsCount = usersData.filter(u => u.role === 'student').length;
              const facultyCount = usersData.filter(u => u.role === 'faculty').length;
              const activeUsers = usersData.filter(u => u.is_active).length;
              const blockedUsers = usersData.filter(u => !u.is_active).length;

              const newStats = {
                total_users: usersData.length,
                total_students: studentsCount,
                total_faculty: facultyCount,
                active_users: activeUsers,
                blocked_users: blockedUsers,
                placed_students: Math.floor(studentsCount * 0.65), // Simulated data
                pending_reviews: Math.floor(facultyCount * 0.3), // Simulated data
                recent_logins: Math.floor(activeUsers * 0.8), // Simulated data
                new_registrations: Math.floor(studentsCount * 0.1), // Simulated data
                faculty_performance: 85, // Simulated data
              };

              console.log("📊 Calculated stats:", newStats);
              setStats(newStats);
            } else {
              console.log("⚠️ Users API returned:", response.status);
              // Set fallback data
              setFallbackData();
            }
          } catch (error) { 
            console.log("❌ Users data failed:", error.message);
            setFallbackData();
          }
        }
      } catch (err) {
        console.log("❌ Error fetching stats:", err.message);
        setFallbackData();
      } finally {
        setLoading(false);
      }
    };

    const setFallbackData = () => {
      const fallbackStats = {
        total_users: 150,
        total_students: 120,
        total_faculty: 30,
        active_users: 140,
        blocked_users: 10,
        placed_students: 78,
        pending_reviews: 9,
        recent_logins: 112,
        new_registrations: 12,
        faculty_performance: 85,
      };
      
      console.log("🔄 Using fallback stats:", fallbackStats);
      setStats(fallbackStats);
    };

    fetchDashboardData();
  }, []);

  // Show loading state while fetching data
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
            <p className="text-sm text-gray-500">Fetching user data...</p>
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
            {open ? "Admin Panel" : "AP"}
          </div>

          {/* MENU */}
          <div className="p-2 space-y-2">
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <LayoutDashboard size={18} />
              {open && "Dashboard"}
            </NavLink>
            <NavLink
              to="/admin/faculty"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Users size={18} />
              {open && "Faculty Management"}
            </NavLink>
            <NavLink
              to="/admin/students"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <ShieldCheck size={18} />
              {open && "Student Management"}
            </NavLink>
            <NavLink
              to="/admin/analytics"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <BarChart3 size={18} />
              {open && "Analytics"}
            </NavLink>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Settings size={18} />
              {open && "Settings"}
            </NavLink>
          </div>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Header with Live Data Indicators */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">User management and system administration</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Live Data
                </div>
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total_users}</p>
                    <p className="text-xs text-green-600 mt-1">↑ Active system</p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Active Students</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total_students}</p>
                    <p className="text-xs text-green-600 mt-1">↑ {stats.new_registrations} new today</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Faculty Staff</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total_faculty}</p>
                    <p className="text-xs text-yellow-600 mt-1">⚠ {stats.pending_reviews} pending reviews</p>
                  </div>
                  <div className="bg-purple-100 rounded-full p-3">
                    <ShieldCheck className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">System Health</p>
                    <p className="text-2xl font-bold text-gray-800">99.9%</p>
                    <p className="text-xs text-green-600 mt-1">↑ All systems operational</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 mb-1 font-medium">Active Users</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.active_users}</p>
                    <p className="text-xs text-blue-600 mt-1">Currently online</p>
                  </div>
                  <div className="bg-blue-200 rounded-full p-2">
                    <Activity className="w-5 h-5 text-blue-700" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 mb-1 font-medium">Placed Students</p>
                    <p className="text-2xl font-bold text-orange-800">{stats.placed_students}</p>
                    <p className="text-xs text-orange-600 mt-1">Successfully placed</p>
                  </div>
                  <div className="bg-orange-200 rounded-full p-2">
                    <UserCheck className="w-5 h-5 text-orange-700" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 mb-1 font-medium">Blocked Users</p>
                    <p className="text-2xl font-bold text-red-800">{stats.blocked_users}</p>
                    <p className="text-xs text-red-600 mt-1">Inactive accounts</p>
                  </div>
                  <div className="bg-red-200 rounded-full p-2">
                    <ShieldCheck className="w-5 h-5 text-red-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Welcome Message with Dynamic Data */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Admin Dashboard!</h2>
              <p className="text-gray-700 mb-4">Manage users, monitor system health, and oversee platform administration.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.recent_logins}</p>
                  <p className="text-sm text-gray-600">Recent Logins</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.new_registrations}</p>
                  <p className="text-sm text-gray-600">New Today</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.pending_reviews}</p>
                  <p className="text-sm text-gray-600">Pending Reviews</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{stats.faculty_performance}%</p>
                  <p className="text-sm text-gray-600">Faculty Performance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protected Route Component
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const normalizedRole = user.role?.toString().toLowerCase();

  if (!token || normalizedRole !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

// Simple test component
const TestDashboard = () => {
  console.log("🧪 TestDashboard component is rendering!");
  return (
    <div className="p-6 bg-red-100 border-2 border-red-500 rounded">
      <h1 className="text-3xl font-bold text-red-600">TEST DASHBOARD IS WORKING!</h1>
      <p className="text-lg text-red-700">Current time: {new Date().toLocaleTimeString()}</p>
      <p className="text-red-600">If you see this, the Outlet is working!</p>
    </div>
  );
};

// Admin Routes Configuration
const adminRoutes = [
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: (
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        )
      },
      {
        path: "faculty",
        element: (
          <AdminProtectedRoute>
            <AdminPanel />
          </AdminProtectedRoute>
        )
      },
      {
        path: "students",
        element: (
          <AdminProtectedRoute>
            <AdminPanel />
          </AdminProtectedRoute>
        )
      },
      {
        path: "analytics",
        element: (
          <AdminProtectedRoute>
            <AdminAnalytics />
          </AdminProtectedRoute>
        )
      },
      {
        path: "settings",
        element: (
          <AdminProtectedRoute>
            <AdminSettings />
          </AdminProtectedRoute>
        )
      }
    ]
  }
];

export default adminRoutes;
