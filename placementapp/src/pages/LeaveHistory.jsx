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
      
      const response = await fetch("http://127.0.0.1:8000/api/leave-requests/", {
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
      
      // Filter requests for current user only
      const userRequests = allRequests.filter(request => {
        return request.name === userName && 
               request.student_id.toString() === userStudentId.toString() &&
               request.phone.toString() === userPhone.toString();
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading leave history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Simple elegant header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/leave-request')} 
            className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm shrink-0"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave History</h1>
            <p className="text-sm text-slate-500 mt-1">Review your previously submitted leave applications</p>
          </div>
        </div>

        {/* Main Content */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-12 text-center mt-6">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-400 text-3xl" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Leave Requests Found</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm">You haven't submitted any leave requests yet. Your future requests will appear here.</p>
            <button
              onClick={() => navigate('/leave-request/new')}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200 text-sm"
            >
              Submit New Request
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req, index) => (
               <div key={index} className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] transition-all duration-300">
                 <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    
                    {/* Left Section: Icon & Main Details */}
                    <div className="flex gap-4 items-start">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                          req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          req.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-rose-50 text-rose-600 border-rose-100'
                       }`}>
                         <FontAwesomeIcon icon={faFileAlt} className="text-xl" />
                       </div>
                       
                       <div>
                         <h3 className="text-lg font-semibold text-slate-900 mb-1">{leaveTypeMap[req.leave_type] || req.leave_type}</h3>
                         <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500 font-medium">
                           <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                             <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-400 text-xs" /> 
                             {req.start_date} 
                             <span className="text-slate-300 mx-1">&rarr;</span> 
                             {req.end_date}
                           </span>
                         </div>
                       </div>
                    </div>

                    {/* Right Section: Status Badge */}
                    <div className="flex flex-col items-start md:items-end shrink-0 ml-16 md:ml-0">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                        req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' :
                        req.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm' :
                        'bg-rose-50 text-rose-700 border-rose-200 shadow-sm'
                      }`}>
                        {req.status}
                      </span>
                      {req.status === 'Approved' && (
                        <span className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wider">Verified System Record</span>
                      )}
                    </div>
                 </div>

                 {/* Bottom Section: Reason and User Details */}
                 <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Reason for Leave</span>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">"{req.reason}"</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-xs h-fit self-end pb-1 justify-start md:justify-end">
                      <div className="bg-slate-50 border border-slate-100 shadow-sm text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <span className="text-slate-400 font-medium">Name:</span> 
                        <span className="font-semibold text-slate-700">{req.name}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 shadow-sm text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <span className="text-slate-400 font-medium">ID:</span> 
                        <span className="font-semibold text-slate-700">{req.student_id}</span>
                      </div>
                    </div>
                 </div>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveHistory;
