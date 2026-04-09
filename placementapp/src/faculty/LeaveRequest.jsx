import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faUser, faFileAlt, faCheckCircle, faTimesCircle, faClock } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Welcome Back font styles - exact same as Playground
  const welcomeBackFont = {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    fontWeight: '700', // font-bold equivalent
  };

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

      // Get current user's credentials for filtering
      const userName = localStorage.getItem("permanentName");
      const userEmail = localStorage.getItem("permanentEmail");
      const userStudentId = localStorage.getItem("permanentStudentId");
      const userPhone = localStorage.getItem("permanentPhone");

      console.log("Fetching leave requests for user:", { userName, userEmail, userStudentId, userPhone });

      // Fetch ALL leave requests first
      const res = await fetch(`http://${window.location.hostname}:8000/api/leave-requests/`, {
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
          return;
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Fetched ALL leave requests data:", data);
      
      // Handle different data structures
      const allLeaves = data.data || data || [];
      if (Array.isArray(allLeaves)) {
        // Ensure all leaves are shown to faculty - no filtering needed for admin view
        setLeaves(allLeaves);
      } else {
        console.error("Leaves data is not an array:", allLeaves);
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

    // Optimistic update - update UI immediately
    const originalLeaves = [...leaves];
    setLeaves(prevLeaves => 
      prevLeaves.map(leave => 
        leave.id === leaveId 
          ? { ...leave, status: 'Approved' }
          : leave
      )
    );

    try {
      const token = localStorage.getItem("access");
      if (!token) {
        // Revert optimistic update
        setLeaves(originalLeaves);
        alert("No authentication token found. Please login again.");
        return;
      }

      console.log("Making approve request to:", `http://${window.location.hostname}:8000/api/leave-requests/${leaveId}/approve/`);
      
      const res = await fetch(`http://${window.location.hostname}:8000/api/leave-requests/${leaveId}/approve/`, {
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
        // Notify other pages that leave status was updated
        localStorage.setItem('leaveRequestUpdated', Date.now().toString());
        localStorage.setItem('leaveRequestAction', 'approved');
        localStorage.setItem('leaveRequestId', leaveId);
        
        // Optional: Refresh data in background to get latest server state
        setTimeout(() => {
          fetchLeaves();
        }, 1000);
      } else {
        // Revert optimistic update on error
        setLeaves(originalLeaves);
        const errorData = await res.text();
        console.error("Failed to approve leave request. Status:", res.status);
        console.error("Error response:", errorData);
      }
    } catch (error) {
      // Revert optimistic update on error
      setLeaves(originalLeaves);
      console.error("Error approving leave:", error);
    }
  };

  const handleReject = async (leaveId) => {
    console.log("Rejecting leave request:", leaveId);

    // Optimistic update - update UI immediately
    const originalLeaves = [...leaves];
    setLeaves(prevLeaves => 
      prevLeaves.map(leave => 
        leave.id === leaveId 
          ? { ...leave, status: 'Rejected' }
          : leave
      )
    );

    try {
      const token = localStorage.getItem("access");
      if (!token) {
        // Revert optimistic update
        setLeaves(originalLeaves);
        alert("No authentication token found. Please login again.");
        return;
      }

      console.log("Making reject request to:", `http://${window.location.hostname}:8000/api/leave-requests/${leaveId}/reject/`);
      console.log("Approved by:", JSON.parse(localStorage.getItem("user") || "{}").username || "Faculty");
      
      const res = await fetch(`http://${window.location.hostname}:8000/api/leave-requests/${leaveId}/reject/`, {
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
        
        // Notify other pages that leave status was updated
        localStorage.setItem('leaveRequestUpdated', Date.now().toString());
        localStorage.setItem('leaveRequestAction', 'rejected');
        localStorage.setItem('leaveRequestId', leaveId);
        
        // Optional: Refresh data in background to get latest server state
        setTimeout(() => {
          fetchLeaves();
        }, 1000);
      } else {
        // Revert optimistic update on error
        setLeaves(originalLeaves);
        const errorData = await res.text();
        console.error("Failed to reject leave request. Status:", res.status);
        console.error("Error response:", errorData);
      }
    } catch (error) {
      // Revert optimistic update on error
      setLeaves(originalLeaves);
      console.error("Error rejecting leave:", error);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      {/* Header */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h4 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2" style={welcomeBackFont}>
            <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600 text-sm sm:text-base" />
            Leave Requests Management
          </h4>
          <button 
            onClick={fetchLeaves}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1.5 rounded-lg transition-colors duration-200 flex items-center gap-1 shadow-md text-xs sm:text-sm"
          >
            <FontAwesomeIcon icon={faClock} className="text-xs" />
            <span style={welcomeBackFont}>Refresh</span>
          </button>
        </div>

        {leaves.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 text-center">
              <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 text-3xl sm:text-4xl mb-3" />
              <h5 className="text-gray-800 text-base sm:text-lg font-bold mb-2" style={welcomeBackFont}>No Leave Requests</h5>
              <p className="text-gray-600 text-xs sm:text-sm" style={welcomeBackFont}>No leave requests have been submitted by students.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-2 sm:p-3">
              {/* Table for desktop view */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-semibold text-gray-700 text-xs" style={welcomeBackFont}>Student Details</th>
                      <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-semibold text-gray-700 text-xs" style={welcomeBackFont}>Leave Period</th>
                      <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-semibold text-gray-700 text-xs" style={welcomeBackFont}>Type</th>
                      <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-semibold text-gray-700 text-xs" style={welcomeBackFont}>Reason</th>
                      <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-semibold text-gray-700 text-xs" style={welcomeBackFont}>Status</th>
                      <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-semibold text-gray-700 text-xs" style={welcomeBackFont}>Applied On</th>
                      <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-semibold text-gray-700 text-xs" style={welcomeBackFont}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-2 sm:py-3 sm:px-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="bg-blue-100 rounded-full p-1.5 sm:p-3 flex items-center justify-center">
                              <FontAwesomeIcon icon={faUser} className="text-blue-600 text-xs sm:text-base" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{leave.name}</div>
                              <div className="text-gray-600 text-xs truncate">{leave.email}</div>
                              <div className="text-gray-500 text-xs">ID: {leave.student_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-2 sm:py-3 sm:px-4">
                          <div className="text-gray-900 flex items-center gap-1 text-xs sm:text-sm">
                            <span>{formatDate(leave.start_date)}</span>
                            <span className="text-gray-400">-</span>
                            <span>{formatDate(leave.end_date)}</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 sm:py-3 sm:px-4">
                          <span className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {leave.leave_type}
                          </span>
                        </td>
                        <td className="py-2 px-2 sm:py-3 sm:px-4">
                          <div className="text-gray-700 max-w-[150px] sm:max-w-xs truncate text-xs sm:text-sm" title={leave.reason}>
                            {leave.reason}
                          </div>
                        </td>
                        <td className="py-2 px-2 sm:py-3 sm:px-4">
                          <span className="font-bold text-xs sm:text-sm">
                            {leave.status === 'Approved' ? (
                              <span className="text-green-600">{leave.status}</span>
                            ) : leave.status === 'Rejected' ? (
                              <span className="text-red-600">{leave.status}</span>
                            ) : (
                              <span className="text-gray-800">{leave.status}</span>
                            )}
                          </span>
                        </td>
                        <td className="py-2 px-2 sm:py-3 sm:px-4">
                          <div className="text-gray-600 text-xs">
                            {formatDate(leave.appliedDate || leave.created_at)}
                          </div>
                        </td>
                        <td className="py-2 px-2 sm:py-3 sm:px-4">
                          {leave.status === "Pending" ? (
                            <div className="flex gap-1 sm:gap-2">
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleApprove(leave.id);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-1.5 py-1 sm:px-3 sm:py-2 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                                title="Approve leave request"
                                type="button"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                <span className="hidden sm:inline">Approve</span>
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleReject(leave.id);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-1.5 py-1 sm:px-3 sm:py-2 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                                title="Reject leave request"
                                type="button"
                              >
                                <FontAwesomeIcon icon={faTimesCircle} className="text-xs" />
                                <span className="hidden sm:inline">Reject</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs font-medium">
                              {leave.status === "Approved" ? (
                                <>
                                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                                  <span className="text-green-600 hidden sm:inline">{leave.status}</span>
                                </>
                              ) : (
                                <>
                                  <FontAwesomeIcon icon={faTimesCircle} className="text-red-600" />
                                  <span className="text-red-600 hidden sm:inline">{leave.status}</span>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card layout for mobile view */}
              <div className="lg:hidden space-y-4">
                {leaves.map((leave) => (
                  <div key={leave.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    {/* Student Info */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-blue-100 rounded-full p-2 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="text-blue-600 text-sm" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{leave.name}</h3>
                        <p className="text-gray-600 text-sm">{leave.email}</p>
                        <p className="text-gray-500 text-sm">ID: {leave.student_id}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        leave.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {leave.status}
                      </span>
                    </div>

                    {/* Leave Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                        <span className="text-gray-700">
                          {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {leave.leave_type}
                        </span>
                        <span className="text-gray-600 text-sm">
                          Applied: {formatDate(leave.appliedDate || leave.created_at)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 mr-2" />
                        {leave.reason}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {leave.status === "Pending" ? (
                        <>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              handleApprove(leave.id);
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                            type="button"
                          >
                            <FontAwesomeIcon icon={faCheckCircle} />
                            Approve
                          </button>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              handleReject(leave.id);
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                            type="button"
                          >
                            <FontAwesomeIcon icon={faTimesCircle} />
                            Reject
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-sm font-medium w-full justify-center">
                          {leave.status === "Approved" ? (
                            <>
                              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                              <span className="text-green-600">{leave.status}</span>
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faTimesCircle} className="text-red-600" />
                              <span className="text-red-600">{leave.status}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaves;
