import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCalendarAlt, faUser, faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";

function LeaveSummary() {
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Clear all old data and start fresh
  const clearAllOldData = () => {
    const keysToRemove = [
      'permanentName',
      'permanentEmail', 
      'permanentStudentId',
      'permanentPhone',
      'deviceFingerprint',
      'browserClientId',
      'deviceId',
      'registeredName',
      'registeredEmail',
      'registeredStudentId',
      'registeredPhone'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log("=== ALL OLD DATA CLEARED FROM SUMMARY - FRESH START ===");
  };

  // Load leave requests on component mount
  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      if (!token) {
        console.log("No token found - user not logged in");
        setLeaveRequests([]);
        setLoading(false);
        return;
      }

      // Get current user's credentials
      const userName = localStorage.getItem('permanentName');
      const userStudentId = localStorage.getItem('permanentStudentId');
      const userPhone = localStorage.getItem('permanentPhone');
      
      if (!userName || !userStudentId || !userPhone) {
        console.log("User credentials not found - showing empty summary");
        setLeaveRequests([]);
        setLoading(false);
        return;
      }
      
      // Try different endpoints to find the leave requests data
      const endpoints = [
        'http://127.0.0.1:8000/api/leave-requests/',
        'http://127.0.0.1:8000/api/leave-requests/all/',
        'http://127.0.0.1:8000/api/leave-requests/list/',
        'http://127.0.0.1:8000/api/leave/all/',
        'http://127.0.0.1:8000/api/leaves/'
      ];

      let data = [];
      let found = false;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const responseData = await response.json();
            console.log(`Data from ${endpoint}:`, responseData);
            
            // Handle different response structures
            if (Array.isArray(responseData)) {
              data = responseData;
              found = true;
              break;
            } else if (responseData.data && Array.isArray(responseData.data)) {
              data = responseData.data;
              found = true;
              break;
            } else if (responseData.results && Array.isArray(responseData.results)) {
              data = responseData.results;
              found = true;
              break;
            }
          }
        } catch (error) {
          console.log(`Failed to fetch from ${endpoint}:`, error);
          continue;
        }
      }

      if (found) {
        // Filter requests for current user only
        const userRequests = data.filter(request => {
          return request.name === userName && 
                 request.student_id.toString() === userStudentId.toString() &&
                 request.phone.toString() === userPhone.toString();
        });
        
        console.log(`Found ${userRequests.length} requests for user: ${userName}`);
        setLeaveRequests(userRequests);
      } else {
        // Start with empty array instead of sample data
        setLeaveRequests([]);
        console.log('No data found, starting with empty array');
      }
    } catch (error) {
      console.error('Error loading leave requests:', error);
      // Start with empty array on error as well
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStatistics = () => {
    if (leaveRequests.length === 0) return null;

    const leaveTypeStats = {};
    const totalDays = {};
    let totalLeaveDays = 0;

    leaveRequests.forEach(request => {
      const leaveType = request.leaveType || request.leave_type;
      const startDate = new Date(request.startDate || request.start_date);
      const endDate = new Date(request.endDate || request.end_date);
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      // Count leave types
      leaveTypeStats[leaveType] = (leaveTypeStats[leaveType] || 0) + 1;
      
      // Calculate total days per leave type
      totalDays[leaveType] = (totalDays[leaveType] || 0) + days;
      
      totalLeaveDays += days;
    });

    return {
      totalRequests: leaveRequests.length,
      leaveTypeStats,
      totalDays,
      totalLeaveDays,
      approvedRequests: leaveRequests.filter(r => r.status === 'approved').length,
      pendingRequests: leaveRequests.filter(r => r.status === 'pending').length,
      rejectedRequests: leaveRequests.filter(r => r.status === 'rejected').length
    };
  };

  const stats = calculateStatistics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="w-full px-0 py-0">
        {/* Back Button */}
        <div className="p-6">
          <button
            onClick={() => navigate('/leave-request')}
            className="flex items-center gap-2 text-green-600 hover:text-green-800 transition-colors duration-200 font-medium"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back
          </button>
        </div>
        
        {/* Leave Summary Content */}
        <div className="w-full max-w-7xl mx-auto px-6 pb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-8">
              {/* Header */}
              <div className="mb-8 text-center">
               
                
              
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-green-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading leave summary...</p>
                </div>
              )}

              {/* Table Content */}
              {!loading && (
                <div>
                  {leaveRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-4xl text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-500">No data to display</p>
                        <p className="text-sm mt-2 text-gray-400">No leave requests have been submitted yet.</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Overall Statistics */}
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Overall Statistics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.totalRequests}</div>
                            <div className="text-sm text-gray-600">Total Requests</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.approvedRequests}</div>
                            <div className="text-sm text-gray-600">Approved</div>
                          </div>
                          <div className="bg-yellow-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
                            <div className="text-sm text-gray-600">Pending</div>
                          </div>
                          <div className="bg-red-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.rejectedRequests}</div>
                            <div className="text-sm text-gray-600">Rejected</div>
                          </div>
                        </div>
                      </div>

                      {/* Leave Type Statistics */}
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Leave Type Statistics</h3>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                                <th className="px-4 py-3 text-left font-semibold">Leave Type</th>
                                <th className="px-4 py-3 text-center font-semibold">Times Applied</th>
                                <th className="px-4 py-3 text-center font-semibold">Total Days</th>
                                <th className="px-4 py-3 text-center font-semibold">Average Days</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(stats.leaveTypeStats).map(([leaveType, count]) => (
                                <tr key={leaveType} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="px-4 py-3">
                                    <span className="font-medium text-gray-900">{leaveType}</span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                                      {count}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="font-semibold text-gray-700">{stats.totalDays[leaveType]}</span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="text-gray-600">
                                      {(stats.totalDays[leaveType] / count).toFixed(1)}
                                    </span>
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
              )}

              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaveSummary;
