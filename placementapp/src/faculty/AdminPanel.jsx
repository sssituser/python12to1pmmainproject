import { useState, useEffect } from "react";

function AdminPanel() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Student management states
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState("");
  const [activeTab, setActiveTab] = useState("create"); // "create" or "manage"
  const [course, setCourse] = useState("");
  const [phone, setPhone] = useState("");
  const [availableCourses, setAvailableCourses] = useState([]);

  // Fetch available courses for dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:8000/api/courses/`);
        if (res.ok) {
          const data = await res.json();
          setAvailableCourses(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
      }
    };
    fetchCourses();
  }, []);

  // Fetch students for management
  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      setStudentsError("");
      
      const token = localStorage.getItem("access");
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`http://${window.location.hostname}:8000/api/students/`, {
        method: "GET",
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        setStudentsError("Failed to fetch students");
      }
    } catch (err) {
      setStudentsError("Error fetching students");
    } finally {
      setStudentsLoading(false);
    }
  };

  // Toggle student active status
  const toggleStudentStatus = async (studentId, currentStatus) => {
    try {
      const token = localStorage.getItem("access");
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`http://${window.location.hostname}:8000/api/students/${studentId}/toggle-status/`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        setMessage(`Student ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchStudents(); // Refresh the list
      } else {
        setError("Failed to update student status");
      }
    } catch (err) {
      setError("Error updating student status");
    }
  };

  useEffect(() => {
    if (activeTab === "manage") {
      fetchStudents();
    }
  }, [activeTab]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const token = localStorage.getItem("access");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`http://${window.location.hostname}:8000/api/admin/create-credentials/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ username, email, password, role, course, phone }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || data.detail || "Unable to create user.");
      } else {
        setMessage(data.message || "User created successfully");
        setUsername("");
        setEmail("");
        setPassword("");
        setRole("student");
        setCourse("");
        setPhone("");
      }
    } catch (err) {
      setError("Server error while creating credentials.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-400 mt-2">
            Create new credentials and manage student accounts.
          </p>
        </div>

        {message && <div className="rounded-lg bg-emerald-500/20 border border-emerald-400 p-4 text-emerald-100">{message}</div>}
        {error && <div className="rounded-lg bg-rose-500/20 border border-rose-400 p-4 text-rose-100">{error}</div>}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-[#0f172a] border border-white/10 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === "create"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Create Credentials
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === "manage"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Manage Students
          </button>
        </div>

        {/* Create Credentials Tab */}
        {activeTab === "create" && (
          <form onSubmit={handleSubmit} className="space-y-4 bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#020617] p-3 text-white focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#020617] p-3 text-white focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#020617] p-3 text-white focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#020617] p-3 text-white focus:border-indigo-500 outline-none"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {role === "student" && (
              <>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Student Course</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#020617] p-3 text-white focus:border-indigo-500 outline-none"
                    required
                  >
                    <option value="">-- Select Course --</option>
                    {availableCourses.length > 0 ? (
                      availableCourses.map((c) => (
                        <option key={c.id} value={c.title}>{c.title}</option>
                      ))
                    ) : (
                      <>
                        <option value="Python Full Stack">Python Full Stack</option>
                        <option value="Java Full Stack">Java Full Stack</option>
                        <option value="Web Development">Web Development</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Mobile Number (Optional)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#020617] p-3 text-white focus:border-indigo-500 outline-none"
                    placeholder="e.g., 9876543210"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-white font-semibold hover:bg-indigo-500 transition disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Credential"}
            </button>
          </form>
        )}

        {/* Manage Students Tab */}
        {activeTab === "manage" && (
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Student Management</h2>
            
            {studentsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <p className="mt-2 text-gray-400">Loading students...</p>
              </div>
            ) : studentsError ? (
              <div className="text-center py-8">
                <p className="text-red-400">{studentsError}</p>
                <button
                  onClick={fetchStudents}
                  className="mt-2 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="pb-3 text-sm font-medium text-gray-400">Student ID</th>
                      <th className="pb-3 text-sm font-medium text-gray-400">Name</th>
                      <th className="pb-3 text-sm font-medium text-gray-400">Course</th>
                      <th className="pb-3 text-sm font-medium text-gray-400">Email</th>
                      <th className="pb-3 text-sm font-medium text-gray-400">Status</th>
                      <th className="pb-3 text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b border-white/5">
                        <td className="py-3 text-sm">{student.student_id || student.id}</td>
                        <td className="py-3 text-sm">{student.name || student.username}</td>
                        <td className="py-3 text-sm text-indigo-400">{student.course_title || "Not assigned"}</td>
                        <td className="py-3 text-sm text-gray-400">{student.email}</td>
                        <td className="py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            student.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => toggleStudentStatus(student.id, student.is_active)}
                            className={`px-3 py-1 rounded text-xs font-medium transition ${
                              student.is_active
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {student.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {students.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No students found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
