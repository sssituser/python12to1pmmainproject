import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faUser, faFileAlt, faCheckCircle, faTimesCircle, faClock } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        console.error("No authentication token found");
        setLeaves([]);
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/api/leave-requests/", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          console.error("Authentication failed - token may be expired");
          // Clear tokens and redirect to login
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          alert("Session expired. Please login again.");
          // You might want to redirect to login page here
          return;
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Fetched leaves data:", data);
      
      // Handle different data structures
      const leavesData = data.data || data || [];
      if (Array.isArray(leavesData)) {
        setLeaves(leavesData);
      } else {
        console.error("Leaves data is not an array:", leavesData);
        setLeaves([]);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId) => {
    console.log("Approving leave request:", leaveId);
    if (!confirm("Are you sure you want to approve this leave request?")) return;

    try {
      const token = localStorage.getItem("access");
      if (!token) {
        alert("No authentication token found. Please login again.");
        return;
      }

      console.log("Making approve request to:", `http://127.0.0.1:8000/api/leave-requests/${leaveId}/approve/`);
      
      const res = await fetch(`http://127.0.0.1:8000/api/leave-requests/${leaveId}/approve/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          approved_by: JSON.parse(localStorage.getItem("user") || "{}").username || "Faculty"
        }),
      });

      console.log("Approve response status:", res.status);
      console.log("Approve response ok:", res.ok);

      if (res.ok) {
        alert("Leave request approved successfully!");
        fetchLeaves(); // Refresh the list
      } else {
        const errorData = await res.text();
        console.error("Failed to approve leave request. Status:", res.status);
        console.error("Error response:", errorData);
        alert(`Failed to approve leave request: ${res.status} ${errorData}`);
      }
    } catch (error) {
      console.error("Error approving leave:", error);
      alert(`Error approving leave request: ${error.message || error}`);
    }
  };

  const handleReject = async (leaveId) => {
    console.log("Rejecting leave request:", leaveId);
    if (!confirm("Are you sure you want to reject this leave request?")) return;

    try {
      const token = localStorage.getItem("access");
      if (!token) {
        alert("No authentication token found. Please login again.");
        return;
      }

      console.log("Making reject request to:", `http://127.0.0.1:8000/api/leave-requests/${leaveId}/reject/`);
      console.log("Approved by:", JSON.parse(localStorage.getItem("user") || "{}").username || "Faculty");
      
      const res = await fetch(`http://127.0.0.1:8000/api/leave-requests/${leaveId}/reject/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rejection_reason: "Rejected by faculty",
          approved_by: JSON.parse(localStorage.getItem("user") || "{}").username || "Faculty"
        }),
      });

      console.log("Reject response status:", res.status);
      console.log("Reject response ok:", res.ok);

      if (res.ok) {
        const responseData = await res.json();
        console.log("Reject response data:", responseData);
        alert("Leave request rejected successfully!");
        fetchLeaves(); // Refresh the list
      } else {
        const errorData = await res.text();
        console.error("Failed to reject leave request. Status:", res.status);
        console.error("Error response:", errorData);
        alert(`Failed to reject leave request: ${res.status} ${errorData}`);
      }
    } catch (error) {
      console.error("Error rejecting leave:", error);
      alert(`Error rejecting leave request: ${error.message || error}`);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    // Return empty string to remove all colors
    return '';
  };

  const getLeaveTypeColor = (type) => {
    return '';
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">
          <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
          Leave Requests Management
        </h4>
        <button 
          onClick={fetchLeaves}
          className="btn btn-outline-primary btn-sm"
        >
          <FontAwesomeIcon icon={faClock} className="me-1" />
          Refresh
        </button>
      </div>

      {leaves.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 text-4xl mb-3" />
            <h5 className="text-gray-600">No Leave Requests</h5>
            <p className="text-gray-500">No leave requests have been submitted by students.</p>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 py-3 px-3">Student Details</th>
                    <th className="border-0 py-3 px-3">Leave Period</th>
                    <th className="border-0 py-3 px-3">Type</th>
                    <th className="border-0 py-3 px-3">Reason</th>
                    <th className="border-0 py-3 px-3">Status</th>
                    <th className="border-0 py-3 px-3">Applied On</th>
                    <th className="border-0 py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave.id}>
                      <td className="py-4 px-3">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-flex align-items-center justify-content-center">
                              <FontAwesomeIcon icon={faUser} className="text-primary" />
                            </div>
                          </div>
                          <div>
                            <div className="fw-semibold">{leave.name}</div>
                            <div className="text-muted small">{leave.email}</div>
                            <div className="text-muted small">ID: {leave.student_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="text-dark" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{formatDate(leave.start_date)}</span>
                          <span style={{ marginLeft: '8px' }}>-</span>
                          <span>{formatDate(leave.end_date)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span className="fs-6" style={{ padding: '8px 12px', fontSize: '0.85rem', minWidth: '100px', display: 'inline-block', color: '#333' }}>
                          {leave.leave_type}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <div className="text-truncate" style={{ maxWidth: '250px' }} title={leave.reason}>
                          {leave.reason}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span className="fw-bold" style={{ color: '#000000', fontSize: '0.9rem' }}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <div className="text-muted small">
                          {formatDate(leave.appliedDate || leave.created_at)}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        {leave.status === "Pending" ? (
                          <div className="btn-group" role="group">
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                handleApprove(leave.id);
                              }}
                              className="btn btn-success btn-sm me-2"
                              title="Approve leave request"
                              type="button"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                              Approve
                            </button>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                handleReject(leave.id);
                              }}
                              className="btn btn-danger btn-sm"
                              title="Reject leave request"
                              type="button"
                            >
                              <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="text-muted small">
                            {leave.status === "Approved" ? (
                              <FontAwesomeIcon icon={faCheckCircle} className="text-success me-1" />
                            ) : (
                              <FontAwesomeIcon icon={faTimesCircle} className="text-danger me-1" />
                            )}
                            {leave.status}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leaves;