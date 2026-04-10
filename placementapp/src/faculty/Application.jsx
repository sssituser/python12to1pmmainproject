import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
    const url = `http://127.0.0.1:8000/api/faculty-applications/${applicationId}/`;

    const res = await makeAuthenticatedRequest(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accept' })
    });

    const data = await res.json();
    console.log("ACCEPT RESPONSE:", data);

    if (res.ok) fetchApps();

  } catch (error) {
    console.error("Error accepting application:", error);
  }
};

const handleReject = async (applicationId) => {
  try {
    const url = `http://127.0.0.1:8000/api/faculty-applications/${applicationId}/`;

    const res = await makeAuthenticatedRequest(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject' })
    });

    const data = await res.json();
    console.log("REJECT RESPONSE:", data);

    if (res.ok) fetchApps();

  } catch (error) {
    console.error("Error rejecting application:", error);
  }
};
const handlePending = async (applicationId) => {
  try {
    const url = `http://127.0.0.1:8000/api/faculty-applications/${applicationId}/`;

    const res = await makeAuthenticatedRequest(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'pending' })
    });

    if (res.ok) fetchApps();

  } catch (error) {
    console.error("Error resetting status:", error);
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
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
  <div className="flex justify-between items-center mb-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-800">📋 Student Applications</h2>
      <p className="text-gray-500 text-sm">Total Applications: {apps.length}</p>
    </div>
  </div>

  {apps.length === 0 ? (
    <div className="text-center py-10 text-gray-400">
      No applications found 😕
    </div>
  ) : (
    
    <div className="overflow-x-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-6">

              {/* 🔍 Search Bar */}
              <div className="relative w-full md:w-80">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search student or job..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 shadow-sm 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                            transition-all"
                />
              </div>

              {/* 🎯 Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 shadow-sm 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 
                          bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Selected</option>
                <option value="rejected">Rejected</option>
              </select>

            </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-900 text-white text-xs uppercase tracking-wider">
            <th className="py-4 px-4 text-center">S.No</th>
            <th className="py-4 px-4 text-left">Student</th>
            <th className="py-4 px-4 text-left">Job</th>
            <th className="py-4 px-4 text-center">Date</th>
            <th className="py-4 px-4 text-center">Status</th>
          </tr>
        </thead>

        <tbody>
          {apps
            .filter((app) => {
              const student = (app.username || app.user?.username || "").toLowerCase();
              const job = (app.job_details?.job_title || "").toLowerCase();
              const status = (app.status || "pending").toLowerCase();

              const matchesSearch =
                student.includes(search.toLowerCase()) ||
                job.includes(search.toLowerCase());

              const matchesStatus =
                statusFilter === "all" || status === statusFilter;

              return matchesSearch && matchesStatus;
            })
            .map((app, index) => {
              const studentName = app.username || app.user?.username || "N/A";
              const jobTitle = app.job_details?.job_title || "N/A";
              const company = app.job_details?.company || "";
              const appliedDate = app.applied_date;
              const status = app.status || "pending";

            return (
              <tr key={index} className="border-b hover:bg-gray-50 transition">
                <td className="text-center py-4 font-bold text-gray-400">
                  {index + 1}
                </td>

                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">
                      {studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{studentName}</p>
                      <p className="text-xs text-gray-400">{app.email}</p>
                    </div>
                  </div>
                </td>

                <td className="py-4">
                  <p className="font-semibold text-blue-600">{jobTitle}</p>
                  <p className="text-xs text-gray-400">@ {company}</p>
                </td>

                <td className="text-center py-4 text-gray-500">
                  {new Date(appliedDate).toLocaleDateString('en-IN')}
                </td>

                <td className="text-center py-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full
                    ${status === "accepted"
                      ? "bg-green-100 text-green-700"
                      : status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"}
                  `}>
                    {status === "accepted"
                      ? "Selected"
                      : status === "rejected"
                      ? "Rejected"
                      : "Under Process"}
                  </span>
                  {status === 'pending' && (
                  <div className="mt-2 flex gap-2 justify-center">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs"
                      onClick={() => handleAccept(app.id)}
                    >
                      Accept
                    </button>

                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs"
                      onClick={() => handleReject(app.id)}
                    >
                      Reject
                    </button>
                  </div>
                )}

                {status === 'accepted' && (
                  <button
                    className="mt-2 bg-gray-500 text-white px-3 py-1 rounded-lg text-xs"
                    onClick={() => handlePending(app.id)}
                  >
                    Undo
                  </button>
                )}

                {status === 'rejected' && (
                  <button
                    className="mt-2 bg-gray-500 text-white px-3 py-1 rounded-lg text-xs"
                    onClick={() => handlePending(app.id)}
                  >
                    Undo
                  </button>
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
    
  );
}

export default Applications;
