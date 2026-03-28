import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats();
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

  if (loading) return <p className="p-3">Loading dashboard...</p>;

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

export default Dashboard;