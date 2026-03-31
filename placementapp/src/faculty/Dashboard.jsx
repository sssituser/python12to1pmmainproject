import { useEffect, useState } from "react";
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [examReports, setExamReports] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Fail");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats();
    getExamReports();
  }, []);

  const getStats = async () => {
    try {
      const token = localStorage.getItem("access");

      const res = await fetch("http://127.0.0.1:8000/api/dashboard-stats/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.log("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const getExamReports = async () => {
    try {
      const token = localStorage.getItem("access");
      const res = await fetch("http://127.0.0.1:8000/api/all-exam-results/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const reports = data?.data || [];
      setExamReports(reports);
    } catch (err) {
      console.log("Error fetching exam reports:", err);
    }
  };

  if (loading) return <p className="p-3">Loading dashboard...</p>;

  const passReports = examReports.filter((item) => item.status?.toLowerCase() === "pass");
  const failReports = examReports.filter((item) => item.status?.toLowerCase() === "fail");
  const cheatingReports = examReports.filter((item) => item.status?.toLowerCase().includes("cheat"));
  const selectedReports =
    selectedCategory === "Pass"
      ? passReports
      : selectedCategory === "Cheated"
      ? cheatingReports
      : failReports;

  return (
    <div className="container mt-3">
      <h4 className="mb-4">Dashboard</h4>

      {/* Stats */}
      <div className="row mb-4">
        <Card title="Students" value={stats?.total_students} />
        <Card title="Placed" value={stats?.placed_students} />
        <Card title="Jobs" value={stats?.active_jobs} />
        <Card title="Pending" value={stats?.pending_reviews} />
      </div>


      {/* Chart */}
      <div className="bg-white p-3 shadow-sm rounded">
        <h6 className="mb-3">Overview</h6>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={[
              { name: "Students", value: stats?.total_students || 0 },
              { name: "Placed", value: stats?.placed_students || 0 },
              { name: "Jobs", value: stats?.active_jobs || 0 },
              { name: "Pending", value: stats?.pending_reviews || 0 },
            ]}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="col-md-3 mb-3">
      <div className="p-3 bg-light border rounded text-center">
        <small className="text-muted">{title}</small>
        <h5 className="mt-1">{value ?? 0}</h5>
      </div>
    </div>
  );
}

function StatusCard({ title, value, active, onClick, color }) {
  return (
    <div className="col-md-4 mb-3">
      <button
        type="button"
        onClick={onClick}
        className={`w-100 p-3 rounded shadow-sm border text-left ${color} ${
          active ? "border-2 border-dark" : "border-0"
        } text-white`}
        style={{ minHeight: 120 }}
      >
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="fw-semibold">{title}</span>
          <span className="badge bg-white text-dark">{value}</span>
        </div>
        <p className="mb-0 text-white-75">Click to inspect details on this page.</p>
      </button>
    </div>
  );
}

export default Dashboard;