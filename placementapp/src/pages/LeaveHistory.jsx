import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faUser, faFileAlt, faClock, faDownload, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function LeaveHistory() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyCleared, setHistoryCleared] = useState(false);

  const leaveTypeMap = {
    'CL': 'Casual Leave',
    'SL': 'Sick / Medical Leave',
    'EL': 'Earned Leave',
    'PTO': 'Paid Time Off',
    'ML': 'Maternity Leave',
    'PL': 'Paternity Leave',
    'BL': 'Bereavement Leave',
    'CO': 'Compensatory Off',
    'PH': 'Public Holidays',
    'LWP': 'Leave Without Pay',
    'WFH': 'Work From Home',
    'SAB': 'Sabbatical Leave',
    'MRL': 'Marriage Leave',
    'STL': 'Study / Exam Leave'
  };

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
    
    console.log("=== ALL OLD DATA CLEARED FROM HISTORY - FRESH START ===");
  };

  // Load requests on component mount
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      // Don't reload if history was cleared by user
      if (historyCleared) {
        console.log("History was cleared by user - skipping automatic reload");
        return;
      }
      
      setLoading(true);
      
      // 🔄 IDENTITY SYNC: Ensure 1000% permanence across sessions/devices
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (savedUser.email) {
         if (!localStorage.getItem('permanentEmail')) localStorage.setItem('permanentEmail', savedUser.email);
         if (!localStorage.getItem('permanentName')) localStorage.setItem('permanentName', savedUser.name || savedUser.username);
         if (!localStorage.getItem('permanentStudentId')) localStorage.setItem('permanentStudentId', savedUser.studentId || savedUser.username);
         if (!localStorage.getItem('permanentPhone')) localStorage.setItem('permanentPhone', savedUser.phone || "");
      }

      const token = localStorage.getItem("access");
      if (!token) {
        console.log("No token found - user not logged in");
        setLoading(false);
        return;
      }

      // Get current user's credentials
      const userName = localStorage.getItem('permanentName');
      const userStudentId = localStorage.getItem('permanentStudentId');
      const userPhone = localStorage.getItem('permanentPhone');
      
      if (!userName || !userStudentId || !userPhone) {
        console.log("User credentials not found - showing empty history");
        setRequests([]);
        setLoading(false);
        return;
      }
      
      const response = await fetch(`http://${window.location.hostname}:8000/api/leave-requests/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        console.error("Failed to load requests");
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      const allRequests = data.data || data || [];
      
      // Filter requests for current user only - IDENTITY-AWARE ROBUST FILTERING
      const userRequests = allRequests.filter(request => {
        if (!request) return false;
        
        // Normalize Request Data
        const rName = (request.name || "").toString().trim().toLowerCase();
        const rEmail = (request.email || "").toString().trim().toLowerCase();
        const rId = (request.student_id || "").toString().trim();
        
        // Normalize Session Data
        const sName = (userName || "").toString().trim().toLowerCase();
        const sEmail = (localStorage.getItem('permanentEmail') || "").toString().trim().toLowerCase();
        const sId = (userStudentId || "").toString().trim();

        // IDENTITY-AWARE MATCH: Show if Email matches AND (Name matches OR ID matches)
        // This ensures the student sees their history even if they typoed their ID or it changed.
        const matchesEmail = rEmail && sEmail && rEmail === sEmail;
        const matchesName = rName && sName && rName === sName;
        const matchesId = rId && sId && rId === sId;

        return matchesEmail && (matchesName || matchesId);
      });
      
      console.log(`Found ${userRequests.length} requests for user: ${userName}`);
      setRequests(userRequests);
      
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
      };

  const handleDownloadPDF = (request) => {
    const doc = new jsPDF();
    
    // Add custom font for better appearance
    doc.addFont('helvetica', 'helvetica', 'normal');
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Leave Request', 105, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Leave Request Details
    let yPosition = 50;
    const details = [
      `Name: ${request.name}`,
      `Email: ${request.email}`,
      `Phone: ${request.phone}`,
      `Student ID: ${request.student_id}`,
      `Leave Type: ${request.leave_type}`,
      `Start Date: ${request.start_date}`,
      `End Date: ${request.end_date}`,
      `Status: ${request.status}`,
      `Reason: ${request.reason}`
    ];
    
    details.forEach(detail => {
      doc.text(detail, 20, yPosition);
      yPosition += 10;
    });
    
    // Status Badge
    if (request.status === 'Approved') {
      doc.setFillColor(0, 128, 0);
    } else if (request.status === 'Pending') {
      doc.setFillColor(255, 193, 7);
    } else {
      doc.setFillColor(239, 68, 68);
    }
    
    doc.rect(20, yPosition + 5, 60, 12, 'F');
    doc.setFillColor(255, 255, 255);
    doc.setTextColor(request.status === 'Approved' ? 0 : request.status === 'Pending' ? 0 : 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(request.status, 50, yPosition + 12, { align: 'center' });
    
    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    
    // Add footer
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 270, 170, 20, 'F');
    
    // Add footer text
    doc.text('Generated on ' + new Date().toLocaleDateString(), 105, 280, { align: 'center' });
    
    // Save the PDF
    doc.save(`leave-request-${request.name}-${request.start_date}.pdf`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading leave history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#F8FAFC] font-sans overflow-hidden z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}>
      <div className="h-full w-full flex flex-col" style={{ width: '100%', height: '100%' }}>

        {/* Back Button - Fixed Position */}
        <div className="absolute top-4 left-4 z-50">
          <button 
            onClick={() => navigate('/dashboard/leave-request')} 
            className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        </div>

        {/* Main Content - Full height remaining */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 pb-6 pt-16">
          <div className="w-full h-full max-w-full">
            {requests.length === 0 ? (
              <div className="h-full min-h-[400px] flex items-center justify-center">
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-8 sm:p-12 text-center max-w-md w-full mx-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-400 text-2xl sm:text-3xl" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">No Leave Requests Found</h3>
                  <p className="text-sm text-slate-500 mb-6 sm:mb-8">You haven't submitted any leave requests yet. Your future requests will appear here.</p>
                  <button
                    onClick={() => navigate('/dashboard/leave-request/new')}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200 text-sm"
                  >
                    Submit New Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-4 sm:space-y-5 w-full">
                {requests.map((req, index) => (
                  <div key={index} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] transition-all duration-300 w-full min-w-0">
                    <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 sm:gap-6 xl:gap-8 w-full">
                       
                      {/* Left Section: Icon & Main Details */}
                      <div className="flex gap-3 sm:gap-4 items-start w-full min-w-0">
                         <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border ${
                            req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            req.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-rose-50 text-rose-600 border-rose-100'
                         }`}>
                           <FontAwesomeIcon icon={faFileAlt} className="text-lg sm:text-xl" />
                         </div>
                         
                         <div className="flex-1 min-w-0 w-full">
                           <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1 truncate w-full">{leaveTypeMap[req.leave_type] || req.leave_type}</h3>
                           <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-2 text-xs sm:text-sm text-slate-500 font-medium w-full">
                             <span className="flex items-center gap-1 sm:gap-1.5 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md truncate">
                               <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-400" /> 
                               <span className="truncate">{req.start_date}</span>
                               <span className="text-slate-300 mx-1">&rarr;</span> 
                               <span className="truncate">{req.end_date}</span>
                             </span>
                           </div>
                         </div>
                      </div>

                      {/* Right Section: Status Badge */}
                      <div className="flex flex-col items-start xl:items-end shrink-0 ml-12 xl:ml-0">
                         <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full border ${
                           req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' :
                           req.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm' :
                           'bg-rose-50 text-rose-700 border-rose-200 shadow-sm'
                         }`}>
                           {req.status}
                         </span>
                         {req.status === 'Approved' && (
                           <span className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wider hidden sm:block">Verified System Record</span>
                         )}
                      </div>
                    </div>

                    {/* Bottom Section: Reason and User Details */}
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-100 grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] gap-3 sm:gap-4 xl:gap-6">
                       <div className="bg-slate-50/50 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-100/80 min-h-[80px] sm:min-h-[120px]">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 sm:mb-1.5">Reason for Leave</span>
                         <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed line-clamp-3 sm:line-clamp-none">"{req.reason}"</p>
                       </div>
                       
                       <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs h-fit self-end pb-1 justify-start xl:justify-end content-start w-full max-w-full">
                         <div className="bg-slate-50 border border-slate-100 shadow-sm text-slate-600 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center gap-1 sm:gap-2 flex-shrink-0">
                           <span className="text-slate-400 font-medium text-[10px] sm:text-xs">Name:</span> 
                           <span className="font-semibold text-slate-700 text-xs truncate max-w-[80px] sm:max-w-none">{req.name}</span>
                         </div>
                         <div className="bg-slate-50 border border-slate-100 shadow-sm text-slate-600 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center gap-1 sm:gap-2 flex-shrink-0">
                           <span className="text-slate-400 font-medium text-[10px] sm:text-xs">ID:</span> 
                           <span className="font-semibold text-slate-700 text-xs truncate max-w-[60px] sm:max-w-none">{req.student_id}</span>
                         </div>
                         <div className="bg-slate-50 border border-slate-100 shadow-sm text-slate-600 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center gap-1 sm:gap-2 flex-shrink-0">
                           <span className="text-slate-400 font-medium text-[10px] sm:text-xs">Email:</span> 
                           <span className="font-semibold text-slate-700 text-xs truncate max-w-[100px] sm:max-w-none">{req.email || 'N/A'}</span>
                         </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaveHistory;
