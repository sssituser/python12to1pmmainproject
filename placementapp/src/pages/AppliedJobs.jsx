import React, { useEffect, useState } from "react";

function AppliedJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
<<<<<<< HEAD

  useEffect(() => {
    const token = localStorage.getItem("access");
=======
  const [loading, setLoading] = useState(true);
>>>>>>> f83998573c91ec84e5041a2cc032d45876a28bc6

    fetch("http://127.0.0.1:8000/api/applied-jobs/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("DATA:", data);
        setJobs(Array.isArray(data) ? data : data.results || []);
      })
      .catch((err) => console.log(err));
  }, []);

<<<<<<< HEAD
  const filteredJobs = jobs.filter((j) =>
    j.job_details?.job_title?.toLowerCase().includes(search.toLowerCase()) ||
    j.job_details?.company?.toLowerCase().includes(search.toLowerCase()) ||
    j.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4 border-0">
        <h3 className="fw-bold mb-3">📄 Applied Jobs</h3>

        <p className="text-muted">
          Total Applications: {filteredJobs.length}
        </p>

        <input
          type="text"
          placeholder="🔍 Search by job, company, user"
          className="form-control mb-4 shadow-sm"
          style={{ borderRadius: "10px" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Job</th>
                <th>Company</th>
                <th>Student</th>
                <th>Applied Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No Applied Jobs 😕
                  </td>
                </tr>
              ) : (
                filteredJobs.map((j) => {
                  const days =
                    (new Date() - new Date(j.applied_date)) /
                    (1000 * 60 * 60 * 24);

                  let status = "Applied";
                  if (days >= 2 && days < 5) status = "Under Review";
                  if (days >= 5) status = "Shortlisted";

                  return (
                    <tr key={j.id}>
                      <td className="fw-semibold">
                        {j.job_details?.job_title}
                      </td>

                      <td>
                        <span className="badge bg-primary px-3 py-2">
                          {j.job_details?.company}
                        </span>
                      </td>

                      <td className="text-success fw-bold">
                        👤 {j.username}
                      </td>

                      <td className="text-muted">
                        {new Date(j.applied_date).toLocaleDateString()}
                      </td>

                      <td>
                        <span className="badge bg-warning">
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
=======
  // ==============================
  // FETCH APPLIED JOBS
  // ==============================
  useEffect(() => {
    // ❌ If no token → stop
    if (!token) {
      console.log("No token found");
      setLoading(false);
      return;
    }

    fetch("http://127.0.0.1:8000/api/applied-jobs/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 401) {
          console.log("Token expired or invalid");

          // ❗ Optional: auto logout
          localStorage.removeItem("access");

          return [];
        }

        if (!res.ok) {
          return [];
        }

        return await res.json();
      })
      .then((data) => {
        console.log("GET DATA:", data);

        if (Array.isArray(data)) {
          setJobs(data);
        } else if (data?.results) {
          setJobs(data.results);
        } else {
          setJobs([]);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.log("Fetch error:", err);
        setJobs([]);
        setLoading(false);
      });
  }, [token]);

  // ==============================
  // SEARCH
  // ==============================
  const filteredJobs = jobs.filter((j) => {
    const title = j.job_details?.job_title?.toLowerCase() || "";
    const company = j.job_details?.company?.toLowerCase() || "";
    const user = j.username?.toLowerCase() || "";

    return (
      title.includes(search.toLowerCase()) ||
      company.includes(search.toLowerCase()) ||
      user.includes(search.toLowerCase())
    );
  });

  // ==============================
  // UI STATES
  // ==============================

  // 🔐 Not logged in
  if (!token) {
    return (
      <div className="container mt-5 text-center">
        <h4>🔐 Please login to view applied jobs</h4>
      </div>
    );
  }

  // ⏳ Loading
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h5>Loading applied jobs...</h5>
      </div>
    );
  }

  // ==============================
  // MAIN UI
  // ==============================
  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4 border-0">
        <h3 className="fw-bold mb-3">📄 Applied Jobs</h3>

        <p className="text-muted">
          Total Applications: {filteredJobs.length}
        </p>

        <input
          type="text"
          placeholder="🔍 Search by job, company, user"
          className="form-control mb-4 shadow-sm"
          style={{ borderRadius: "10px" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Job</th>
                <th>Company</th>
                <th>Student</th>
                <th>Applied Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">
                    No Applied Jobs 😕
                  </td>
                </tr>
              ) : (
                filteredJobs.map((j) => (
                  <tr key={j.id}>
                    <td>{j.job_details?.job_title || "N/A"}</td>

                    <td>
                      <span className="badge bg-primary px-3 py-2">
                        {j.job_details?.company || "N/A"}
                      </span>
                    </td>

                    <td>
                      <span className="text-success fw-bold">
                        👤 {j.username || "N/A"}
                      </span>
                    </td>

                    <td>
                      {j.applied_date
                        ? new Date(j.applied_date).toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
>>>>>>> f83998573c91ec84e5041a2cc032d45876a28bc6
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AppliedJobs;