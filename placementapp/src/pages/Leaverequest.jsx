import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faFileAlt, faPlus, faClock, faEye, faShieldAlt } from "@fortawesome/free-solid-svg-icons";

function LeaveRequest() {
  const navigate = useNavigate();

  // State for leave summary data
  const [leaveSummary, setLeaveSummary] = useState({
    totalApplied: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    approvalRate: 0,
    medicalLeaves: 0,
    personalLeaves: 0
  });

  // 🚀 PERFORMANCE: Memoized Filtering Logic
  useEffect(() => {
    const loadLeaveSummary = async () => {
      try {
        const token = localStorage.getItem('access');
        
        // 🔄 IDENTITY SYNC
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (savedUser.email) {
           if (!localStorage.getItem('permanentEmail')) localStorage.setItem('permanentEmail', savedUser.email);
           if (!localStorage.getItem('permanentStudentId')) localStorage.setItem('permanentStudentId', savedUser.studentId || savedUser.username);
        }

        const userStudentId = localStorage.getItem('permanentStudentId');
        const sEmail = (localStorage.getItem('permanentEmail') || "").toString().trim().toLowerCase();

        const response = await fetch(`http://${window.location.hostname}:8000/api/leave-requests/`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (response.ok) {
          const data = await response.json();
          const allRequests = data.data || [];
          
          const requests = allRequests.filter(r => {
             if (!r) return false;
             const rEmail = (r.email || "").toString().trim().toLowerCase();
             const rId = (r.student_id || "").toString().trim();
             return (rEmail && sEmail && rEmail === sEmail) || (rId && userStudentId && rId === userStudentId);
          });
          
          const approved = requests.filter(r => r.status === 'Approved').length;
          const total = requests.length;

          setLeaveSummary({
            totalApplied: total,
            approved,
            pending: requests.filter(r => r.status === 'Pending').length,
            rejected: requests.filter(r => r.status === 'Rejected').length,
            approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
            medicalLeaves: requests.filter(r => r.leave_type === 'SL').length,
            personalLeaves: requests.filter(r => r.leave_type === 'CL').length
          });
        }
      } catch (error) {
        console.error('Error loading leave summary:', error);
      }
    };

    loadLeaveSummary();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="w-full px-0 py-0">
        {/* Header - Fixed to match photo */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-0">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 my-0 py-2 font-sans tracking-tight">
                Leave Management System
              </h1>
            </div>
          </div>
        </div>

        {/* Cards Container - Restored to original 3 big cards layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-6 py-8">
          
          {/* New Leave Request Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:border-sky-400 group h-[450px] flex flex-col">
            <div className="bg-gradient-to-r from-sky-500 to-sky-600 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400 rounded-full -mr-16 -mt-16 opacity-20"></div>
              <h2 className="text-xl font-bold text-white mb-2 font-sans relative z-10">
                New Leave Request
              </h2>
              <div className="flex items-center gap-2 text-sky-100 text-sm relative z-10">
                <div className="w-2 h-2 bg-sky-200 rounded-full"></div>
                <span>Submit Application</span>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4 flex-1">
                <div className="flex items-start gap-3 text-slate-600">
                  <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-sky-600 text-sm" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-800">Apply for Leave</span>
                    <p className="text-xs text-slate-500 mt-0.5">Medical, personal, or academic leave</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-slate-600">
                  <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FontAwesomeIcon icon={faFileAlt} className="text-sky-600 text-sm" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-800">Quick Process</span>
                    <p className="text-xs text-slate-500 mt-0.5">Streamlined application workflow</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-slate-600">
                  <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FontAwesomeIcon icon={faClock} className="text-sky-600 text-sm" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-800">Real-time Tracking</span>
                    <p className="text-xs text-slate-500 mt-0.5">Monitor request status instantly</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/leave-request/new')}
                className="w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-sky-600 hover:to-sky-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 h-12 group-hover:scale-[1.02]"
              >
                <FontAwesomeIcon icon={faPlus} />
                Create New Request
              </button>
            </div>
          </div>

          {/* My Leave History Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:border-emerald-500 group h-[450px] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400 rounded-full -mr-16 -mt-16 opacity-20"></div>
              <h2 className="text-xl font-bold text-white mb-2 font-sans relative z-10">
                My Leave History
              </h2>
              <div className="flex items-center gap-2 text-emerald-100 text-sm relative z-10">
                <div className="w-2 h-2 bg-emerald-200 rounded-full"></div>
                <span>View Records</span>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4 flex-1">
                <div className="flex items-start gap-3 text-slate-600">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FontAwesomeIcon icon={faFileAlt} className="text-emerald-600 text-sm" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-800">Previous Requests</span>
                    <p className="text-xs text-slate-500 mt-0.5">Access all leave applications</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-slate-600">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-emerald-600 text-sm" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-800">Status Tracking</span>
                    <p className="text-xs text-slate-500 mt-0.5">Check pending applications</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-slate-600">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FontAwesomeIcon icon={faClock} className="text-emerald-600 text-sm" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-800">Download Receipts</span>
                    <p className="text-xs text-slate-500 mt-0.5">Export request documentation</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/leave-request/history')}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 h-12 group-hover:scale-[1.02]"
              >
                <FontAwesomeIcon icon={faCalendarAlt} />
                View Leave History
              </button>
            </div>
          </div>

          {/* Leave Summary Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:border-violet-500 group h-[450px] flex flex-col">
            <div className="bg-gradient-to-r from-violet-500 to-violet-600 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-400 rounded-full -mr-16 -mt-16 opacity-20"></div>
              <h2 className="text-xl font-bold text-white mb-2 font-sans relative z-10">
                Leave Summary
              </h2>
              <div className="flex items-center gap-2 text-violet-100 text-sm relative z-10">
                <div className="w-2 h-2 bg-violet-200 rounded-full"></div>
                <span>Analytics Dashboard</span>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4 flex-1">
                <div className="flex items-start gap-3 text-slate-600">
                  <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-4 h-4 bg-violet-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-800">Centralized Tracking</span>
                    <p className="text-xs text-slate-500 mt-0.5">All requests in one place</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-slate-600">
                  <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-4 h-4 bg-violet-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-800">Statistics</span>
                    <p className="text-xs text-slate-500 mt-0.5">Comprehensive analytics</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-slate-600">
                  <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-4 h-4 bg-violet-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-800">Monitoring</span>
                    <p className="text-xs text-slate-500 mt-0.5">History & approval status</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/leave-request/summary')}
                className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-violet-600 hover:to-violet-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 h-12 group-hover:scale-[1.02]"
              >
                <FontAwesomeIcon icon={faEye} />
                View Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaveRequest;
