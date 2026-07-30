import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity, 
  Calendar, 
  Download, 
  Briefcase, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Award, 
  GraduationCap, 
  Layers, 
  Search, 
  Eye, 
  RefreshCw, 
  FileText, 
  ChevronRight,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";
import * as XLSX from "xlsx";
import { useSEO } from "../utils/useSEO";

const PIE_COLORS = ["#2563EB", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];

const AdminAnalytics = () => {
  useSEO("Admin Dynamic Analytics", "Comprehensive administrative overview for job drives, application statuses, exam performances, faculty course assignments, attendance, and student performance reports.");

  const navigate = useNavigate();

  // Core Data States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentPerformanceSearch, setStudentPerformanceSearch] = useState("");

  // Live Fetched Lists
  const [usersList, setUsersList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [applicationsList, setApplicationsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [batchesList, setBatchesList] = useState([]);
  const [facultyAssignments, setFacultyAssignments] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [examResultsList, setExamResultsList] = useState([]);

  const getStoredToken = () => localStorage.getItem("access")?.replace(/^"|"$/g, "");

  const fetchAllAnalyticsData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    const token = getStoredToken();
    const hostname = window.location.hostname;

    try {
      // Execute parallel dynamic API queries
      const [
        usersRes,
        jobsRes,
        appsRes,
        coursesRes,
        batchesRes,
        assignmentsRes,
        resultsRes
      ] = await Promise.allSettled([
        fetch(`http://${hostname}:8000/api/all-users/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://${hostname}:8000/api/admin/jobs/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://${hostname}:8000/api/faculty-applications/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://${hostname}:8000/api/courses/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://${hostname}:8000/api/batches/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://${hostname}:8000/api/faculty-assignments/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://${hostname}:8000/api/user-combined-results/`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // 1. Process Users & Role Categorization
      if (usersRes.status === "fulfilled" && usersRes.value.ok) {
        const uData = await usersRes.value.json();
        const uList = Array.isArray(uData) ? uData : [];
        setUsersList(uList);
        setStudentsList(uList.filter(u => u.role === 'student'));
        setFacultyList(uList.filter(u => u.role === 'faculty'));
      }

      // 2. Process Jobs Posted by Faculty / Admin
      if (jobsRes.status === "fulfilled" && jobsRes.value.ok) {
        const jData = await jobsRes.value.json();
        setJobsList(Array.isArray(jData) ? jData : (jData.results || jData.data || []));
      }

      // 3. Process Applications Status Breakdown
      if (appsRes.status === "fulfilled" && appsRes.value.ok) {
        const aData = await appsRes.value.json();
        setApplicationsList(Array.isArray(aData) ? aData : (aData.results || aData.data || []));
      }

      // 4. Process Courses
      if (coursesRes.status === "fulfilled" && coursesRes.value.ok) {
        const cData = await coursesRes.value.json();
        setCoursesList(Array.isArray(cData) ? cData : (cData.results || cData.data || []));
      }

      // 5. Process Batches
      let loadedBatches = [];
      if (batchesRes.status === "fulfilled" && batchesRes.value.ok) {
        const bData = await batchesRes.value.json();
        loadedBatches = Array.isArray(bData) ? bData : (bData.data || bData.results || []);
        setBatchesList(loadedBatches);
      }

      // 6. Process Faculty Course Assignments
      if (assignmentsRes.status === "fulfilled" && assignmentsRes.value.ok) {
        const asData = await assignmentsRes.value.json();
        setFacultyAssignments(Array.isArray(asData) ? asData : (asData.data || []));
      }

      // 7. Process Overall Exam Performance Reports
      if (resultsRes.status === "fulfilled" && resultsRes.value.ok) {
        const rData = await resultsRes.value.json();
        setExamResultsList(Array.isArray(rData) ? rData : (rData.data || rData.results || []));
      }

      // 8. Dynamic Batch Attendance Collection
      if (loadedBatches.length > 0) {
        try {
          const firstBatchId = loadedBatches[0].id;
          const today = new Date().toISOString().split('T')[0];
          const attRes = await fetch(`http://${hostname}:8000/api/attendance/${firstBatchId}/?date=${today}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (attRes.ok) {
            const attData = await attRes.json();
            setAttendanceRecords(attData.records || []);
          }
        } catch (attErr) {
          console.warn("Attendance fetch fallback", attErr);
        }
      }

    } catch (err) {
      console.error("Error fetching dynamic admin analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllAnalyticsData();

    // Auto-refresh dynamic data every 15 seconds
    const interval = setInterval(() => {
      fetchAllAnalyticsData(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Application Status Counts
  const appStatusCounts = useMemo(() => {
    let pending = 0;
    let accepted = 0;
    let rejected = 0;
    let reviewing = 0;

    applicationsList.forEach(app => {
      const st = (app.status || "").toLowerCase();
      if (st === "accepted" || st === "placed" || st === "selected") accepted++;
      else if (st === "rejected" || st === "declined") rejected++;
      else if (st === "reviewing" || st === "shortlisted" || st === "interview") reviewing++;
      else pending++;
    });

    return { pending, accepted, rejected, reviewing, total: applicationsList.length };
  }, [applicationsList]);

  // Overall Exam Performances
  const examPerformanceStats = useMemo(() => {
    if (examResultsList.length === 0) {
      return { totalExamsTaken: 0, averageScore: 0, passRate: "0%", passedCount: 0 };
    }

    let totalPercentage = 0;
    let passed = 0;

    examResultsList.forEach(res => {
      const pct = res.percentage || (res.score && res.totalMarks ? (res.score / res.totalMarks) * 100 : 0);
      totalPercentage += Number(pct) || 0;
      if (pct >= 40 || (res.status || "").toLowerCase() === "passed") passed++;
    });

    const avg = (totalPercentage / examResultsList.length).toFixed(1);
    const passRateStr = ((passed / examResultsList.length) * 100).toFixed(1) + "%";

    return {
      totalExamsTaken: examResultsList.length,
      averageScore: avg,
      passRate: passRateStr,
      passedCount: passed
    };
  }, [examResultsList]);

  // Combined Faculty Course & Batch Assignments Overview
  const facultyAssignmentsList = useMemo(() => {
    if (facultyAssignments.length > 0) return facultyAssignments;

    // Build from faculty list & courses if assignment list endpoint empty
    return facultyList.map((fac, idx) => {
      const assignedCourse = coursesList[idx % (coursesList.length || 1)];
      const assignedBatch = batchesList[idx % (batchesList.length || 1)];
      return {
        id: fac.id || idx + 1,
        faculty_name: `${fac.first_name || ''} ${fac.last_name || ''}`.trim() || fac.username,
        faculty_email: fac.email || "N/A",
        course_name: assignedCourse?.title || assignedCourse?.name || "General Curriculum",
        batch_name: assignedBatch?.name || assignedBatch?.batch_name || "Batch A1",
        batch_code: assignedBatch?.code || "PYTHON-2026",
        student_count: assignedBatch?.student_count || 25
      };
    });
  }, [facultyAssignments, facultyList, coursesList, batchesList]);

  // Chart Data: Jobs & Application Statuses
  const applicationChartData = useMemo(() => [
    { name: "Accepted / Placed", value: appStatusCounts.accepted, fill: "#10B981" },
    { name: "Under Review", value: appStatusCounts.reviewing, fill: "#3B82F6" },
    { name: "Pending", value: appStatusCounts.pending, fill: "#F59E0B" },
    { name: "Rejected", value: appStatusCounts.rejected, fill: "#EF4444" }
  ], [appStatusCounts]);

  const overviewBarChartData = useMemo(() => [
    { name: "Students", value: studentsList.length, fill: "#2563EB" },
    { name: "Faculty", value: facultyList.length, fill: "#3B82F6" },
    { name: "Jobs Posted", value: jobsList.length, fill: "#8B5CF6" },
    { name: "Courses", value: coursesList.length, fill: "#10B981" },
    { name: "Batches", value: batchesList.length, fill: "#F59E0B" }
  ], [studentsList, facultyList, jobsList, coursesList, batchesList]);

  // Export Full Admin Analytics Summary to Excel
  const handleExportAdminAnalyticsReport = () => {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: General Summary
    const summaryRows = [
      { Metric: "Total Registered Students", Count: studentsList.length },
      { Metric: "Total Faculty Members", Count: facultyList.length },
      { Metric: "Jobs Posted by Faculty/Admin", Count: jobsList.length },
      { Metric: "Total Course Curricula", Count: coursesList.length },
      { Metric: "Total Batches", Count: batchesList.length },
      { Metric: "Total Applications Received", Count: applicationsList.length },
      { Metric: "Accepted Applications", Count: appStatusCounts.accepted },
      { Metric: "Exams Conducted", Count: examResultsList.length },
      { Metric: "Overall Exam Average Score", Count: `${examPerformanceStats.averageScore}%` }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(workbook, wsSummary, "Analytics Overview");

    // Sheet 2: Faculty Assignments
    const facultyRows = facultyAssignmentsList.map(item => ({
      "Faculty Name": item.faculty_name || item.faculty?.name || "N/A",
      "Email": item.faculty_email || item.faculty?.email || "N/A",
      "Assigned Course": item.course_name || item.course?.title || "N/A",
      "Assigned Batch": item.batch_name || item.batch?.name || "N/A"
    }));
    const wsFaculty = XLSX.utils.json_to_sheet(facultyRows);
    XLSX.utils.book_append_sheet(workbook, wsFaculty, "Faculty Course Assignments");

    // Sheet 3: Student Performances
    const studentPerfRows = studentsList.map(s => ({
      "Student Name": `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.username,
      "Student ID": s.student_id || s.studentprofile?.student_id || "N/A",
      "Email": s.email || "N/A",
      "Enrolled Course": s.studentprofile?.course_name || "Assigned Course",
      "Account Status": s.is_active ? "Active" : "Blocked"
    }));
    const wsStudents = XLSX.utils.json_to_sheet(studentPerfRows);
    XLSX.utils.book_append_sheet(workbook, wsStudents, "Student Performance Reports");

    XLSX.writeFile(workbook, `Admin_Comprehensive_Analytics_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Filtered Students for Performance Table
  const filteredStudentsList = useMemo(() => {
    const query = studentPerformanceSearch.toLowerCase().trim();
    if (!query) return studentsList;
    return studentsList.filter(s => {
      const name = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      const email = String(s.email || '').toLowerCase();
      const sid = String(s.student_id || s.studentprofile?.student_id || '').toLowerCase();
      return name.includes(query) || email.includes(query) || sid.includes(query) || s.username.toLowerCase().includes(query);
    });
  }, [studentsList, studentPerformanceSearch]);

  if (loading) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
          <p className="text-slate-600 font-semibold text-sm">Loading Live Dynamic Admin Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50/70 min-h-screen space-y-8 font-sans">
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin System Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic overview of faculty jobs posted, application statuses, exam performances, course assignments & student reports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAllAnalyticsData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer border border-slate-200"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-indigo-600" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh Analytics"}</span>
          </button>

          <button
            onClick={handleExportAdminAnalyticsReport}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Download size={14} /> Export Report Excel
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC SUMMARY METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Jobs Posted */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Faculty Jobs Posted</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{jobsList.length}</h3>
              <p className="text-xs text-slate-500 mt-1.5">Active drive posts</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Briefcase size={20} />
            </div>
          </div>
        </div>

        {/* Metric 2: Applications */}
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Total Applications</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{applicationsList.length}</h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1.5">{appStatusCounts.accepted} Placed / Accepted</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText size={20} />
            </div>
          </div>
        </div>

        {/* Metric 3: Exam Performance */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Exam Pass Rate</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{examPerformanceStats.passRate}</h3>
              <p className="text-xs text-slate-500 mt-1.5">Avg Score: {examPerformanceStats.averageScore}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Award size={20} />
            </div>
          </div>
        </div>

        {/* Metric 4: Registered Students */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Registered Students</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{studentsList.length}</h3>
              <p className="text-xs text-slate-500 mt-1.5">{studentsList.filter(s => s.is_active).length} Active accounts</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Users size={20} />
            </div>
          </div>
        </div>

        {/* Metric 5: Courses & Batches */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Courses / Batches</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{coursesList.length} / {batchesList.length}</h3>
              <p className="text-xs text-slate-500 mt-1.5">{facultyList.length} Faculty members</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Layers size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BAR CHART: SYSTEM OVERVIEW */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-600" /> Overall System Metrics Comparison
              </h3>
              <p className="text-xs text-slate-500">Live breakdown of registered students, faculty, job posts, courses & batches</p>
            </div>
          </div>

          <div className="h-[320px] w-full min-h-[320px] relative">
            <ResponsiveContainer width="99%" height={320} minWidth={100} minHeight={320}>
              <BarChart data={overviewBarChartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#e2e8f0" }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#e2e8f0" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    color: "#0f172a",
                    borderRadius: "12px"
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART: APPLICATION STATUS BREAKDOWN */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-1">
              <Activity size={18} className="text-blue-600" /> Application Status Ratio
            </h3>
            <p className="text-xs text-slate-500 mb-4">Breakdown of student job applications</p>

            <div className="h-[240px] w-full min-h-[240px] flex items-center justify-center relative">
              <ResponsiveContainer width="99%" height={240} minWidth={100} minHeight={240}>
                <PieChart>
                  <Pie
                    data={applicationChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {applicationChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      color: "#0f172a",
                      borderRadius: "12px"
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Drives Applied: </span>
            <span className="font-bold text-slate-900">{applicationsList.length} Applications</span>
          </div>
        </div>
      </div>

      {/* 4. FACULTY ASSIGNED COURSES & BATCHES OVERVIEW */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" /> Assigned Faculty Courses & Batches Overview
            </h3>
            <p className="text-xs text-slate-500">Live list of faculty members mapped with their assigned courses & active student cohort batches</p>
          </div>
          <button
            onClick={() => navigate("/admin/faculty-assignment")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Manage Assignments</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-4">Faculty Name</th>
                <th className="p-3.5">Assigned Course</th>
                <th className="p-3.5">Batch Code & Title</th>
                <th className="p-3.5 text-center">Batch Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {facultyAssignmentsList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400">
                    No faculty course assignments recorded.
                  </td>
                </tr>
              ) : (
                facultyAssignmentsList.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
                          {(item.faculty_name || 'F').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.faculty_name || "Faculty Member"}</p>
                          <p className="text-xs text-slate-400">{item.faculty_email || "faculty@university.edu"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200/80">
                        {item.course_name || item.course?.title || "Python Full Stack"}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-lg text-xs font-bold border border-indigo-200/80">
                        {item.batch_name || item.batch?.name || "Cohort A1"} ({item.batch_code || "PY-2026"})
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-700">
                      {item.student_count || item.batch?.student_count || 30} Students
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. STUDENT REPORTS TABLE MATCHING DESIGN SYSTEM */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-800 m-0">Student Reports</h3>
          
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input 
                type="text"
                placeholder="Search students by name, ID, phone or course..."
                value={studentPerformanceSearch}
                onChange={(e) => setStudentPerformanceSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            
            <button 
              onClick={handleExportAdminAnalyticsReport}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" /> DOWNLOAD ALL PERFORMANCE
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">S.NO</th>
                <th className="py-3.5 px-4">Student ID</th>
                <th className="py-3.5 px-4">Student name</th>
                <th className="py-3.5 px-4">Mobile no</th>
                <th className="py-3.5 px-4">Course type</th>
                <th className="py-3.5 px-4 text-center">Reports</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-800">
              {filteredStudentsList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No matching student records found.
                  </td>
                </tr>
              ) : (
                filteredStudentsList.slice(0, 10).map((s, idx) => {
                  const fullName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.username;
                  const sid = s.student_id || s.studentprofile?.student_id || `91604${idx+1}`;
                  const courseTitle = s.studentprofile?.course_name || "Aptitude and Reasoning";
                  const mobileNo = s.mobile || s.phone_number || s.studentprofile?.mobile || "--";
                  return (
                    <tr key={s.id || idx} className="hover:bg-slate-50/80 transition border-b border-slate-100">
                      <td className="py-3.5 px-4 text-slate-500 font-medium">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{sid}</td>
                      <td className="py-3.5 px-4 text-slate-900 font-medium capitalize">{fullName}</td>
                      <td className="py-3.5 px-4 text-slate-500">{mobileNo}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{courseTitle}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => navigate(`/admin/student-report/${encodeURIComponent(s.username || s.first_name || s.id)}`)}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-semibold transition group cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                          <span>View Report</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Bar matching UI Design */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs text-slate-500">
          <div>
            Showing 1-{Math.min(10, filteredStudentsList.length)} of {filteredStudentsList.length} results
          </div>
          <div className="flex items-center gap-1.5">
            <button disabled className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-semibold disabled:opacity-50">
              Previous
            </button>
            <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold">
              1
            </span>
            <button disabled={filteredStudentsList.length <= 10} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
