import { useEffect, useState } from "react";

function Stats() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem("access");

    const res = await fetch("http://127.0.0.1:8000/api/students/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setStudents(data);
  };

  return (
    <div className="container-fluid">

      <h5 className="mb-3">Students</h5>

      <div className="card p-3 shadow-sm">
        <table className="table table-striped">

          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Progress</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.status}</td>
                <td>{s.progress}%</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default Stats;