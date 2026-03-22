import { useEffect, useState } from "react";

function Leaves() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    const token = localStorage.getItem("access");

    const res = await fetch("http://127.0.0.1:8000/api/leave/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setLeaves(data);
  };

  return (
    <div className="container-fluid">

      <h5 className="mb-3">Leave Requests</h5>

      <div className="card p-3 shadow-sm">
        <table className="table table-hover">

          <thead>
            <tr>
              <th>Student</th>
              <th>Reason</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((l) => (
              <tr key={l.id}>
                <td>{l.student}</td>
                <td>{l.reason}</td>
                <td>
                  <button className="btn btn-success btn-sm me-2">
                    Approve
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

export default Leaves;