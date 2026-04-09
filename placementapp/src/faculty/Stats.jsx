import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

function Stats() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
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
      window.location.href = "/login";
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

    // Fetch student data for faculty users using existing endpoints
    const fetchStudentData = async () => {
      try {
        // Primary: Try students endpoint
        const studentsRes = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/students/`);

        if (studentsRes.ok) {
          const data = await studentsRes.json();
          console.log("Stats - Students data from API:", data);
          
          // Handle different response formats
          let studentsArray = [];
          if (Array.isArray(data)) {
            studentsArray = data;
          } else if (data && data.students && Array.isArray(data.students)) {
            studentsArray = data.students;
          } else if (data && data.data && Array.isArray(data.data)) {
            studentsArray = data.data;
          }
          
          if (studentsArray.length > 0) {
            // Transform data to match expected format
            const transformedStudents = studentsArray.map((student) => {
              const userObj = student.user || {};
              return {
                id: student.id,
                studentId: student.studentId || student.student_id || student.id || userObj.studentId || userObj.id || "--",
                name: student.name || userObj.name || userObj.username || student.username || 'Unknown',
                course_title: student.course_title || "Not assigned",
                status: student.status || (student.is_active ? 'Active' : 'Inactive'),
                progress: student.progress || 0,
                last_login: student.last_login || userObj.last_login,
                date_joined: student.date_joined || userObj.date_joined
              };
            });
            
            setStudents(transformedStudents);
            console.log("Transformed students:", transformedStudents);
            return;
          } else {
            console.log("No students found in API response");
          }
        }
      } catch (error) {
        console.log("Students endpoint failed in Stats, trying student-stats");
      }

      // Fallback 1: Try student-stats endpoint
      try {
        const studentStatsRes = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/student-stats/`);

        if (studentStatsRes.ok) {
          const data = await studentStatsRes.json();
          console.log("Stats - Student stats from API:", data);
          
          // Handle different response formats
          let studentsArray = [];
          if (Array.isArray(data)) {
            studentsArray = data;
          } else if (data && data.students && Array.isArray(data.students)) {
            studentsArray = data.students;
          } else if (data && data.data && Array.isArray(data.data)) {
            studentsArray = data.data;
          }
          
          if (studentsArray.length > 0) {
            const transformedStudents = studentsArray.map((student) => {
              const userObj = student.user || {};
              return {
                id: student.id,
                studentId: student.studentId || student.student_id || student.id || userObj.studentId || userObj.id || "--",
                name: student.name || userObj.name || userObj.username || student.username || 'Unknown',
                course_title: student.course_title || "Not assigned",
                status: student.status || (student.is_active ? 'Active' : 'Inactive'),
                progress: student.progress || 0,
                last_login: student.last_login || userObj.last_login,
                date_joined: student.date_joined || userObj.date_joined
              };
            });
            setStudents(transformedStudents);
            console.log("Transformed students from student-stats:", transformedStudents);
            return;
          } else {
            console.log("Student-stats endpoint returned no data");
          }
        }
      } catch (error) {
        console.log("Student-stats endpoint failed");
      }

      // Set empty array if all endpoints fail
      console.log("All student endpoints failed, setting empty array");
      setStudents([]);

    };

    // Only fetch if token exists (for any user type)
    if (token) {
      fetchStudentData().finally(() => setLoading(false));
    } else {
      console.log("No token found, setting empty students array");
      setStudents([]);
      setLoading(false);
    }
  }, []);

  const filtered = students.filter(s =>
    (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
    String(s.studentId || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.course_title || "").toLowerCase().includes(search.toLowerCase())
  );

  const statusCounts = students.reduce(
    (acc, s) => {
      const state = (s.status || "Inactive").toLowerCase();
      if (state.includes("pass")) acc.pass += 1;
      else if (state.includes("fail")) acc.fail += 1;
      else acc.inactive += 1;
      return acc;
    },
    { pass: 0, fail: 0, inactive: 0 }
  );

  const placementData = [
    { name: "Passed", value: statusCounts.pass },
    { name: "Failed", value: statusCounts.fail },
    { name: "Inactive", value: statusCounts.inactive }
  ];

  const scoreData = students.map(s => ({
    name: s.name,
    score: s.progress || 0
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 font-medium">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8 space-y-8">

      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics Dashboard</h1>
        <p className="text-gray-500 text-sm font-medium">
          Track student performance & placement metrics
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Students" value={students.length} color="blue" />
        <Card title="Passed Students" value={statusCounts.pass} color="emerald" />
        <Card title="Failed Students" value={statusCounts.fail} color="rose" />
        <Card
          title="Avg Progress"
          color="indigo"
          value={
            students.length
              ? (
                  students.reduce((a, b) => a + (b.progress || 0), 0) /
                  students.length
                ).toFixed(1) + "%"
              : "0%"
          }
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Section title="Exam Performance (Progress %)">
          <div className="h-[300px] w-full mt-4 min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreData}>
                <CartesianGrid vertical={false} stroke="#cbd5e1" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Result Distribution">
          <div className="h-[300px] w-full mt-4 min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={placementData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={100} 
                  paddingAngle={5}
                  dataKey="value"
                >
                  {placementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      {/* SEARCH & TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
        <div className="p-6 border-b border-gray-100">
           <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search students by name, ID, or course..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold">Student ID</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold">Student Name</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold">Course Type</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold">Result Status</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-center">Progress %</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold">Joined Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500 font-medium">
                    No student records found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-blue-600">{s.studentId}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{s.course_title}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${
                        s.status?.toLowerCase().includes("pass")
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                          : s.status?.toLowerCase().includes("fail")
                          ? "bg-rose-50 text-rose-700 ring-rose-600/20"
                          : "bg-slate-50 text-slate-600 ring-slate-500/10"
                      }`}>
                        {s.status || "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                         <span className="text-sm font-bold text-gray-700">{s.progress ?? 0}%</span>
                         <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className={`h-full rounded-full ${Number(s.progress) > 70 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                              style={{ width: `${s.progress ?? 0}%` }}
                            />
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {s.date_joined ? new Date(s.date_joined).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* PREMIUM CARD */
const Card = ({ title, value, color }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    rose: "text-rose-600 bg-rose-50",
    indigo: "text-indigo-600 bg-indigo-50"
  };
  
  return (
    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{title}</p>
        <div className={`p-2 rounded-lg ${colors[color] || colors.blue}`}>
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
           </svg>
        </div>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">{value}</h2>
    </div>
  );
};

/* SECTION */
const Section = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
    <h2 className="font-bold text-gray-800 text-lg border-b border-gray-50 pb-4 mb-2">{title}</h2>
    {children}
  </div>
);

export default Stats;
