import {
    AlertCircle,
    CheckCircle,
    Download,
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
    XCircle,
    ArrowUpDown,
    ChevronUp,
    ChevronDown
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSEO } from "../utils/useSEO";
import { toast } from "react-toastify";

function AdminPanel() {
  useSEO("Admin Control Panel", "Manage students, faculty, and system configuration from the SSSIT Admin Control Panel.");
  const navigate = useNavigate();
  const location = useLocation();

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
  const [studentSortOrder, setStudentSortOrder] = useState("asc");
  const [availableCourses, setAvailableCourses] = useState([]);
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
    is_active: true,
    student_id: '',
    course_id: ''
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
    password: "",
    student_id: "",
    course_id: "",
    batch_id: ""
  });

  const [showFacultyForm, setShowFacultyForm] = useState(false);
  const [facultyFormErrors, setFacultyFormErrors] = useState({});
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchCourses();
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/batches/`);
      if (response.ok) {
        const data = await response.json();
        setBatches(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/courses/`);
      if (response.ok) {
        const data = await response.json();
        setAvailableCourses(data);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

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
      username: user.username || '',
      student_id: user.studentprofile?.student_id || '',
      course_id: user.studentprofile?.course?.id || ''
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
  }).sort((a, b) => {
    const idA = Number(a.studentprofile?.student_id) || 0;
    const idB = Number(b.studentprofile?.student_id) || 0;
    return studentSortOrder === "asc" ? idA - idB : idB - idA;
  });

  const showMessage = (type, text) => {
    if (type === 'success') {
      toast.success(text);
    } else if (type === 'error') {
      toast.error(text);
    } else {
      toast.info(text);
    }
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

  const handleDatabaseBackup = async () => {
    try {
      const hostname = window.location.hostname;
      const response = await makeAuthenticatedRequest(`http://${hostname}:8000/api/admin/backup-db/`);
      
      if (response && response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const disposition = response.headers.get('content-disposition');
        let filename = `db_backup_${new Date().toISOString().split('T')[0]}.sql`;
        if (disposition && disposition.indexOf('attachment') !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) { 
            filename = matches[1].replace(/['"]/g, '');
          }
        }
        
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        showMessage('success', "Database backup downloaded successfully!");
      } else {
        const errData = await response.json().catch(() => ({}));
        showMessage('error', errData.error || "Failed to download backup");
      }
    } catch (error) {
      console.error("Backup error:", error);
      showMessage('error', "Network error or failure during backup");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-700 font-semibold">Loading user data...</p>
          <p className="text-gray-400 text-sm mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage faculty credentials and student accounts</p>
        </div>
        <button
          onClick={handleDatabaseBackup}
          aria-label="Download database backup"
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-emerald-100 transition-all duration-200 text-sm whitespace-nowrap"
        >
          <Download size={16} />
          Backup Database
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border-l-4 border-l-purple-500 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Total Faculty</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.totalFaculty}</p>
              <p className="text-xs text-purple-600 mt-1 font-medium">{stats.activeFaculty} active</p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-2.5 sm:p-3">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border-l-4 border-l-blue-500 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Total Students</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
              <p className="text-xs text-blue-600 mt-1 font-medium">{stats.activeStudents} active</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-2.5 sm:p-3">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border-l-4 border-l-red-500 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Blocked</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.blockedStudents}</p>
              <p className="text-xs text-red-500 mt-1 font-medium">Need attention</p>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-2.5 sm:p-3">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border-l-4 border-l-emerald-500 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Placed</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.placedStudents}</p>
              <p className="text-xs text-emerald-600 mt-1 font-medium">Successfully placed</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl p-2.5 sm:p-3">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-fit shadow-sm border border-slate-200/50">
        <button
          onClick={() => setActiveTab("faculty")}
          aria-label="Switch to Faculty Management tab"
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "faculty"
              ? "bg-white text-blue-600 shadow-md ring-1 ring-slate-100"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Faculty
        </button>
        <button
          onClick={() => setActiveTab("students")}
          aria-label="Switch to Student Management tab"
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "students"
              ? "bg-white text-blue-600 shadow-md ring-1 ring-slate-100"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Students
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'faculty' ? 'faculty' : 'students'} by name, email${activeTab === 'students' ? ', or ID' : ''}…`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              {activeTab === 'students' && <option value="placed">Placed</option>}
            </select>
            <button
              onClick={fetchUsers}
              aria-label="Refresh user list"
              className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600 transition-colors"
            >
              <RefreshCw size={15} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Faculty Management Tab */}
      {activeTab === "faculty" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Faculty Accounts</h2>
              <p className="text-xs text-gray-500 mt-0.5">{filteredFaculty.length} record{filteredFaculty.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => setShowFacultyForm(true)}
              aria-label="Create new faculty account"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition-colors"
            >
              + Create Faculty
            </button>
          </div>

          {showFacultyForm && (
            <div className="m-4 p-4 sm:p-5 border border-blue-100 rounded-xl bg-blue-50">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">+</span>
                Create New Faculty Account
              </h3>
              <form onSubmit={createFaculty} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Username</label>
                  <input
                    type="text"
                    placeholder="e.g. faculty_john"
                    value={facultyForm.username}
                    onChange={(e) => setFacultyForm({ ...facultyForm, username: e.target.value })}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 ${facultyFormErrors.username ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
                    required
                  />
                  {facultyFormErrors.username && <p className="text-red-500 text-xs">{facultyFormErrors.username}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    placeholder="faculty@sssit.com"
                    value={facultyForm.email}
                    onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 ${facultyFormErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
                    required
                  />
                  {facultyFormErrors.email && <p className="text-red-500 text-xs">{facultyFormErrors.email}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">First Name</label>
                  <input
                    type="text"
                    placeholder="First name"
                    value={facultyForm.first_name}
                    onChange={(e) => setFacultyForm({ ...facultyForm, first_name: e.target.value })}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 ${facultyFormErrors.first_name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
                    required
                  />
                  {facultyFormErrors.first_name && <p className="text-red-500 text-xs">{facultyFormErrors.first_name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Last Name</label>
                  <input
                    type="text"
                    placeholder="Last name"
                    value={facultyForm.last_name}
                    onChange={(e) => setFacultyForm({ ...facultyForm, last_name: e.target.value })}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 ${facultyFormErrors.last_name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
                    required
                  />
                  {facultyFormErrors.last_name && <p className="text-red-500 text-xs">{facultyFormErrors.last_name}</p>}
                </div>
                <div className="space-y-1 relative">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={facultyForm.password}
                    onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 pr-10 ${facultyFormErrors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  {facultyFormErrors.password && <p className="text-red-500 text-xs">{facultyFormErrors.password}</p>}
                </div>
                <div className="flex items-end gap-2 sm:col-span-1">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                    Create Faculty
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowFacultyForm(false); setFacultyFormErrors({}); }}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                {facultyFormErrors.submit && <p className="text-red-500 text-sm sm:col-span-2">{facultyFormErrors.submit}</p>}
              </form>
            </div>
          )}

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Username</th>
                  <th className="px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Name</th>
                  <th className="px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Email</th>
                  <th className="px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredFaculty.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-12 text-center text-gray-400">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="font-medium">{searchTerm || filterStatus !== 'all' ? 'No faculty match your search' : 'No faculty accounts yet'}</p>
                    </td>
                  </tr>
                ) : (
                  filteredFaculty.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-gray-800">{u.username}</td>
                      <td className="px-5 py-3.5 text-gray-700">{u.first_name} {u.last_name}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          u.is_active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-red-50 text-red-600 ring-1 ring-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${u.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => startEditUser(u)} aria-label="Edit faculty" className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                            <Edit size={15} />
                          </button>
                          <button onClick={() => toggleUserStatus(u)} aria-label={u.is_active ? 'Block faculty' : 'Unblock faculty'} className={`p-1.5 rounded-lg transition-colors ${u.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`} title={u.is_active ? 'Block' : 'Unblock'}>
                            {u.is_active ? <UserX size={15} /> : <UserCheck size={15} />}
                          </button>
                          <button onClick={() => deleteUser(u.id)} aria-label="Delete faculty" className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="block sm:hidden divide-y divide-gray-100">
            {filteredFaculty.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">{searchTerm || filterStatus !== 'all' ? 'No faculty match your search' : 'No faculty accounts yet'}</p>
              </div>
            ) : (
              filteredFaculty.map((u) => (
                <div key={u.id} className="p-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {u.first_name?.[0]}{u.last_name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{u.first_name} {u.last_name}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                      }`}>{u.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => startEditUser(u)} aria-label="Edit" className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"><Edit size={15} /></button>
                    <button onClick={() => toggleUserStatus(u)} aria-label={u.is_active ? 'Block' : 'Unblock'} className={`p-2 rounded-lg ${u.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>{u.is_active ? <UserX size={15} /> : <UserCheck size={15} />}</button>
                    <button onClick={() => deleteUser(u.id)} aria-label="Delete" className="p-2 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Student Management Tab */}
      {activeTab === "students" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-5 border-b border-gray-100">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Student Accounts</h2>
              <p className="text-xs text-gray-500 mt-0.5">{filteredStudents.length} record{filteredStudents.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setFacultyForm({ username: "", email: "", first_name: "", last_name: "", password: "", student_id: "", course_id: "", batch_id: "" });
                  setShowFacultyForm(true);
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition-colors"
              >
                + Create Student
              </button>
            </div>
          </div>

          {showFacultyForm && activeTab === 'students' && (
            <div className="m-4 p-4 sm:p-5 border border-blue-100 rounded-xl bg-blue-50">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">+</span>
                Create New Student Account
              </h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  if (!facultyForm.username?.trim()) { showMessage('error', 'Username is required'); return; }
                  if (!facultyForm.email?.trim()) { showMessage('error', 'Email is required'); return; }
                  if (!facultyForm.password?.trim()) { showMessage('error', 'Password is required'); return; }
                  if (!facultyForm.first_name?.trim()) { showMessage('error', 'First name is required'); return; }
                  if (!facultyForm.last_name?.trim()) { showMessage('error', 'Last name is required'); return; }
                  if (!facultyForm.course_id || facultyForm.course_id === '') { showMessage('error', 'Please select a course'); return; }

                  const response = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/create-student/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...facultyForm, role: 'student' })
                  });
                  const data = await response.json();
                  if (response.ok) {
                    setShowFacultyForm(false);
                    setFacultyForm({ username: "", email: "", first_name: "", last_name: "", password: "", student_id: "", course_id: "", batch_id: "" });
                    fetchUsers();
                    showMessage('success', 'Student created successfully!');
                  } else {
                    showMessage('error', data.error || 'Failed to create student');
                  }
                } catch (err) {
                  console.error("Student creation error:", err);
                  showMessage('error', 'Network error or invalid response');
                }
              }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Username"
                  value={facultyForm.username}
                  onChange={(e) => setFacultyForm({ ...facultyForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Student ID (Number)"
                  value={facultyForm.student_id || ''}
                  onChange={(e) => setFacultyForm({ ...facultyForm, student_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={facultyForm.email}
                  onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="First Name"
                  value={facultyForm.first_name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={facultyForm.last_name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={facultyForm.password}
                  onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
                <select
                  value={facultyForm.course_id || ''}
                  onChange={(e) => setFacultyForm({ ...facultyForm, course_id: e.target.value, batch_id: "" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
                  required
                >
                  <option value="">Select Course</option>
                  {availableCourses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
                <select
                  value={facultyForm.batch_id || ''}
                  onChange={(e) => setFacultyForm({ ...facultyForm, batch_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
                >
                  <option value="">Select Batch (Optional)</option>
                  {batches
                    .filter(b => b.course_id === parseInt(facultyForm.course_id))
                    .map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))
                  }
                </select>
                <div className="flex gap-2 sm:col-span-1">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                    Create Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFacultyForm(false)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th 
                    className="px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide cursor-pointer hover:bg-gray-100 select-none transition-colors"
                    onClick={() => setStudentSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                  >
                    <div className="flex items-center gap-1.5">
                      Student ID
                      {studentSortOrder === "asc" ? (
                        <ChevronUp size={14} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={14} className="text-gray-500" />
                      )}
                    </div>
                  </th>
                  <th className="px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Name</th>
                  <th className="px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Email</th>
                  <th className="px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Course</th>
                  <th className="px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-gray-400">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="font-medium">{searchTerm || filterStatus !== 'all' ? 'No students match your search' : 'No student accounts yet'}</p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-gray-800">{s.studentprofile?.student_id || `STU${s.id}`}</td>
                      <td className="px-5 py-3.5 text-gray-700 font-medium">{s.first_name} {s.last_name}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">{s.email}</td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs">{s.studentprofile?.course?.title || 'Not assigned'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          s.is_active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-red-50 text-red-600 ring-1 ring-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${s.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          {s.is_active ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => startEditUser(s)} aria-label="Edit student" className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                            <Edit size={15} />
                          </button>
                          <button onClick={() => toggleUserStatus(s)} aria-label={s.is_active ? 'Block student' : 'Unblock student'} className={`p-1.5 rounded-lg transition-colors ${s.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`} title={s.is_active ? 'Block' : 'Unblock'}>
                            {s.is_active ? <UserX size={15} /> : <UserCheck size={15} />}
                          </button>
                          <button onClick={() => deleteUser(s.id)} aria-label="Delete student" className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="block sm:hidden divide-y divide-gray-100">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">{searchTerm || filterStatus !== 'all' ? 'No students match your search' : 'No student accounts yet'}</p>
              </div>
            ) : (
              filteredStudents.map((s) => (
                <div key={s.id} className="p-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {s.first_name?.[0]}{s.last_name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{s.first_name} {s.last_name}</p>
                      <p className="text-xs text-gray-500 truncate">{s.email}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{s.studentprofile?.course?.title || 'No course'}</p>
                      <div className="flex gap-1.5 mt-1 items-center">
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">ID: {s.studentprofile?.student_id || s.id}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                        }`}>{s.is_active ? 'Active' : 'Blocked'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => startEditUser(s)} aria-label="Edit" className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"><Edit size={15} /></button>
                    <button onClick={() => toggleUserStatus(s)} aria-label={s.is_active ? 'Block' : 'Unblock'} className={`p-2 rounded-lg ${s.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>{s.is_active ? <UserX size={15} /> : <UserCheck size={15} />}</button>
                    <button onClick={() => deleteUser(s.id)} aria-label="Delete" className="p-2 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-bold">Edit {editUser?.role?.charAt(0).toUpperCase() + editUser?.role?.slice(1)} Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">First Name</label>
                  <input
                    type="text"
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Last Name</label>
                  <input
                    type="text"
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Username / Login ID</label>
                  <input
                    type="text"
                    value={editFormData.username}
                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              {editUser?.role === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Student ID (Numeric)</label>
                    <input
                      type="text"
                      value={editFormData.student_id}
                      onChange={(e) => setEditFormData({ ...editFormData, student_id: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. 46732"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Enrolled Course</label>
                    <select
                      value={editFormData.course_id}
                      onChange={(e) => setEditFormData({ ...editFormData, course_id: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="">Select Course</option>
                      {availableCourses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">New Password (leave blank to keep current)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                <label htmlFor="edit_active" className="text-sm font-semibold text-gray-700 select-none">Account Active</label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-100 transition-colors"
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
