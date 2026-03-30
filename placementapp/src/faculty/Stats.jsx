import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from "recharts";

function Stats() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    axios.get("http://127.0.0.1:8000/api/student-stats/", {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    })
      .then(res => setStudents(res.data || []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    (s.name || "").toLowerCase().includes(search.toLowerCase())
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
    return <div className="text-white p-10">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-400 text-sm">
          Track student performance & placement
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-4 gap-6">
        <Card title="Students" value={students.length} />
        <Card title="Passed" value={placementData[0].value} />
        <Card title="Failed" value={placementData[1].value} />
        <Card
          title="Avg Progress"
          value={
            students.length
              ? (
                  students.reduce((a, b) => a + (b.progress || 0), 0) /
                  students.length
                ).toFixed(1)
              : 0
          }
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-6">

        <Section title="Exam Performance">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={scoreData}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="score" fill="#6366f1" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Placement Ratio">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={placementData} dataKey="value" outerRadius={100}>
                {placementData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      i === 0 ? "#22c55e" : i === 1 ? "#ef4444" : "#94a3b8"
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search student..."
        className="w-full p-3 rounded-xl bg-[#0f172a] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-lg">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 text-sm">
              <th>Name</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Last Exam</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-white/5 transition">
                <td className="py-3">{s.name}</td>
                <td>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    s.status?.toLowerCase().includes("pass")
                      ? "bg-emerald-500/20 text-emerald-400"
                      : s.status?.toLowerCase().includes("fail")
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-slate-500/20 text-slate-200"
                  }`}>
                    {s.status || "Inactive"}
                  </span>
                </td>
                <td>{s.progress ?? 0}%</td>
                <td>{s.last_login ? new Date(s.last_login).toLocaleDateString() : s.date_joined ? new Date(s.date_joined).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* CLEAN CARD */
const Card = ({ title, value }) => (
  <div className="bg-[#0f172a] border border-white/10 p-6 rounded-2xl shadow hover:shadow-xl transition">
    <p className="text-gray-400 text-sm">{title}</p>
    <h2 className="text-3xl font-bold mt-2">{value}</h2>
  </div>
);

/* SECTION */
const Section = ({ title, children }) => (
  <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow">
    <h2 className="mb-4 font-semibold text-lg">{title}</h2>
    {children}
  </div>
);

export default Stats;