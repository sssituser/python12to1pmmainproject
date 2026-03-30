import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        setApps([]);
        setLoading(false);
        navigate("/faculty/login", { replace: true });
        return;
      }

      const res = await fetch("/api/applied-jobs/", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (res.status === 401) {
        console.warn("Application fetch unauthorized - clearing token");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setApps([]);
        setLoading(false);
        navigate("/faculty/login", { replace: true });
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("Applications API error:", res.status, errorData);
        setApps([]);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setApps(data);
      } else if (data.results) {
        setApps(data.results);
      } else {
        setApps([]);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setApps([]);
    } finally {
      setLoading(false);
    }

  };

  const token = localStorage.getItem("access");

  if (!token) {
    return (
      <div className="container-fluid mt-5 text-center">
        <h5>🔐 Please log in to view applications</h5>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-fluid mt-5 text-center">
        <h5>Loading applications...</h5>
      </div>
    );
  }

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
            {apps.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center">
                  No applications found
                </td>
              </tr>
            ) : (
              apps.map((a, i) => {
                const studentName = a.username || a.user?.username || "N/A";
                const jobTitle = a.job?.job_title || a.job_details?.job_title || "N/A";
                const company = a.job?.company || a.job_details?.company || "";

                return (
                  <tr key={i}>
                    <td>{studentName}</td>
                    <td>{company ? `${jobTitle} @ ${company}` : jobTitle}</td>
                    <td>
                      <button className="btn btn-success btn-sm me-2">
                        Accept
                      </button>
                      <button className="btn btn-danger btn-sm">
                        Reject
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}

export default Applications;