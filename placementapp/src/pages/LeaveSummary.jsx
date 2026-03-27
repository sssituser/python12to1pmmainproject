import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCalendarAlt, faUser, faEnvelope, faPhone, faDownload, faSpinner } from "@fortawesome/free-solid-svg-icons";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function LeaveSummary() {
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

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

  // Load leave requests on component mount and add comprehensive refresh mechanism
  useEffect(() => {
    loadLeaveRequests();
    
    // Multiple refresh mechanisms for universal updates
    
    // 1. Refresh when page becomes visible (tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Page became visible - refreshing data");
        loadLeaveRequests();
      }
    };
    
    // 2. Refresh when window gets focus (user returns to browser)
    const handleFocus = () => {
      console.log("Window got focus - refreshing data");
      loadLeaveRequests();
    };
    
    // 3. Refresh when window becomes active (user switches applications)
    const handleBlur = () => {
      setTimeout(() => {
        console.log("Window became active - refreshing data");
        loadLeaveRequests();
      }, 1000);
    };
    
    // 4. Auto-refresh every 10 seconds (reduced for real-time updates)
    const interval = setInterval(() => {
      console.log("Auto-refresh triggered - refreshing data");
      loadLeaveRequests();
    }, 10000);
    
    // 5. Refresh when user interacts with page
    const handleClick = () => {
      console.log("Page clicked - refreshing data");
      loadLeaveRequests();
    };
    
    // 6. Refresh on mouse movement (indicates user activity)
    let mouseTimer;
    const handleMouseMove = () => {
      clearTimeout(mouseTimer);
      mouseTimer = setTimeout(() => {
        console.log("User activity detected - refreshing data");
        loadLeaveRequests();
      }, 5000); // 5 seconds after last mouse movement
    };
    
    // 7. Refresh on keyboard activity
    const handleKeyPress = () => {
      console.log("Keyboard activity - refreshing data");
      loadLeaveRequests();
    };
    
    // 8. Network connectivity check - refresh when connection is restored
    const handleOnline = () => {
      console.log("Network restored - refreshing data");
      loadLeaveRequests();
    };
    
    // Add all event listeners for comprehensive coverage
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyPress);
    window.addEventListener('online', handleOnline);
    
    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('online', handleOnline);
      clearTimeout(mouseTimer);
      clearInterval(interval);
    };
  }, []);

  const loadLeaveRequests = async () => {
    // Don't show loading state for manual refresh
    // setLoading(true);
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
        // Filter requests for current user only - SECURITY: Ensures students see only their own data
        const userRequests = data.filter(request => {
          const nameMatch = request.name === userName;
          const idMatch = request.student_id.toString() === userStudentId.toString();
          const phoneMatch = request.phone.toString() === userPhone.toString();
          
          // Security logging
          if (!nameMatch || !idMatch || !phoneMatch) {
            console.warn("Security: Request filtered out - User/ID/Phone mismatch:", {
              requestName: request.name,
              storedName: userName,
              requestId: request.student_id,
              storedId: userStudentId,
              requestPhone: request.phone,
              storedPhone: userPhone,
              nameMatch,
              idMatch,
              phoneMatch
            });
          }
          
          return nameMatch && idMatch && phoneMatch;
        });
        
        console.log(`Found ${userRequests.length} requests for user: ${userName}`);
        setLeaveRequests(userRequests);
        
        // Update last update timestamp
        const now = new Date();
        setLastUpdate(now);
        
        console.log(`📊 Statistics updated at ${now.toLocaleTimeString()}`);
        
        // Show browser notification for real-time updates
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Leave Statistics Updated', {
            body: `Found ${userRequests.length} leave requests`,
            icon: '/favicon.ico'
          });
        }
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

  // Calculate statistics - now memoized for performance
  const calculateStatistics = useCallback(() => {
    // Always return a stats object, even with no data
    const defaultStats = {
      totalRequests: 0,
      leaveTypeStats: {},
      totalDays: {},
      totalLeaveDays: 0,
      approvedRequests: 0,
      pendingRequests: 0,
      rejectedRequests: 0
    };

    if (leaveRequests.length === 0) return defaultStats;

    // Debug: Log the actual data to see what we're working with
    console.log("=== CALCULATING STATISTICS ===");
    console.log("Leave Requests Data:", leaveRequests);
    console.log("Status values:", leaveRequests.map(r => r.status));

    const leaveTypeStats = {};
    const totalDays = {};
    let totalLeaveDays = 0;
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

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

      // Count by status - handle different possible status values
      const status = (request.status || '').toLowerCase().trim();
      console.log(`Processing request with status: "${status}"`);
      
      if (status === 'approved' || status === 'approve') {
        approvedCount++;
      } else if (status === 'pending' || status === 'pending') {
        pendingCount++;
      } else if (status === 'rejected' || status === 'reject') {
        rejectedCount++;
      } else {
        // If status doesn't match expected values, log it and count as pending
        console.log(`Unknown status "${status}" for request:`, request);
        pendingCount++;
      }
    });

    const finalStats = {
      totalRequests: leaveRequests.length,
      leaveTypeStats,
      totalDays,
      totalLeaveDays,
      approvedRequests: approvedCount,
      pendingRequests: pendingCount,
      rejectedRequests: rejectedCount
    };

    console.log(`=== FINAL STATISTICS ===`);
    console.log(`Total Requests: ${finalStats.totalRequests}`);
    console.log(`Approved: ${finalStats.approvedRequests}`);
    console.log(`Pending: ${finalStats.pendingRequests}`);
    console.log(`Rejected: ${finalStats.rejectedRequests}`);
    console.log("========================");

    return finalStats;
  }, [leaveRequests]); // Dependency on leaveRequests array

  const stats = calculateStatistics();

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      console.log("Starting PDF generation with jsPDF...");
      
      // Initialize jsPDF
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Detailed Leave History Report', 105, 20, { align: 'center' });
      
      // Add generation date
      doc.setFontSize(12);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
      
      // Add summary section
      doc.setFontSize(14);
      doc.text('Summary Overview', 20, 50);
      
      doc.setFontSize(10);
      const summaryY = 60;
      doc.text(`Total Requests: ${stats.totalRequests}`, 20, summaryY);
      doc.text(`Approved: ${stats.approvedRequests}`, 20, summaryY + 10);
      doc.text(`Pending: ${stats.pendingRequests}`, 60, summaryY + 10);
      doc.text(`Rejected: ${stats.rejectedRequests}`, 100, summaryY + 10);
      
      // Add detailed leave history table
      doc.setFontSize(14);
      doc.text('Detailed Leave History', 20, summaryY + 30);
      
      if (leaveRequests.length > 0) {
        // Prepare table data
        const tableData = leaveRequests.map((request) => {
          const startDate = request.startDate || request.start_date || '';
          const endDate = request.endDate || request.end_date || '';
          const formattedStart = startDate ? new Date(startDate).toLocaleDateString() : 'N/A';
          const formattedEnd = endDate ? new Date(endDate).toLocaleDateString() : 'N/A';
          const dateRange = formattedStart === formattedEnd ? formattedStart : `${formattedStart} - ${formattedEnd}`;
          
          return [
            request.name || 'N/A',
            request.student_id || request.studentId || 'N/A',
            dateRange,
            request.leaveType || request.leave_type || 'N/A',
            request.reason || 'No reason provided',
            (request.status || 'pending').toUpperCase()
          ];
        });
        
        // Add table using autoTable
        autoTable(doc, {
          head: [['Employee Name', 'Employee ID', 'Date Range', 'Leave Type', 'Reason', 'Status']],
          body: tableData,
          startY: summaryY + 40,
          theme: 'grid',
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [76, 175, 80], // Green color
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          }
        });
      } else {
        doc.setFontSize(12);
        doc.text('No leave requests found', 105, summaryY + 50, { align: 'center' });
      }
      
      // Save the PDF
      doc.save('Detailed_Leave_History.pdf');
      
      console.log("PDF generated successfully with jsPDF");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`There was an issue generating the PDF: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div id="pdf-container" className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="w-full px-0 py-0">
        {/* Top Actions */}
        <div data-html2canvas-ignore="true" className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center print:hidden">
          <button
            onClick={() => navigate('/leave-request')}
            className="flex items-center gap-2 text-green-600 hover:text-green-800 transition-colors duration-200 font-medium"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back
          </button>
          
          <div className="flex gap-3 items-center">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className={`flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-2 rounded-xl transition-all duration-300 shadow-md font-medium ${isDownloading ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'}`}
            >
              <FontAwesomeIcon icon={isDownloading ? faSpinner : faDownload} className={isDownloading ? "animate-spin" : ""} />
              {isDownloading ? "Generating PDF..." : "Download"}
            </button>
          </div>
        </div>
        
        {/* Leave Summary Content */}
        <div className="w-full max-w-7xl mx-auto px-6 pb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-8">
              {/* Header */}
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Leave Summary Report</h2>
                <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
              </div>

              {/* Loading State */}
              {/* Only show loading on initial load, not on manual refresh */}
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
                        {Object.keys(stats.leaveTypeStats).length === 0 ? (
                          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                            <p className="text-gray-500">No leave type data available</p>
                          </div>
                        ) : (
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
                        )}
                      </div>

                      {/* Detailed Leave History */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Leave History</h3>
                        {leaveRequests.length === 0 ? (
                          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                            <p className="text-gray-500">No leave requests found</p>
                          </div>
                        ) : (
                          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gray-100 text-gray-700">
                                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                                  <th className="px-4 py-3 text-left font-semibold">ID</th>
                                  <th className="px-4 py-3 text-left font-semibold">Date Range</th>
                                  <th className="px-4 py-3 text-left font-semibold">Leave Type</th>
                                  <th className="px-4 py-3 text-left font-semibold">Reason</th>
                                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {leaveRequests.map((request, index) => {
                                  const startDate = request.startDate || request.start_date || '';
                                  const endDate = request.endDate || request.end_date || '';
                                  const formattedStart = startDate ? new Date(startDate).toLocaleDateString() : 'N/A';
                                  const formattedEnd = endDate ? new Date(endDate).toLocaleDateString() : 'N/A';
                                  const dateRange = formattedStart === formattedEnd ? formattedStart : `${formattedStart} - ${formattedEnd}`;

                                  return (
                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                      <td className="px-4 py-3 text-gray-700 font-medium">
                                        {request.name || 'N/A'}
                                      </td>
                                      <td className="px-4 py-3 text-gray-700">
                                        {request.student_id || request.studentId || 'N/A'}
                                      </td>
                                      <td className="px-4 py-3 text-gray-700 font-medium">
                                        {dateRange}
                                      </td>
                                      <td className="px-4 py-3 text-gray-700">
                                        {request.leaveType || request.leave_type || 'N/A'}
                                      </td>
                                      <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">
                                        {request.reason || 'No reason provided'}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                          'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {(request.status || 'pending').toUpperCase()}
                                        </span>
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
