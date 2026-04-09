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
    // Initialize with cached data immediately for instant display
    const cachedData = localStorage.getItem('leaveRequestsCache');
    const backupData = localStorage.getItem('leaveRequestsBackup');
    const sessionData = sessionStorage.getItem('leaveRequestsSession');
    
    let dataLoaded = false;
    
    // Try primary cache first
    if (cachedData) {
      try {
        const parsedCache = JSON.parse(cachedData);
        console.log("Initializing with cached data:", parsedCache.length, "leave requests");
        setLeaveRequests(parsedCache);
        dataLoaded = true;
      } catch (cacheError) {
        console.log("Failed to parse cache on init:", cacheError);
      }
    }
    
    // Try backup data if primary failed
    if (backupData && !dataLoaded) {
      try {
        const parsedBackup = JSON.parse(backupData);
        console.log("Loading from backup data on init:", parsedBackup.length, "leave requests");
        setLeaveRequests(parsedBackup);
        dataLoaded = true;
      } catch (backupError) {
        console.log("Failed to parse backup on init:", backupError);
      }
    }
    
    // Try session storage if others failed
    if (sessionData && !dataLoaded) {
      try {
        const parsedSession = JSON.parse(sessionData);
        console.log("Loading from session data on init:", parsedSession.length, "leave requests");
        setLeaveRequests(parsedSession);
        dataLoaded = true;
      } catch (sessionError) {
        console.log("Failed to parse session on init:", sessionError);
      }
    }
    
    if (!dataLoaded) {
      console.log("No cached data found on initialization, will load from API");
    }
    
    // Initial load
    loadLeaveRequests();
    
    // Check for any recent storage changes immediately
    setTimeout(() => {
      checkStorageChanges();
    }, 1000);
    
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
    
    // 4. Auto-refresh every 30 seconds (reduced to prevent blinking)
    const interval = setInterval(() => {
      console.log("Auto-refresh triggered - refreshing data");
      loadLeaveRequests();
      // Also check for storage changes
      checkStorageChanges();
    }, 30000);
    
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
      }, 10000); // 10 seconds after last mouse movement
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
    
    // 9. Refresh when storage changes (another tab updates data)
    const handleStorageChange = (e) => {
      console.log("Storage event detected:", e.key, e.newValue, e.oldValue);
      if (e.key && (e.key.includes('leave') || e.key.includes('Leave'))) {
        console.log("Leave-related storage changed - refreshing data");
        loadLeaveRequests();
      }
    };
    
    // Also check for storage changes periodically
    const checkStorageChanges = () => {
      const lastUpdate = localStorage.getItem('leaveRequestUpdated');
      const lastAction = localStorage.getItem('leaveRequestAction');
      if (lastUpdate && lastAction) {
        console.log("Storage check - found updates:", { lastUpdate, lastAction });
        loadLeaveRequests();
        // Clear after processing
        localStorage.removeItem('leaveRequestUpdated');
        localStorage.removeItem('leaveRequestAction');
      }
    };
    
    // 10. Refresh on page scroll (user actively viewing)
    let scrollTimer;
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        console.log("Page scrolled - refreshing data");
        loadLeaveRequests();
      }, 15000); // 15 seconds after scroll
    };
    
    // 11. More frequent storage check for leave changes
    const storageCheckInterval = setInterval(() => {
      checkStorageChanges();
    }, 5000); // Every 5 seconds
    
    // Add all event listeners for comprehensive coverage
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyPress);
    window.addEventListener('online', handleOnline);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(mouseTimer);
      clearTimeout(scrollTimer);
      clearInterval(interval);
      clearInterval(storageCheckInterval);
    };
  }, []);

  const loadLeaveRequests = async () => {
    // Don't show loading state if we already have data (for quick refreshes)
    const hasExistingData = leaveRequests.length > 0;
    if (!hasExistingData) {
      setLoading(true);
    }
    
    try {
      // 🔄 IDENTITY SYNC: Ensure 1000% permanence across sessions/devices
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (savedUser.email) {
         if (!localStorage.getItem('permanentEmail')) localStorage.setItem('permanentEmail', savedUser.email);
         if (!localStorage.getItem('permanentName')) localStorage.setItem('permanentName', savedUser.name || savedUser.username);
         if (!localStorage.getItem('permanentStudentId')) localStorage.setItem('permanentStudentId', savedUser.studentId || savedUser.username);
         if (!localStorage.getItem('permanentPhone')) localStorage.setItem('permanentPhone', savedUser.phone || "");
      }

      const token = localStorage.getItem('access');
      if (!token) {
        console.log("No token found - user not logged in");
        // Don't clear existing data, just keep what we have
        setLoading(false);
        return;
      }

      // Get current user's credentials
      const userName = localStorage.getItem('permanentName');
      const userStudentId = localStorage.getItem('permanentStudentId');
      const userPhone = localStorage.getItem('permanentPhone');
      
      if (!userName || !userStudentId || !userPhone) {
        console.log("User credentials not found - keeping existing data");
        // Don't clear existing data, just keep what we have
        if (!hasExistingData) {
          setLoading(false);
        }
        return;
      }
      
      // Try to load cached data first for immediate display
      const cachedData = localStorage.getItem('leaveRequestsCache');
      const backupData = localStorage.getItem('leaveRequestsBackup');
      const sessionData = sessionStorage.getItem('leaveRequestsSession');
      
      // Always try to load from any available storage
      let dataLoaded = false;
      
      // Try primary cache first
      if (cachedData) {
        try {
          const parsedCache = JSON.parse(cachedData);
          console.log("Using cached data for immediate display:", parsedCache.length, "requests");
          setLeaveRequests(parsedCache);
          dataLoaded = true;
        } catch (cacheError) {
          console.log("Cache parsing error, trying backup");
        }
      }
      
      // Try backup cache if primary failed
      if (backupData && !dataLoaded) {
        try {
          const parsedBackup = JSON.parse(backupData);
          console.log("Using backup data for immediate display:", parsedBackup.length, "requests");
          setLeaveRequests(parsedBackup);
          dataLoaded = true;
        } catch (backupError) {
          console.log("Backup parsing error, trying session");
        }
      }
      
      // Try session storage if others failed
      if (sessionData && !dataLoaded) {
        try {
          const parsedSession = JSON.parse(sessionData);
          console.log("Using session data for immediate display:", parsedSession.length, "requests");
          setLeaveRequests(parsedSession);
          dataLoaded = true;
        } catch (sessionError) {
          console.log("Session parsing error, proceeding with API call");
        }
      }
      
      // If no cached data found, still proceed with API call
      if (!dataLoaded) {
        console.log("No cached data found, loading from API");
      }
      
      // Try different endpoints to find the leave requests data
      const endpoints = [
        `http://${window.location.hostname}:8000/api/leave-requests/`,
        `http://${window.location.hostname}:8000/api/leave-requests/all/`,
        `http://${window.location.hostname}:8000/api/leave-requests/list/`,
        `http://${window.location.hostname}:8000/api/leave/all/`,
        `http://${window.location.hostname}:8000/api/leaves/`
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
        // Filter requests for current user only - IDENTITY-AWARE ROBUST FILTERING
        const userRequests = data.filter(request => {
          if (!request) return false;

          // Normalize Request Data
          const rName = (request.name || "").toString().trim().toLowerCase();
          const rEmail = (request.email || "").toString().trim().toLowerCase();
          const rId = (request.student_id || "").toString().trim();
          
          // Normalize Session Data
          const sName = (userName || "").toString().trim().toLowerCase();
          const sEmail = (localStorage.getItem('permanentEmail') || "").toString().trim().toLowerCase();
          const sId = (userStudentId || "").toString().trim();

          // IDENTITY-AWARE MATCH: Link history via Email + (Name or ID)
          const matchesEmail = rEmail && sEmail && rEmail === sEmail;
          const matchesName = rName && sName && rName === sName;
          const matchesId = rId && sId && rId === sId;

          return matchesEmail && (matchesName || matchesId);
        });
        
        console.log(`Found ${userRequests.length} requests for user: ${userName}`);
        setLeaveRequests(userRequests);
        
        // Cache the filtered data for persistence
        try {
          // Primary cache
          localStorage.setItem('leaveRequestsCache', JSON.stringify(userRequests));
          localStorage.setItem('leaveRequestsCacheTime', Date.now().toString());
          
          // Backup cache (permanent storage)
          localStorage.setItem('leaveRequestsBackup', JSON.stringify(userRequests));
          localStorage.setItem('leaveRequestsBackupTime', Date.now().toString());
          
          // Session storage backup (survives page refresh)
          sessionStorage.setItem('leaveRequestsSession', JSON.stringify(userRequests));
          
          console.log("Data cached permanently with multiple backups");
        } catch (cacheError) {
          console.log("Failed to cache data:", cacheError);
        }
        
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
        // Don't clear existing data if API returns no data
        console.log('No new data found from API, keeping existing data');
        // Only set empty if we have no existing data
        if (leaveRequests.length === 0) {
          console.log('No existing data, setting empty array');
          setLeaveRequests([]);
        }
      }
    } catch (error) {
      console.error('Error loading leave requests:', error);
      // Don't clear existing data on error, keep what we have
      console.log('Error occurred, keeping existing data');
    } finally {
      // Only set loading false if we set it to true initially
      if (!hasExistingData) {
        setLoading(false);
      }
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
      // doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
      
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
      console.error(`There was an issue generating the PDF: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 font-sans overflow-hidden z-50" style={{ 
      position: 'fixed', 
      top: '0px', 
      left: '0px', 
      right: '0px', 
      bottom: '0px', 
      width: '100vw', 
      height: '100vh',
      margin: '0px',
      padding: '0px',
      boxSizing: 'border-box',
      transform: 'translateZ(0)',
      willChange: 'transform'
    }}>
      <div className="h-full w-full flex flex-col" style={{ 
        width: '100%', 
        height: '100%',
        margin: '0px',
        padding: '0px',
        boxSizing: 'border-box',
        transform: 'translateZ(0)',
        willChange: 'transform'
      }}>
        {/* Main Content - Full height remaining */}
        <div className="flex-1 overflow-y-auto" style={{ 
          margin: '0px',
          padding: '0px',
          boxSizing: 'border-box',
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}>
          <div className="w-full h-full" style={{ 
            margin: '0px',
            padding: '0px',
            boxSizing: 'border-box',
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}>
            
            {/* Leave Summary Content - Full Width */}
            <div className="w-full" style={{ 
              margin: '0px',
              padding: '0px',
              boxSizing: 'border-box',
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}>
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden" style={{ 
                margin: '0px',
                padding: '0px',
                boxSizing: 'border-box',
                transform: 'translateZ(0)',
                willChange: 'transform'
              }}>
                <div className="p-8">
                  
                  {/* Header with Back Button and Download - Full Width */}
                  <div className="flex justify-between items-center px-4 py-4 bg-white border-b border-gray-200">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => navigate('/dashboard/leave-request')} 
                        className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm"
                      >
                        <FontAwesomeIcon icon={faArrowLeft} />
                      </button>
                      <h2 className="text-3xl font-bold text-gray-800">Leave Summary Report</h2>
                    </div>
                    <div className="flex items-center">
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

                  {/* Summary Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">{stats.totalRequests}</div>
                        <div className="text-sm text-blue-700 font-medium">Total Requests</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">{stats.approvedRequests}</div>
                        <div className="text-sm text-green-700 font-medium">Approved</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.pendingRequests}</div>
                        <div className="text-sm text-yellow-700 font-medium">Pending</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-600 mb-1">{stats.rejectedRequests}</div>
                        <div className="text-sm text-red-700 font-medium">Rejected</div>
                      </div>
                    </div>
                  </div>

                  {/* Loading State */}
                  {loading && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 border-4 border-green-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading leave summary...</p>
                    </div>
                  )}

                  {/* Beautiful Leave History Table */}
                  {!loading && (
                    <div className="mt-8">
                      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-600" />
                            Leave Request History
                          </h3>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Period</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {leaveRequests.length > 0 ? (
                                leaveRequests.map((request, index) => {
                                  const startDate = request.startDate || request.start_date || '';
                                  const endDate = request.endDate || request.end_date || '';
                                  const formattedStart = startDate ? new Date(startDate).toLocaleDateString() : 'N/A';
                                  const formattedEnd = endDate ? new Date(endDate).toLocaleDateString() : 'N/A';
                                  const dateRange = formattedStart === formattedEnd ? formattedStart : `${formattedStart} - ${formattedEnd}`;
                                  
                                  return (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                                            <FontAwesomeIcon icon={faUser} className="text-blue-600 text-sm" />
                                          </div>
                                          <div>
                                            <div className="font-semibold text-gray-900">{request.name || 'N/A'}</div>
                                            <div className="text-xs text-gray-400 mt-1">{request.student_id || request.studentId || 'N/A'}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="font-mono text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">{request.student_id || request.studentId || 'N/A'}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                          <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-sm" />
                                          <span className="text-sm text-gray-700">{dateRange}</span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800">
                                          {request.leaveType || request.leave_type || 'N/A'}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600 line-clamp-2 max-w-xs" title={request.reason || 'No reason provided'}>
                                          {request.reason || 'No reason provided'}
                                        </p>
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold ${
                                          request.status === 'Approved' || request.status === 'approved' 
                                            ? 'bg-green-100 text-green-800 border border-green-300' 
                                            : request.status === 'Rejected' || request.status === 'rejected'
                                            ? 'bg-red-100 text-red-800 border border-red-300'
                                            : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                        }`}>
                                          {request.status === 'Approved' || request.status === 'approved' 
                                            ? '✓ Approved' 
                                            : request.status === 'Rejected' || request.status === 'rejected'
                                            ? '✗ Rejected'
                                            : '⏳ Pending'
                                          }
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan="6" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center">
                                      <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-300 text-4xl mb-4" />
                                      <p className="text-gray-500 text-lg font-medium">No leave requests found</p>
                                      <p className="text-gray-400 text-sm mt-2">Your leave history will appear here once you submit requests</p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
  );
}

export default LeaveSummary;
