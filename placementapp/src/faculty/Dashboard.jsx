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
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_students: 2,
    total_courses: 1,
    total_jobs: 3,
    active_students: 2
  });
  const [examReports, setExamReports] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Fail");
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    getStats();
  }, [students]);

  useEffect(() => {
    getExamReports();
    getStudents();

    // Auto-refresh data every 10 seconds
    const interval = setInterval(() => {
      getExamReports();
      getStudents(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const refreshAccessToken = async () => {
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
      window.location.href = "/faculty/login";
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

  const getStudents = async (showLoading = true) => {
    try {
      if (showLoading) setStudentsLoading(true);
      setStudentsError(null);
      
      const token = localStorage.getItem("access");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (token && user.role === "faculty") {
        let allStudentData = [];
        let success = false;

        // Try students endpoint
        try {
          const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/students/`);
          if (res.ok) {
            const data = await res.json();
            console.log("Students data from API:", data);
            
            // Transform real student data to match table structure
            const studentsArray = Array.isArray(data) ? data : (data.students || []);
            const transformedStudents = studentsArray.map((student, index) => {
              const userObj = student.user || {};
              return {
                sno: index + 1,
                // Robust fallbacks for ID, Name, and Mobile
                studentId: student.studentId || student.student_id || student.id || userObj.studentId || userObj.id || "--",
                studentName: student.studentName || student.name || userObj.name || userObj.username || student.username || 'Unknown',
                mobileNo: student.mobileNo || student.phone || student.mobile || userObj.phone || userObj.mobile || "--",
                courseType: student.course_title || student.course?.title || student.course_type || 'Not assigned',
                status: student.is_active !== undefined ? (student.is_active ? 'Active' : 'Inactive') : 
                        student.status === 'inactive' ? 'Inactive' : 
                        student.status === 'pending' ? 'Pending' : 'Active',
                is_active: student.is_active !== undefined ? student.is_active : student.status !== 'Inactive',
                email: student.email || student.user?.email || userObj.email || '',
                id: student.id || index + 1
              };
            });
            
            setStudents(transformedStudents);
            return;
          } else if (res.status === 401) {
            console.log("Unauthorized access - clearing invalid token");
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
          } else if (res.status === 404) {
            console.log("Students endpoint not found, trying student-stats");
            allStudentData = await res.json();
            success = true;
          }
        } catch (e) { console.log("api/students/ failed"); }

        // If above failed, try student-stats endpoint
        if (!success) {
          try {
            const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/student-stats/`);
            if (res.ok) {
              allStudentData = await res.json();
              success = true;
            }
          } catch (e) { console.log("api/student-stats/ failed"); }
        }

        // If we have data from any endpoint, process it
        if (success && Array.isArray(allStudentData)) {
          const transformedStudents = allStudentData
            .filter(s => {
              const role = (s.role || s.user?.role || "").toLowerCase();
              return role === 'student' || (!role && s.is_staff === false);
            })
            .map((student, index) => {
              const userObj = student.user || {};
              // Robust fallbacks for ID, Name, and Mobile
              const name = student.studentName || student.name || userObj.name || userObj.username || student.username || "Unknown";
              const studentId = student.studentId || student.student_id || student.id || userObj.studentId || userObj.id || "--";
              const mobileNo = student.mobileNo || student.phone || student.mobile || userObj.phone || userObj.mobile || "--";
              
              return {
                sno: index + 1,
                studentId: studentId,
                studentName: name,
                mobileNo: mobileNo,
                courseType: student.courseType || student.course_title || student.course_type || "Not assigned",
                status: student.status || (student.is_active ? 'Active' : 'Inactive'),
                is_active: student.is_active !== undefined ? student.is_active : student.status !== 'Inactive',
                email: student.email || userObj.email || '',
                id: student.id || index + 1
              };
            });

          setStudents(transformedStudents);
          
          // SYNC TOP CARDS immediately
          setStats(prev => ({
            ...prev,
            total_students: transformedStudents.length,
            active_students: transformedStudents.filter(s => s.is_active).length,
          }));
          return;
        }
      }

      setStudents([]);
      setStudentsError("Student Data Not Available");
    } catch (err) {
      console.log("Error fetching students:", err);
      if (showLoading) setStudentsError("Failed to load student data");
      setStudents([]);
    } finally {
      if (showLoading) setStudentsLoading(false);
    }
  };

  const getStats = async () => {
    try {
      const token = localStorage.getItem("access");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (token && user.role === "faculty") {
        try {
          const res = await fetch(`http://${window.location.hostname}:8000/api/dashboard-stats/`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const data = await res.json();
            // FORCIBLY OVERRIDE with current students list to ensure logic consistency
            setStats({
              ...data,
              // Only override students count if we have them, otherwise trust backend
              total_students: (students.length > 0) ? students.length : (data.total_students || 0),
              active_students: (students.length > 0) ? students.filter(s => s.is_active).length : (data.active_students || 0),
            });
            setLoading(false);
            return;
          }
        } catch (error) { console.log("Dashboard stats failed"); }
      }

      // Set default stats if API calls fail
      setStats({
        total_students: 0,
        total_courses: 0,
        total_jobs: 0,
        active_students: 0
      });
    } catch (err) {
      console.log("Error fetching stats:", err);
      // Set default stats on error
      setStats({
        total_students: 0,
        total_courses: 0,
        total_jobs: 0,
        active_students: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getExamReports = async () => {
    try {
      const token = localStorage.getItem("access");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      // For faculty users, use existing all-exam-results endpoint
      if (token && user.role === "faculty") {
        try {
          const res = await fetch(`http://${window.location.hostname}:8000/api/all-exam-results/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            // Ensure data is an array
            const examData = Array.isArray(data) ? data : (data.data || []);
            setExamReports(examData);
            return;
          } else if (res.status === 401) {
            console.log("Unauthorized - clearing invalid token");
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
          }
        } catch (error) {
          console.log("All exam results endpoint failed");
        }
      }

      // Set default exam reports if API calls fail
      setExamReports([]);
    } catch (err) {
      console.log("Error fetching exam reports:", err);
      // Set default exam reports on error
      setExamReports([]);
    }
  };

  if (loading) return <p className="p-3">Loading dashboard...</p>;
  const filteredStudents = students.filter((student) => {
    const term = (searchTerm || "").toLowerCase();
    return (
      (String(student?.studentName || "").toLowerCase()).includes(term) ||
      (String(student?.studentId || "").toLowerCase()).includes(term) ||
      (String(student?.mobileNo || "").toLowerCase()).includes(term) ||
      (String(student?.courseType || "").toLowerCase()).includes(term)
    );
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h4 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h4>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.total_students || 0}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Courses</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.total_courses || 0}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.total_jobs || 0}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Students</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.active_students || 0}</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      {/* Chart Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
        <h6 className="text-lg font-semibold text-gray-800 mb-6">Placement Overview</h6>

        <div className="h-[300px] w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: "Total Students", value: stats?.total_students || 0, fill: "#3B82F6" },
                { name: "Placed Students", value: stats?.placed_students || 0, fill: "#10B981" },
                { name: "Active Jobs", value: stats?.total_jobs || 0, fill: "#8B5CF6" },
                { name: "Pending Reviews", value: stats?.pending_reviews || 0, fill: "#F59E0B" },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
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
              <Bar 
                dataKey="value" 
                radius={[8, 8, 0, 0]}
                fill="#3B82F6"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Student Reports Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h6 className="text-lg font-semibold text-gray-800">Student Reports</h6>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <form onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="text"
                    placeholder="Search students by name, ID, phone or course..."
                    className="block w-full pl-10 pr-3 py-2 border border-blue-100/50 rounded-xl bg-blue-50/30 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium py-2.5"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </form>
              </div>
            </div>
          </div>
          
          {studentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading student data...</span>
            </div>
          ) : studentsError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600">{studentsError}</p>
                <button
                  onClick={getStudents}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-white">S.NO</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-white">Student ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-white">Student name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-white">Mobile no</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-white">Course type</th>
                      {/* <th className="text-center py-3 px-4 text-sm font-semibold text-white">Status</th> */}
                      <th className="text-center py-3 px-4 text-sm font-semibold text-white">Reports</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-600">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p>{searchTerm ? "No matching students found" : "Student Data Not Available"}</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedStudents.map((student) => (
                        <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-600">{student.sno}</td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-800">{student.studentId}</td>
                          <td className="py-3 px-4 text-sm text-gray-800">{student.studentName}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{student.mobileNo}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{student.courseType}</td>
                          <td className="text-center py-3 px-4">
                            <div className="flex items-center justify-center gap-3">
                              <button 
                                onClick={() => navigate(`/faculty/student-report/${student.studentName}`)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1 group"
                              >
                                <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                View Report
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredStudents.length > 0 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {Math.min((currentPage-1)*itemsPerPage + 1, filteredStudents.length)}-{Math.min(currentPage*itemsPerPage, filteredStudents.length)} of {filteredStudents.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                    currentPage === i + 1 
                                    ? "bg-blue-600 text-white" 
                                    : "border border-gray-300 hover:bg-gray-50 text-gray-600"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button 
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6">
          <h6 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h6>
          
          <div className="space-y-4">
            {examReports.slice(0, 5).map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 rounded-full p-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {report.exam_title || `Exam ${index + 1}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      Score: {report.score || 0}/{report.total_questions || 0}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {report.exam_date ? new Date(report.exam_date).toLocaleDateString() : 'Recent'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {report.user?.username || 'Student'}
                  </p>
                </div>
              </div>
            ))}
            
            {examReports.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No recent exam activities</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
