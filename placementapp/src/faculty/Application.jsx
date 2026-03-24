import { useEffect, useState } from "react";

function Applications() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    const token = localStorage.getItem("access");

    const res = await fetch("http://127.0.0.1:8000/api/applications/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setApps(data);
  };

  return (
    <div className="container-fluid">

      <h5 className="mb-3">Applications</h5>

      <div className="card p-3 shadow-sm">
        <table className="table table-bordered">

          <thead>
            <tr>
              <th>Student</th>
              <th>Job</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {apps.map((a, i) => (
              <tr key={i}>
                <td>{a.student}</td>
                <td>{a.job}</td>
                <td>
                  <button className="btn btn-success btn-sm me-2">
                    Accept
                  </button>
                  <button className="btn btn-danger btn-sm">
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default Applications;