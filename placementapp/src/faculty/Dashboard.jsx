import { useEffect, useState } from "react";

function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem("access");

    const res = await fetch("http://127.0.0.1:8000/api/dashboard-stats/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setStats(data);
  };

  return (
    <div className="container-fluid">

      <h4 className="mb-4">Welcome Admin 👋</h4>

      <div className="row g-3">

        <StatCard title="Students" value={stats.total_students} />
        <StatCard title="Placed" value={stats.placed_students} />
        <StatCard title="Jobs" value={stats.active_jobs} />
        <StatCard title="Pending" value={stats.pending_reviews} />

      </div>

    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="col-md-3">
      <div className="bg-white p-4 rounded shadow-sm">
        <p className="text-gray-500">{title}</p>
        <h4>{value || 0}</h4>
      </div>
    </div>
  );
}

export default Dashboard;