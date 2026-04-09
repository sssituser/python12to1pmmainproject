import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      window.location.href = "/";
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

      console.log("Fetching student applied jobs...");

      let res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/faculty-applications/`);
      
      if (!res.ok) {
        const alternatives = [
          `http://${window.location.hostname}:8000/api/applied-jobs/`,
          `http://${window.location.hostname}:8000/api/student/applied-jobs/`,
          `http://${window.location.hostname}:8000/api/applications/`,
          `http://${window.location.hostname}:8000/api/students/applied-jobs/`
        ];

        for (const endpoint of alternatives) {
          res = await makeAuthenticatedRequest(endpoint);
          if (res.ok) break;
        }
      }

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      let applications = [];
      if (Array.isArray(data)) {
        applications = data;
      } else if (data.results) {
        applications = data.results;
      } else if (data.data) {
        applications = data.data;
      } else if (data.applications) {
        applications = data.applications;
      }

      setApps(applications);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (applicationId) => {
    try {
      const url = `http://${window.location.hostname}:8000/api/faculty-applications/${applicationId}/`;
      const res = await makeAuthenticatedRequest(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' })
      });

      if (res.ok) {
        fetchApps();
      } else {
        const data = await res.json();
        console.error("Accept failed:", data);
      }
    } catch (error) {
      console.error("Error accepting application:", error);
    }
  };

  const handleReject = async (applicationId) => {
    try {
      const url = `http://${window.location.hostname}:8000/api/faculty-applications/${applicationId}/`;
      const res = await makeAuthenticatedRequest(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' })
      });

      if (res.ok) {
        fetchApps();
      } else {
        const data = await res.json();
        console.error("Reject failed:", data);
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
    }
  };

  const token = localStorage.getItem("access");

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h5 className="text-xl font-semibold text-gray-700 mb-2">🔐 Please log in to view applications</h5>
          <button 
            onClick={() => navigate("/faculty/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4 border-0 rounded-4">
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">📋 Student Applications</h3>
            <p className="text-muted small mb-0">Total Applications: {apps.length}</p>
          </div>
        </div>

        {apps.length === 0 ? (
          <div className="text-center py-5">
            <h5 className="text-muted">No applications found 😕</h5>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th className="px-4 py-3 text-center font-bold" style={{ width: "80px" }}>S.No</th>
                  <th className="px-4 py-3 text-start font-bold">Student</th>
                  <th className="px-4 py-3 text-start font-bold">Job Details</th>
                  <th className="px-4 py-3 text-center font-bold">Application Date</th>
                  <th className="px-4 py-3 text-center font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app, index) => {
                  const studentName = app.username || app.user?.username || app.student_name || "N/A";
                  const jobTitle = app.job_details?.job_title || app.job?.job_title || "N/A";
                  const company = app.job_details?.company || app.job?.company || "";
                  const appliedDate = app.applied_date || app.applied_at || app.created_at || new Date().toLocaleDateString();
                  const status = app.status || 'pending';
                  
                  return (
                    <tr key={app.id || index}>
                      <td className="text-center text-muted fw-bold">{index + 1}</td>
                      <td className="px-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className="h-10 w-10 rounded-circle bg-primary d-flex align-items-center justify-center text-white fw-bold" style={{ width: '35px', height: '35px', fontSize: '14px', flexShrink: 0 }}>
                            {studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{studentName}</div>
                            <div className="text-muted small">{app.email || app.user?.email || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="fw-bold text-primary">{jobTitle}</div>
                        {company && <div className="text-muted small">@ {company}</div>}
                      </td>
                      <td className="text-center">
                        <span className="text-muted small">
                          {new Date(appliedDate).toLocaleDateString('en-GB')}
                        </span>
                      </td>
                      <td className="text-center">

                          <span className={`badge px-3 py-2 rounded-pill ${
                            status === 'accepted' ? 'bg-success' :
                            status === 'rejected' ? 'bg-danger' :
                            'bg-warning'
                          }`}>
                            {status === 'accepted'
                              ? 'Selected'
                              : status === 'rejected'
                              ? 'Rejected'
                              : 'Under Process'}
                          </span>

                          {status === 'pending' && (
                            <div className="mt-2 d-flex gap-2 justify-content-center">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleAccept(app.id)}
                              >
                                Accept
                              </button>

                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleReject(app.id)}
                              >
                                Reject
                              </button>
                            </div>
                          )}

                        </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Applications;
