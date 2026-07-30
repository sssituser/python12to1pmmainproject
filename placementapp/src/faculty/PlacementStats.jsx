import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  Building2,
  GraduationCap,
  Award,
  Filter,
  BarChart2,
  PieChart as PieChartIcon,
  RefreshCw,
  CalendarDays
} from "lucide-react";
import AttendanceManagement from "../admin/AttendanceManagement";
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

const PIE_COLORS = ["#2563EB", "#10B981", "#8B5CF6", "#F59E0B"];

function PlacementStats() {
  useSEO(
    "Placement Statistics & Analytics",
    "Real-time placement analytics, company drives, student placement performance, and exportable reports for SSSIT Faculty."
  );

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dynamic state loaded directly from API endpoints
  const [stats, setStats] = useState({
    total_students: 0,
    placed_students: 0,
    active_jobs: 0,
    pending_reviews: 0,
    placement_rate: "0%"
  });

  const [studentList, setStudentList] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [applicationsList, setApplicationsList] = useState([]);

  useEffect(() => {
    fetchPlacementData();

    // Auto-refresh dynamic graph data every 10 seconds
    const interval = setInterval(() => {
      fetchPlacementData(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) return null;

      const response = await fetch(`http://${window.location.hostname}:8000/api/jwt/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access", data.access);
        return data.access;
      }
      return null;
    } catch {
      return null;
    }
  };

  const makeAuthFetch = async (url, options = {}) => {
    let token = localStorage.getItem("access");
    let res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });

    if (res.status === 401 && token) {
      token = await refreshAccessToken();
      if (token) {
        res = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          },
        });
      }
    }
    return res;
  };

  const fetchPlacementData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Fetch Students count dynamically
      let studentsData = [];
      try {
        const studRes = await makeAuthFetch(`http://${window.location.hostname}:8000/api/students/`);
        if (studRes.ok) {
          const json = await studRes.json();
          studentsData = Array.isArray(json) ? json : (json.students || json.results || []);
        } else {
          const statsRes = await makeAuthFetch(`http://${window.location.hostname}:8000/api/student-stats/`);
          if (statsRes.ok) {
            const json = await statsRes.json();
            studentsData = Array.isArray(json) ? json : (json.students || []);
          }
        }
      } catch (err) {
        console.warn("Failed fetching students list dynamically", err);
      }
      setStudentList(studentsData);

      // 2. Fetch Active Jobs count dynamically
      let jobsData = [];
      try {
        const jobsRes = await makeAuthFetch(`http://${window.location.hostname}:8000/api/admin/jobs/`);
        if (jobsRes.ok) {
          const json = await jobsRes.json();
          jobsData = Array.isArray(json) ? json : (json.results || json.data || []);
        }
      } catch (err) {
        console.warn("Failed fetching jobs dynamically", err);
      }
      setJobsList(jobsData);

      // 3. Fetch Courses count dynamically
      let coursesCount = 0;
      try {
        const coursesRes = await makeAuthFetch(`http://${window.location.hostname}:8000/api/courses/`);
        if (coursesRes.ok) {
          const json = await coursesRes.json();
          const cData = Array.isArray(json) ? json : (json.results || json.data || []);
          coursesCount = cData.length;
        }
      } catch (err) {
        console.warn("Failed fetching courses dynamically", err);
      }

      // 4. Fetch Batches count dynamically
      let batchesCount = 0;
      try {
        const batchesRes = await makeAuthFetch(`http://${window.location.hostname}:8000/api/batches/`);
        if (batchesRes.ok) {
          const json = await batchesRes.json();
          const bData = Array.isArray(json) ? json : (json.results || json.data || []);
          batchesCount = bData.length;
        }
      } catch (err) {
        console.warn("Failed fetching batches dynamically", err);
      }

      // 5. Fetch Applications dynamically
      let appsData = [];
      try {
        const appsRes = await makeAuthFetch(`http://${window.location.hostname}:8000/api/faculty-applications/`);
        if (appsRes.ok) {
          const json = await appsRes.json();
          appsData = Array.isArray(json) ? json : (json.results || json.data || []);
        }
      } catch (err) {
        console.warn("Failed fetching applications dynamically", err);
      }
      setApplicationsList(appsData);

      // 6. Fetch Dashboard Stats Endpoint if available
      let backendStats = {};
      try {
        const dashRes = await makeAuthFetch(`http://${window.location.hostname}:8000/api/dashboard-stats/`);
        if (dashRes.ok) {
          backendStats = await dashRes.json();
        }
      } catch (err) {
        console.warn("Dashboard stats backend check failed", err);
      }

      // Compute dynamic numbers from live API results
      const totalStudentsCount = studentsData.length || backendStats.total_students || 0;
      const totalJobsCount = jobsData.length || backendStats.total_jobs || 0;

      const pendingFromApps = appsData.filter(app => 
        (app.status || "").toLowerCase() === "applied" || 
        (app.status || "").toLowerCase() === "pending" ||
        (app.status || "").toLowerCase() === "under review"
      ).length;

      const pendingCount = pendingFromApps || backendStats.pending_reviews || 0;

      setStats({
        total_students: totalStudentsCount,
        total_courses: coursesCount || backendStats.total_courses || 0,
        total_batches: batchesCount || backendStats.total_batches || 0,
        active_jobs: totalJobsCount,
        pending_reviews: pendingCount
      });
    } catch (e) {
      console.error("Error building dynamic placement stats:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const chartData = useMemo(() => [
    { name: "Total Registered", value: stats.total_students, fill: "#2563EB" },
    { name: "Total Courses", value: stats.total_courses, fill: "#10B981" },
    { name: "Assigned Batches", value: stats.total_batches, fill: "#6366F1" },
    { name: "Active Job Openings", value: stats.active_jobs, fill: "#8B5CF6" },
    { name: "Pending Applications", value: stats.pending_reviews, fill: "#F59E0B" }
  ], [stats]);

  const pieData = useMemo(() => [
    { name: "Courses", value: stats.total_courses },
    { name: "Batches", value: stats.total_batches },
    { name: "Applications", value: stats.pending_reviews }
  ], [stats]);

  const handleExportPlacementReport = () => {
    // Generate dynamically formatted sheet with real live data
    const overviewSheet = [
      { Metric: "Total Registered Candidates", Value: stats.total_students },
      { Metric: "Successfully Placed Candidates", Value: stats.placed_students },
      { Metric: "Active Recruitment Drives", Value: stats.active_jobs },
      { Metric: "Pending Candidate Applications", Value: stats.pending_reviews },
      { Metric: "Overall Placement Conversion Rate", Value: stats.placement_rate }
    ];

    const workbook = XLSX.utils.book_new();
    const wsOverview = XLSX.utils.json_to_sheet(overviewSheet);
    XLSX.utils.book_append_sheet(workbook, wsOverview, "Placement Summary");

    if (applicationsList.length > 0) {
      const appRows = applicationsList.map(a => ({
        "Student Name": a.student_name || a.name || a.user?.username || "N/A",
        "Job Title": a.job_title || a.job?.job_title || "N/A",
        "Company": a.company || a.job?.company || "N/A",
        "Status": a.status || "Pending",
        "Applied On": a.created_at ? new Date(a.created_at).toLocaleDateString() : "N/A"
      }));
      const wsApps = XLSX.utils.json_to_sheet(appRows);
      XLSX.utils.book_append_sheet(workbook, wsApps, "Student Applications");
    }

    XLSX.writeFile(workbook, `Dynamic_Placement_Analytics_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-medium text-sm">Fetching real-time placement analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <TrendingUp size={16} /> Placement Intelligence & Real-time Data
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Placement Statistics & Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Dynamically loaded statistics from live candidate profiles, active job postings, and job applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPlacementData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm px-3.5 py-2.5 rounded-xl transition-all cursor-pointer border border-slate-200"
            title="Refresh dynamic placement data"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin text-blue-600" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
          </button>

          <button
            onClick={handleExportPlacementReport}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all duration-200 cursor-pointer"
          >
            <Download size={16} /> Export Excel
          </button>

          <button
            onClick={() => navigate("/faculty/dashboard")}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer border border-slate-200"
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Registered</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats.total_students}</h3>
              <p className="text-xs text-slate-500 mt-2">Active candidates</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Total Courses</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats.total_courses}</h3>
              <p className="text-xs text-slate-500 mt-2">Active curricula</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <GraduationCap size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Assigned Batches</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats.total_batches}</h3>
              <p className="text-xs text-slate-500 mt-2">Active cohorts</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Award size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Active Job Drives</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats.active_jobs}</h3>
              <p className="text-xs text-slate-500 mt-2">Recruiters</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Briefcase size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Reviews</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats.pending_reviews}</h3>
              <p className="text-xs text-slate-500 mt-2">Under evaluation</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BAR CHART */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <BarChart2 size={20} className="text-blue-600" /> Dynamic Metrics Comparison
              </h3>
              <p className="text-xs text-slate-500">Real-time breakdown calculated directly from live backend records</p>
            </div>
          </div>

          <div className="h-[320px] w-full min-h-[320px] relative">
            <ResponsiveContainer width="99%" height={320} minWidth={100} minHeight={320}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#e2e8f0" }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#e2e8f0" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    color: "#0f172a",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-1">
              <PieChartIcon size={20} className="text-emerald-600" /> Candidate Distribution Ratio
            </h3>
            <p className="text-xs text-slate-500 mb-4">Proportions of placed vs active seekers</p>

            <div className="h-[240px] w-full min-h-[240px] flex items-center justify-center relative">
              <ResponsiveContainer width="99%" height={240} minWidth={100} minHeight={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">Overall Placement Conversion: </span>
            <span className="text-sm font-extrabold text-emerald-600">{stats.placement_rate}</span>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS & NAV */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Manage Job Drives ({jobsList.length})</h4>
            <p className="text-xs text-slate-500 mt-1">Create or update company job posts & schedules.</p>
          </div>
          <Link
            to="/faculty/jobs"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            View Jobs <ArrowRight size={14} />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Review Student Applications ({applicationsList.length})</h4>
            <p className="text-xs text-slate-500 mt-1">Screen candidate profiles for active drives.</p>
          </div>
          <Link
            to="/faculty/applications"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            Applications <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* STUDENT ATTENDANCE OVERVIEW TRACKER SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600" /> Student Batch Attendance Tracker
            </h3>
            <p className="text-xs text-slate-500">Live overview and daily attendance audit records for assigned student cohorts</p>
          </div>
          <Link
            to="/faculty/student-approvals"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Full Approvals & Attendance</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <AttendanceManagement />
      </div>
    </div>
  );
}

export default PlacementStats;
