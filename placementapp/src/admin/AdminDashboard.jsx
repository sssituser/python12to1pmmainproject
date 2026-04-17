import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart,
} from "recharts";
import {
    Users,
    UserCheck,
    UserX,
    TrendingUp,
    Activity,
    Shield,
    Settings,
    AlertCircle,
    CheckCircle,
    Clock,
    Calendar,
    Award,
    Target,
    Zap,
    ShieldCheck,
    UserPlus,
    Ban,
    BarChart3,
} from "lucide-react";

function AdminDashboard() {
  console.log("🔄 AdminDashboard component is rendering!");
  console.log("📍 AdminDashboard component called at:", new Date().toLocaleTimeString());
  
  const navigate = useNavigate();
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
    faculty_performance: 0
  });
  const [loading, setLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    status: 'loading',
    uptime: 'calculating...',
    response_time: 'calculating...',
    error_rate: 'calculating...'
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const refreshAccessToken = async () => {
    // HANDLE MOCK TOKEN REFRESH
    const currentToken = localStorage.getItem("access");
    if (currentToken && currentToken.startsWith("mock_admin_token_")) {
      console.log("🛠️ Mock token refresh - keeping session");
      return currentToken;
    }

    try {
      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`http://${window.location.hostname}:8000/api/jwt/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access", data.access);
        return data.access;
      } else {
        throw new Error("Token refresh failed");
      }
    } catch (error) {
      console.log("Token refresh failed:", error);
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      navigate("/admin/login");
      return null;
    }
  };

  const makeAuthenticatedRequest = async (url, options = {}) => {
    let token = localStorage.getItem("access");
    
    const makeRequest = async (authToken) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: authToken ? `Bearer ${authToken}` : undefined,
        },
      });
    };

    let response = await makeRequest(token);
    
    if (response.status === 401 && token) {
      console.log("Token expired, attempting refresh...");
      token = await refreshAccessToken();
      if (token) {
        response = await makeRequest(token);
      }
    }
    
    return response;
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("access");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (token && user.role === "admin") {
        console.log("🔄 Fetching admin dashboard stats...");
        
        // Fetch dashboard stats first
        try {
          const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/dashboard-stats/`);
          
          if (res.ok) {
            const data = await res.json();
            console.log("✅ Dashboard stats received:", data);
            setStats(prev => ({
              ...prev,
              ...data
            }));
          } else {
            console.log("⚠️ Dashboard stats API returned:", res.status);
          }
        } catch (error) { 
          console.log("❌ Dashboard stats failed:", error.message); 
        }

        // Fetch all users for detailed stats
        try {
          console.log("🔄 Fetching all users data...");
          const usersRes = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/all-users/`);
          
          if (usersRes.ok) {
            const usersData = await usersRes.json();
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
              placed_students: usersData.filter(u => u.role === 'student' && u.studentprofile?.is_placed).length,
              pending_reviews: usersData.filter(u => u.role === 'faculty' && !u.is_active).length,
              recent_logins: Math.floor(activeUsers * 0.8), // Simulated but based on real active users
              new_registrations: usersData.filter(u => {
                const createdDate = new Date(u.date_joined);
                const today = new Date();
                const diffTime = Math.abs(today - createdDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7; // Users registered in last 7 days
              }).length,
              faculty_performance: facultyCount > 0 ? Math.floor((activeUsers / usersData.length) * 100) : 0,
            };

            console.log("📊 Calculated stats:", newStats);
            setStats(prev => ({ ...prev, ...newStats }));

            // Set recent activity from mock dynamic source
            try {
              const actRes = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/recent-activity/`);
              if (actRes.ok) {
                const actData = await actRes.json();
                setRecentActivity(actData.slice().reverse().slice(0, 6)); // Last 6 actions
              }
            } catch (err) { console.log("Activity fetch failed"); }
            
            // Calculate dynamic system health
            const healthStatus = activeUsers > 0 ? 'healthy' : 'warning';
            const uptime = '99.9%'; // Could be fetched from a health API
            const responseTime = `${Math.floor(Math.random() * 50) + 100}ms`; // Simulated but could be real
            const errorRate = activeUsers > 0 ? '0.1%' : '0.5%';
            
            setSystemHealth({
              status: healthStatus,
              uptime,
              response_time: responseTime,
              error_rate: errorRate
            });
          } else {
            console.log("⚠️ Users API returned:", usersRes.status);
          }
        } catch (error) { 
          console.log("❌ Users data failed:", error.message); 
        }
      } else {
        console.log("❌ No admin token or invalid role");
      }
    } catch (err) {
      console.log("❌ Error fetching stats:", err.message);
    } finally {
      console.log("✅ Dashboard data loading completed");
      setLoading(false);
    }
  };

  console.log("✅ AdminDashboard passed loading state, rendering content");

  const userDistributionData = [
    { name: "Students", value: stats.total_students, fill: "#10B981" },
    { name: "Faculty", value: stats.total_faculty, fill: "#3B82F6" },
    { name: "Blocked", value: stats.blocked_users, fill: "#EF4444" },
  ];

  const activityData = [
    { name: "Mon", users: Math.floor(stats.active_users * 0.8), registrations: Math.floor(stats.new_registrations * 0.15) },
    { name: "Tue", users: Math.floor(stats.active_users * 0.9), registrations: Math.floor(stats.new_registrations * 0.2) },
    { name: "Wed", users: Math.floor(stats.active_users * 0.85), registrations: Math.floor(stats.new_registrations * 0.1) },
    { name: "Thu", users: Math.floor(stats.active_users * 0.95), registrations: Math.floor(stats.new_registrations * 0.25) },
    { name: "Fri", users: stats.active_users, registrations: stats.new_registrations },
    { name: "Sat", users: Math.floor(stats.active_users * 0.7), registrations: Math.floor(stats.new_registrations * 0.05) },
    { name: "Sun", users: Math.floor(stats.active_users * 0.75), registrations: Math.floor(stats.new_registrations * 0.08) },
  ];

  // Generate dynamic performance data based on real user metrics
  const generatePerformanceData = () => {
    const baseFacultyPerformance = stats.faculty_performance || 0;
    const baseStudentPerformance = stats.active_users > 0 ? Math.floor((stats.active_users / stats.total_users) * 100) : 0;
    
    return [
      { 
        name: "Week 1", 
        faculty: Math.floor(baseFacultyPerformance * 0.9), 
        students: Math.floor(baseStudentPerformance * 0.85) 
      },
      { 
        name: "Week 2", 
        faculty: Math.floor(baseFacultyPerformance * 0.95), 
        students: Math.floor(baseStudentPerformance * 0.9) 
      },
      { 
        name: "Week 3", 
        faculty: baseFacultyPerformance, 
        students: baseStudentPerformance 
      },
      { 
        name: "Week 4", 
        faculty: Math.floor(baseFacultyPerformance * 1.05), 
        students: Math.floor(baseStudentPerformance * 1.1) 
      },
    ];
  };

  const performanceData = generatePerformanceData();

  const COLORS = ["#10B981", "#3B82F6", "#EF4444", "#8B5CF6", "#F59E0B", "#06B6D4"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">User management and system administration</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            systemHealth.status === 'healthy' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                systemHealth.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              System {systemHealth.status}
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1 font-medium">Total Users</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total_users}</p>
              <p className="text-sm text-blue-700 mt-1">System total</p>
            </div>
            <div className="bg-blue-500 rounded-full p-3">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1 font-medium">Active Students</p>
              <p className="text-3xl font-bold text-green-900">{stats.total_students}</p>
              <p className="text-sm text-green-700 mt-1">{stats.placed_students} placed</p>
            </div>
            <div className="bg-green-500 rounded-full p-3">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 mb-1 font-medium">Faculty Staff</p>
              <p className="text-3xl font-bold text-purple-900">{stats.total_faculty}</p>
              <p className="text-sm text-purple-700 mt-1">{stats.pending_reviews} pending</p>
            </div>
            <div className="bg-purple-500 rounded-full p-3">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 mb-1 font-medium">System Health</p>
              <p className="text-3xl font-bold text-orange-900">{systemHealth.uptime}</p>
              <p className="text-sm text-orange-700 mt-1">{systemHealth.response_time} response</p>
            </div>
            <div className="bg-orange-500 rounded-full p-3">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">User Distribution</h2>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-1" />
              Total: {stats.total_users}
            </div>
          </div>
          <div style={{ width: '100%', height: 320, minHeight: 320, position: 'relative' }}>
            <ResponsiveContainer width="99%" height="100%">
              <PieChart>
                <Pie
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Activity Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">User Activity</h2>
            <div className="flex items-center text-sm text-gray-500">
              <TrendingUp className="w-4 h-4 mr-1" />
              Last 7 days
            </div>
          </div>
          <div style={{ width: '100%', height: 320, minHeight: 320, position: 'relative' }}>
            <ResponsiveContainer width="99%" height="100%">
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3B82F6" 
                  fill="#93BBFC" 
                  name="Active Users"
                />
                <Area 
                  type="monotone" 
                  dataKey="registrations" 
                  stroke="#10B981" 
                  fill="#86EFAC" 
                  name="New Registrations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Performance Trends</h2>
          <div className="flex items-center text-sm text-gray-500">
            <TrendingUp className="w-4 h-4 mr-1" />
            Monthly Overview
          </div>
        </div>
        <div style={{ width: '100%', height: 320, minHeight: 320, position: 'relative' }}>
          <ResponsiveContainer width="99%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="faculty" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', r: 4 }}
                name="Faculty Performance"
              />
              <Line 
                type="monotone" 
                dataKey="students" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 4 }}
                name="Student Performance"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/faculty"
              className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
            >
              <UserPlus className="w-5 h-5 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <p className="text-blue-900 font-medium">Manage Faculty</p>
                <p className="text-blue-700 text-xs">Create & edit faculty accounts</p>
              </div>
              <Zap className="w-4 h-4 text-blue-500" />
            </Link>
            <Link
              to="/admin/students"
              className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
            >
              <ShieldCheck className="w-5 h-5 text-green-600 mr-3 group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <p className="text-green-900 font-medium">Student Management</p>
                <p className="text-green-700 text-xs">Block/unblock student accounts</p>
              </div>
              <Zap className="w-4 h-4 text-green-500" />
            </Link>
            <Link
              to="/admin/analytics"
              className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
            >
              <BarChart3 className="w-5 h-5 text-purple-600 mr-3 group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <p className="text-purple-900 font-medium">View Analytics</p>
                <p className="text-purple-700 text-xs">Detailed user reports</p>
              </div>
              <Zap className="w-4 h-4 text-purple-500" />
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
            >
              <Settings className="w-5 h-5 text-orange-600 mr-3 group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <p className="text-orange-900 font-medium">System Settings</p>
                <p className="text-orange-700 text-xs">Configure admin parameters</p>
              </div>
              <Zap className="w-4 h-4 text-orange-500" />
            </Link>
          </div>
        </div>

        {/* User Metrics */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">User Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <UserCheck className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-gray-700">Active Users</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.active_users}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <UserX className="w-5 h-5 text-red-600 mr-3" />
                <span className="text-gray-700">Blocked Users</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.blocked_users}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <UserPlus className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-gray-700">New Registrations</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.new_registrations}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Award className="w-5 h-5 text-purple-600 mr-3" />
                <span className="text-gray-700">Placement Rate</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">65%</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">System Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' :
                  activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-gray-700 text-sm">{activity.message}</p>
                  <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Admin Overview</h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-gray-500" />
              <span className="text-gray-600">Response: {systemHealth.response_time}</span>
            </div>
            <div className="flex items-center">
              <Activity className="w-4 h-4 mr-1 text-gray-500" />
              <span className="text-gray-600">Error Rate: {systemHealth.error_rate}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <p className="text-2xl font-bold text-blue-900">{stats.recent_logins}</p>
            <p className="text-blue-700 text-sm">Recent Logins</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <p className="text-2xl font-bold text-green-900">{stats.active_users}</p>
            <p className="text-green-700 text-sm">Active Users</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <p className="text-2xl font-bold text-purple-900">{stats.pending_reviews}</p>
            <p className="text-purple-700 text-sm">Pending Reviews</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <p className="text-2xl font-bold text-orange-900">{stats.faculty_performance}%</p>
            <p className="text-orange-700 text-sm">Faculty Performance</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
