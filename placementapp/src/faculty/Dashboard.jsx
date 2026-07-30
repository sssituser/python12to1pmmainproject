import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import { useSEO } from "../utils/useSEO";
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
  useSEO("Faculty Dashboard", "Faculty dashboard for managing student assessments, job drives, courses, analytics, and placement tracking at SSSIT.");
  const navigate = useNavigate();
  
  const handleExportAllPerformance = async () => {
    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/exam-reports/`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      const json = await res.json();
      const reports = json.data || [];
      
      if (reports.length === 0) {
        alert("No performance reports found.");
        return;
      }
      
      const dataToExport = reports.map(r => ({
        "Student Name": r.user?.username || "Unknown",
        "Registration Number": r.user?.randomId || "N/A",
        "Email": r.user?.email || "N/A",
        "Course": r.course || "Not Assigned",
        "Exam Title": r.examTitle || "N/A",
        "Exam Type": r.examType || "N/A",
        "Score Obtained": r.score ?? 0,
        "Total Marks": r.totalMarks ?? 0,
        "Percentage (%)": `${r.percentage ?? 0}%`,
        "Status": r.status || "N/A",
        "Exam Date": r.examDate ? new Date(r.examDate).toLocaleDateString() : "N/A"
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "All Performance");
      XLSX.writeFile(workbook, `All_Students_Performance_Report.xlsx`);
    } catch (e) {
      console.error(e);
      alert("Failed to export all performance reports.");
    }
  };
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

  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(true);

  const getBatches = async () => {
    try {
      setBatchesLoading(true);
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/batches/`);
      if (res.ok) {
        const json = await res.json();
        const batchList = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : (json?.results || []));
        setBatches(batchList);
      } else {
        setBatches([]);
      }
    } catch (e) {
      console.error("Failed fetching dynamic batches:", e);
      setBatches([]);
    } finally {
      setBatchesLoading(false);
    }
  };

  useEffect(() => {
    getExamReports();
    getStudents();
    getBatches();

    // Auto-refresh data every 10 seconds
    const interval = setInterval(() => {
      getExamReports();
      getStudents(false);
      getBatches();
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
                username: userObj.username || student.username || student.studentName || student.name || 'Unknown',
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
                username: userObj.username || student.username || student.studentName || student.name || "Unknown",
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
      let fetchedCoursesCount = 0;
      let fetchedJobsCount = 0;

      // 1. Dynamic Courses Fetch
      try {
        const cRes = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/courses/`);
        if (cRes.ok) {
          const cData = await cRes.json();
          const cList = Array.isArray(cData) ? cData : (cData.results || cData.data || []);
          fetchedCoursesCount = cList.length;
        }
      } catch (e) {
        console.log("Dynamic courses fetch error", e);
      }

      // 2. Dynamic Jobs Fetch
      try {
        const jRes = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/admin/jobs/`);
        if (jRes.ok) {
          const jData = await jRes.json();
          const jList = Array.isArray(jData) ? jData : (jData.results || jData.data || []);
          fetchedJobsCount = jList.length;
        }
      } catch (e) {
        console.log("Dynamic jobs fetch error", e);
      }

      // 3. Fallback/Primary dashboard-stats endpoint
      let apiStats = {};
      try {
        const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/dashboard-stats/`);
        if (res.ok) {
          apiStats = await res.json();
        }
      } catch (error) {
        console.log("Dashboard stats endpoint error", error);
      }

      setStats({
        total_students: students.length > 0 ? students.length : (apiStats.total_students || 0),
        active_students: students.length > 0 ? students.filter(s => s.is_active).length : (apiStats.active_students || 0),
        total_courses: fetchedCoursesCount || apiStats.total_courses || 0,
        total_jobs: fetchedJobsCount || apiStats.total_jobs || 0
      });

    } catch (err) {
      console.log("Error computing stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const getExamReports = async () => {
    try {
      const token = localStorage.getItem("access");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      // Allow faculty, admin, and staff to see all reports
      const isFacultyOrAdmin = token && (
        user.role === "faculty" || 
        user.role === "admin" || 
        user.is_staff === true ||
        user.isSuperuser === true
      );
      
      if (!token) {
        setExamReports([]);
        return;
      }

      // Try primary endpoint: all-exam-results (uses user_combined_results_api)
      try {
        const res = await makeAuthenticatedRequest(
          `http://${window.location.hostname}:8000/api/all-exam-results/`
        );

        if (res.ok) {
          const data = await res.json();
          const examData = Array.isArray(data) ? data : (data.data || []);
          setExamReports(examData);
          return;
        }
      } catch (error) {
        console.log("all-exam-results endpoint failed, trying fallback...");
      }

      // Fallback: try exam-reports endpoint
      try {
        const res2 = await makeAuthenticatedRequest(
          `http://${window.location.hostname}:8000/api/exam-reports/`
        );
        if (res2.ok) {
          const data2 = await res2.json();
          const examData2 = Array.isArray(data2) ? data2 : (data2.data || []);
          setExamReports(examData2);
          return;
        }
      } catch (error) {
        console.log("exam-reports fallback also failed");
      }

      // Set default exam reports if all API calls fail
      setExamReports([]);
    } catch (err) {
      console.log("Error fetching exam reports:", err);
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
      <div className="mb-6">
        <h4 className="text-2xl font-bold text-gray-800 m-0">Faculty Dashboard</h4>
        <p className="text-sm text-gray-500 mt-1">Overview of student performance, assigned batches, and campus recruitment drives.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.total_students || 0}</p>
            </div>
            <div className="bg-blue-100 rounded-xl p-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Assigned Batches Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm p-5 border border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-600 mb-1 uppercase tracking-wider">Assigned Batches</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-extrabold text-indigo-950">{batchesLoading ? "..." : (Array.isArray(batches) ? batches.length : 0)}</p>
                <span className="text-xs font-semibold text-indigo-600">Active</span>
              </div>
            </div>
            <div className="bg-indigo-600 rounded-xl p-3 text-white shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Total Courses</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.total_courses || 0}</p>
            </div>
            <div className="bg-green-100 rounded-xl p-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.total_jobs || 0}</p>
            </div>
            <div className="bg-purple-100 rounded-xl p-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Active Students</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.active_students || 0}</p>
            </div>
            <div className="bg-orange-100 rounded-xl p-3">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC BATCHES GRID SECTION */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h6 className="text-lg font-bold text-gray-900 m-0">My Dynamic Batches Grid</h6>
            <p className="text-xs text-gray-500 mt-0.5">Live view of current active and upcoming student batches</p>
          </div>
          <button
            onClick={() => navigate("/faculty/batches")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Manage All Batches</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {batchesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-slate-100 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : !Array.isArray(batches) || batches.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <svg className="w-10 h-10 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm font-semibold text-slate-700">No Batches Assigned Yet</p>
            <p className="text-xs text-slate-500 mt-1">Check back once administrator assigns course batches to your profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.slice(0, 6).map((batch) => (
              <div
                key={batch.id || batch.code}
                onClick={() => navigate("/faculty/batches")}
                className="bg-slate-50 hover:bg-indigo-50/50 p-5 rounded-xl border border-slate-200/80 hover:border-indigo-200 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-700 mb-1">
                      {batch.code || "BATCH"}
                    </span>
                    <h5 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {batch.name || "Batch Group"}
                    </h5>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    (batch.status || "").toLowerCase() === "ongoing" || (batch.status || "").toLowerCase() === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {batch.status || "Ongoing"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{batch.timing || "Morning Batch (10:00 AM - 12:00 PM)"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Capacity: {batch.student_count || batch.max_students || 30} Students</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Placement Overview Banner Button */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl shadow-lg p-6 md:p-8 border border-blue-500/20 text-white mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Recruitment Analytics
            </div>
            <h5 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Placement Overview & Student Statistics
            </h5>
            <p className="text-blue-100 text-sm leading-relaxed">
              Access comprehensive placement metrics, view placed vs seeking candidates, export reports, and analyze company drive details.
            </p>
          </div>

          <button
            onClick={() => navigate("/faculty/placement-stats")}
            className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-blue-700 font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shrink-0 cursor-pointer"
          >
            <span>View Placement Stats</span>
            <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
      {/* Student Reports Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h6 className="text-lg font-semibold text-gray-800 m-0">Student Reports</h6>
            <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
              <div className="relative flex-grow max-w-md w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <form onSubmit={(e) => e.preventDefault()} className="m-0">
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
              <button
                onClick={handleExportAllPerformance}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest shadow-md transition-all flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download All Performance
              </button>
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
                                onClick={() => navigate(`/faculty/student-report/${student.username || student.studentName}`)}
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

      {/* Recent Exam Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h6 className="text-lg font-semibold text-gray-800">Recent Exam Submissions</h6>
              <p className="text-xs text-gray-400 mt-0.5">Live data — auto-refreshes every 10 seconds</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-100">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                {examReports.length} Total Records
              </span>
              <button
                onClick={getExamReports}
                className="bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 transition-all flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {examReports.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-14 h-14 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-semibold text-gray-500">No exam submissions found</p>
              <p className="text-xs text-gray-400 mt-1">Submissions will appear here once students complete their exams</p>
              <button onClick={getExamReports} className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-semibold underline">
                Click to Refresh
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider">Student</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider">Exam Title</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider">Type</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider">Score</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider">%</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider">Result</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {examReports.slice(0, 10).map((report, index) => {
                    const examType = (report.examType || report.exam_type || 'daily').toLowerCase();
                    const typeColor = examType === 'weekly' ? 'bg-emerald-100 text-emerald-700' : examType === 'monthly' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
                    const score = report.score ?? report.marks_obtained ?? 0;
                    const total = report.totalMarks ?? report.total_marks ?? 0;
                    const pct = total > 0 ? Math.round((score / total) * 100) : (report.percentage ?? 0);
                    const status = (report.status || '').toLowerCase();
                    const isPassed = status === 'pass' || status === 'passed';
                    const isCheated = status === 'cheated' || status.includes('cheat');
                    const examDate = report.examDate || report.exam_date;
                    return (
                      <tr key={index} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                              {(report.user?.username || 'S')[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-gray-800">{report.user?.username || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 max-w-[180px] truncate font-medium">
                          {report.examTitle || report.exam_title || `Exam ${index + 1}`}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${typeColor}`}>
                            {examType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono text-sm font-bold text-gray-800">{score}<span className="text-gray-400 font-normal">/{total}</span></span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-sm font-black ${pct >= 50 ? 'text-emerald-600' : 'text-rose-500'}`}>{pct}%</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isCheated ? 'bg-orange-100 text-orange-700' : isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {isCheated ? 'CHEATED' : isPassed ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-xs text-gray-400 font-medium">
                          {examDate ? new Date(examDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {examReports.length > 10 && (
                <div className="px-4 py-3 border-t border-gray-50 text-center">
                  <p className="text-xs text-gray-400 font-medium">Showing 10 most recent of <span className="font-black text-gray-600">{examReports.length}</span> total submissions. Download Excel for full report.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
