import {
  AlertCircle,
  CheckCircle,
  Edit,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
  UserX,
  X,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();

  console.log("🔄 AdminPanel component is rendering!");
  console.log("📍 Current path:", location.pathname);

  // Determine active tab based on URL
  useEffect(() => {
    console.log("🔍 Checking path for tab selection:", location.pathname);
    if (location.pathname.includes('/faculty')) {
      console.log("📚 Setting tab to faculty");
      setActiveTab("faculty");
    } else if (location.pathname.includes('/students')) {
      console.log("👨‍🎓 Setting tab to students");
      setActiveTab("students");
    }
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState("faculty");
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_active: true
  });
  const [showPassword, setShowPassword] = useState(false);

  // Enhanced state for search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [message, setMessage] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    totalFaculty: 0,
    activeFaculty: 0,
    totalStudents: 0,
    activeStudents: 0,
    blockedStudents: 0,
    placedStudents: 0,
  });

  // Faculty form states
  const [facultyForm, setFacultyForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: ""
  });

  const [showFacultyForm, setShowFacultyForm] = useState(false);
  const [facultyFormErrors, setFacultyFormErrors] = useState({});
  const [editingFaculty, setEditingFaculty] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const refreshAccessToken = async () => {
    // HANDLE MOCK TOKEN REFRESH
    const currentToken = localStorage.getItem("access");
    if (currentToken && currentToken.startsWith("mock_admin_token_")) {
      console.log("🛠️ Mock token refresh - keeping current session");
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const hostname = window.location.hostname;
      const response = await makeAuthenticatedRequest(`http://${hostname}:8000/api/all-users/`);

      if (response && response.ok) {
        const data = await response.json();
        setUsers(data);

        // Filter into faculty and students
        const facultyUsers = data.filter(u => u.role === 'faculty');
        const studentUsers = data.filter(u => u.role === 'student');

        setFaculty(facultyUsers);
        setStudents(studentUsers);

        // Update Stats
        setStats({
          totalFaculty: facultyUsers.length,
          activeFaculty: facultyUsers.filter(u => u.is_active).length,
          totalStudents: studentUsers.length,
          activeStudents: studentUsers.filter(u => u.is_active).length,
          blockedStudents: studentUsers.filter(u => !u.is_active).length,
          placedStudents: studentUsers.filter(u => u.studentprofile?.is_placed).length
        });
      } else {
        console.error("Failed to fetch users, status:", response?.status);
        showMessage('error', "Failed to load user data");
      }
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
      showMessage('error', "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE USER ---
  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      const response = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/delete-user/${userId}/`, {
        method: "DELETE"
      });
      if (response && response.ok) {
        showMessage('success', "User deleted successfully");
        fetchUsers();
      } else {
        showMessage('error', "Failed to delete user");
      }
    } catch (err) {
      showMessage('error', "Error deleting user");
    }
  };

  // --- TOGGLE USER STATUS ---
  const toggleUserStatus = async (user) => {
    const role = user.role === 'admin' ? 'faculty' : (user.role || 'student');
    const endpoint = role === 'faculty'
      ? `http://${window.location.hostname}:8000/api/toggle-faculty-status/${user.id}/`
      : `http://${window.location.hostname}:8000/api/toggle-student-status/${user.id}/`;

    try {
      const response = await makeAuthenticatedRequest(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active })
      });
      if (response && response.ok) {
        showMessage('success', "User status updated successfully");
        fetchUsers();
      } else {
        showMessage('error', "Failed to update status");
      }
    } catch (err) {
      showMessage('error', "Error updating user status");
    }
  };

  // --- EDIT USER ---
  const startEditUser = (user) => {
    setEditUser(user);
    setEditFormData({
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      password: '', // Keep password empty for security
      is_active: user.is_active,
      student_id: user.studentprofile?.student_id || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editUser) return;

    const role = editUser.role || 'student';
    const endpoint = role === 'faculty'
      ? `http://${window.location.hostname}:8000/api/update-faculty/${editUser.id}/`
      : `http://${window.location.hostname}:8000/api/update-student/${editUser.id}/`;

    try {
      const response = await makeAuthenticatedRequest(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData)
      });
      if (response && response.ok) {
        showMessage('success', "User updated successfully");
        setIsEditModalOpen(false);
        setEditUser(null);
        fetchUsers();
      } else {
        showMessage('error', "Failed to update user");
      }
    } catch (err) {
      showMessage('error', "Error updating user");
    }
  };

  // Filter functions
  const filteredFaculty = faculty.filter(f => {
    const matchesSearch = f.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" && f.is_active) ||
      (filterStatus === "inactive" && !f.is_active);

    return matchesSearch && matchesStatus;
  });

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.studentprofile?.student_id && s.studentprofile.student_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" && s.is_active) ||
      (filterStatus === "inactive" && !s.is_active) ||
      (filterStatus === "placed" && s.studentprofile?.is_placed);

    return matchesSearch && matchesStatus;
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const validateFacultyForm = () => {
    const errors = {};

    if (!facultyForm.username.trim()) {
      errors.username = "Username is required";
    } else if (facultyForm.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!facultyForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(facultyForm.email)) {
      errors.email = "Invalid email format";
    }

    if (!facultyForm.first_name.trim()) {
      errors.first_name = "First name is required";
    }

    if (!facultyForm.last_name.trim()) {
      errors.last_name = "Last name is required";
    }

    if (!facultyForm.password.trim()) {
      errors.password = "Password is required";
    } else if (facultyForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFacultyFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createFaculty = async (e) => {
    e.preventDefault();

    if (!validateFacultyForm()) {
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/create-faculty/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(facultyForm)
      });

      const data = await response.json();

      if (response.ok) {
        setShowFacultyForm(false);
        setFacultyForm({ username: "", email: "", first_name: "", last_name: "", password: "" });
        setFacultyFormErrors({});
        fetchUsers();
        showMessage('success', 'Faculty created successfully!');
      } else {
        setFacultyFormErrors({
          submit: data.error || "Failed to create faculty"
        });
      }
    } catch (error) {
      console.error("Failed to create faculty:", error);
      setFacultyFormErrors({
        submit: "Network error. Please try again."
      });
    }
  };

  const deleteFaculty = async (facultyId) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) {
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/delete-faculty/${facultyId}/`, {
        method: "DELETE"
      });

      if (response.ok) {
        fetchUsers();
        showMessage('success', 'Faculty deleted successfully!');
      } else {
        showMessage('error', 'Failed to delete faculty');
      }
    } catch (error) {
      console.error("Failed to delete faculty:", error);
      showMessage('error', 'Network error. Please try again.');
    }
  };

  const toggleFacultyStatus = async (facultyId, currentStatus) => {
    try {
      const response = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/toggle-faculty-status/${facultyId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (response.ok) {
        fetchUsers();
        showMessage('success', `Faculty ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      } else {
        showMessage('error', 'Failed to update faculty status');
      }
    } catch (error) {
      console.error("Failed to update faculty status:", error);
      showMessage('error', 'Network error. Please try again.');
    }
  };

  const toggleStudentStatus = async (studentId, currentStatus) => {
    try {
      const response = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/toggle-student-status/${studentId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (response.ok) {
        fetchUsers();
        showMessage('success', `Student ${!currentStatus ? 'unblocked' : 'blocked'} successfully!`);
      } else {
        showMessage('error', 'Failed to update student status');
      }
    } catch (error) {
      console.error("Failed to update student status:", error);
      showMessage('error', 'Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> :
            message.type === 'error' ? <XCircle size={20} /> :
              <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage faculty credentials and student accounts</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Faculty</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalFaculty}</p>
              <p className="text-xs text-green-600 mt-1">{stats.activeFaculty} active</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
              <p className="text-xs text-green-600 mt-1">{stats.activeStudents} active</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Blocked Students</p>
              <p className="text-2xl font-bold text-gray-800">{stats.blockedStudents}</p>
              <p className="text-xs text-red-600 mt-1">Need attention</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Placed Students</p>
              <p className="text-2xl font-bold text-gray-800">{stats.placedStudents}</p>
              <p className="text-xs text-green-600 mt-1">Successfully placed</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab("faculty")}
          className={`px-4 py-2 rounded-t-lg font-medium ${activeTab === "faculty"
              ? "bg-white text-blue-600 border-t-2 border-l-2 border-r-2 border-blue-600"
              : "bg-gray-200 text-gray-600"
            }`}
        >
          Faculty Management
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 rounded-t-lg font-medium ${activeTab === "students"
              ? "bg-white text-blue-600 border-t-2 border-l-2 border-r-2 border-blue-600"
              : "bg-gray-200 text-gray-600"
            }`}
        >
          Student Management
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'faculty' ? 'faculty' : 'students'} by name, email, or ID...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              {activeTab === 'students' && <option value="placed">Placed</option>}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter size={16} />
              Filters
            </button>
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Faculty Management Tab */}
      {activeTab === "faculty" && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Faculty Accounts</h2>
            <button
              onClick={() => setShowFacultyForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Faculty
            </button>
          </div>

          {showFacultyForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium mb-4">Create New Faculty</h3>
              <form onSubmit={createFaculty} className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={facultyForm.username}
                    onChange={(e) => setFacultyForm({ ...facultyForm, username: e.target.value })}
                    className={`w-full p-2 border rounded ${facultyFormErrors.username ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  />
                  {facultyFormErrors.username && (
                    <p className="text-red-500 text-xs mt-1">{facultyFormErrors.username}</p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={facultyForm.email}
                    onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    className={`w-full p-2 border rounded ${facultyFormErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  />
                  {facultyFormErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{facultyFormErrors.email}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={facultyForm.first_name}
                    onChange={(e) => setFacultyForm({ ...facultyForm, first_name: e.target.value })}
                    className={`w-full p-2 border rounded ${facultyFormErrors.first_name ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  />
                  {facultyFormErrors.first_name && (
                    <p className="text-red-500 text-xs mt-1">{facultyFormErrors.first_name}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={facultyForm.last_name}
                    onChange={(e) => setFacultyForm({ ...facultyForm, last_name: e.target.value })}
                    className={`w-full p-2 border rounded ${facultyFormErrors.last_name ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  />
                  {facultyFormErrors.last_name && (
                    <p className="text-red-500 text-xs mt-1">{facultyFormErrors.last_name}</p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={facultyForm.password}
                    onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                    className={`w-full p-2 border rounded pr-10 ${facultyFormErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {facultyFormErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{facultyFormErrors.password}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFacultyForm(false);
                      setFacultyFormErrors({});
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
                {facultyFormErrors.submit && (
                  <p className="text-red-500 text-sm col-span-2">{facultyFormErrors.submit}</p>
                )}
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 font-medium">Username</th>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      {searchTerm || filterStatus !== "all" ? "No faculty found matching your criteria" : "No faculty accounts found"}
                    </td>
                  </tr>
                ) : (
                  filteredFaculty.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{u.username}</td>
                      <td className="p-3">{u.first_name} {u.last_name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditUser(u)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(u)}
                            className={`p-1 rounded transition-colors ${u.is_active ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'
                              }`}
                            title={u.is_active ? 'Block' : 'Unblock'}
                          >
                            {u.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Management Tab */}
      {activeTab === "students" && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Student Accounts</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setFacultyForm({ username: "", email: "", first_name: "", last_name: "", password: "", student_id: "" });
                  setShowFacultyForm(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Student
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                Import
              </button>
            </div>
          </div>

          {showFacultyForm && activeTab === 'students' && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium mb-4">Create New Student</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/create-student/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...facultyForm, role: 'student' })
                  });
                  if (response.ok) {
                    setShowFacultyForm(false);
                    setFacultyForm({ username: "", email: "", first_name: "", last_name: "", password: "" });
                    fetchUsers();
                    showMessage('success', 'Student created successfully!');
                  }
                } catch (err) { showMessage('error', 'Failed to create student'); }
              }} className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={facultyForm.username}
                  onChange={(e) => setFacultyForm({ ...facultyForm, username: e.target.value })}
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Student ID (Number)"
                  value={facultyForm.student_id || ''}
                  onChange={(e) => setFacultyForm({ ...facultyForm, student_id: e.target.value })}
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={facultyForm.email}
                  onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="First Name"
                  value={facultyForm.first_name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, first_name: e.target.value })}
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={facultyForm.last_name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, last_name: e.target.value })}
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={facultyForm.password}
                  onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                  className="p-2 border rounded"
                  required
                />
                <div className="flex space-x-2">
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFacultyForm(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 font-medium">Student ID</th>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Course</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      {searchTerm || filterStatus !== "all" ? "No students found matching your criteria" : "No student accounts found"}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{s.studentprofile?.student_id || `STU${s.id}`}</td>
                      <td className="p-3">{s.first_name} {s.last_name}</td>
                      <td className="p-3">{s.email}</td>
                      <td className="p-3">{s.studentprofile?.course?.title || 'Not assigned'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {s.is_active ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditUser(s)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(s)}
                            className={`p-1 rounded transition-colors ${s.is_active ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'
                              }`}
                            title={s.is_active ? 'Block' : 'Unblock'}
                          >
                            {s.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button
                            onClick={() => deleteUser(s.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">Edit {editUser?.role?.charAt(0).toUpperCase() + editUser?.role?.slice(1)}</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="hover:bg-blue-700 p-1 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {editUser?.role === 'student' && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Student ID (Numeric)</label>
                  <input
                    type="text"
                    value={editFormData.student_id}
                    onChange={(e) => setEditFormData({ ...editFormData, student_id: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">New Password (leave blank to keep current)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit_active"
                  checked={editFormData.is_active}
                  onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="edit_active" className="text-sm font-medium text-gray-700">Account Active</label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md shadow-blue-100 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
