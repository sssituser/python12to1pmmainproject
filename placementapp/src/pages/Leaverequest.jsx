import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faFileAlt, faPlus, faClock, faEye } from "@fortawesome/free-solid-svg-icons";

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

  // Load leave summary data
  useEffect(() => {
    const loadLeaveSummary = async () => {
      try {
        const token = localStorage.getItem('access');
        const userName = localStorage.getItem('permanentName');
        const userStudentId = localStorage.getItem('permanentStudentId');
        const userPhone = localStorage.getItem('permanentPhone');

        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('http://127.0.0.1:8000/api/leave-requests/', { headers });
        
        if (response.ok) {
          const data = await response.json();
          const allRequests = data.data || [];
          
          // Enforce strict local isolation (users should only see stats for their own device's history)
          let requests = [];
          if (userName && userStudentId && userPhone) {
            requests = allRequests.filter(r => 
               r.name === userName && 
               r.student_id?.toString() === userStudentId.toString() &&
               r.phone?.toString() === userPhone.toString()
            );
          }
          
          const totalApplied = requests.length;
          const approved = requests.filter(r => r.status === 'Approved').length;
          const pending = requests.filter(r => r.status === 'Pending').length;
          const rejected = requests.filter(r => r.status === 'Rejected').length;
          const approvalRate = totalApplied > 0 ? Math.round((approved / totalApplied) * 100) : 0;
          const medicalLeaves = requests.filter(r => r.leave_type === 'SL').length;
          const personalLeaves = requests.filter(r => r.leave_type === 'CL').length;

          setLeaveSummary({
            totalApplied,
            approved,
            pending,
            rejected,
            approvalRate,
            medicalLeaves,
            personalLeaves
          });
        }
      } catch (error) {
        console.error('Error loading leave summary:', error);
      }
    };

    loadLeaveSummary();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="w-full px-0 py-0">
        {/* Header */}
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 font-sans">
            Leave Management
          </h1>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* New Leave Request Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100 h-[380px] flex flex-col">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <h2 className="text-xl font-bold text-white mb-2 font-sans">
                New Leave Request
              </h2>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3 text-gray-600">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-500" />
                  <span className="text-sm">Apply for medical, personal, or academic leave</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FontAwesomeIcon icon={faFileAlt} className="text-blue-500" />
                  <span className="text-sm">Quick and easy application process</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FontAwesomeIcon icon={faClock} className="text-blue-500" />
                  <span className="text-sm">Track your request status in real-time</span>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/leave-request/new')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition duration-200 flex items-center justify-center gap-2 shadow-lg h-12"
              >
                <FontAwesomeIcon icon={faPlus} />
                Create New Request
              </button>
            </div>
          </div>

          {/* My Leave History Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100 h-[380px] flex flex-col">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
              <h2 className="text-xl font-bold text-white mb-2 font-sans">
                My Leave History
              </h2>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3 text-gray-600">
                  <FontAwesomeIcon icon={faFileAlt} className="text-purple-500" />
                  <span className="text-sm">View all your previous leave requests</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-500" />
                  <span className="text-sm">Check status of pending applications</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FontAwesomeIcon icon={faClock} className="text-purple-500" />
                  <span className="text-sm">Download request receipts</span>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/leave-request/history')}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition duration-200 flex items-center justify-center gap-2 shadow-lg h-12"
              >
                <FontAwesomeIcon icon={faCalendarAlt} />
                View Leave History
              </button>
            </div>
          </div>

          {/* Leave Summary Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100 h-[380px] flex flex-col">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
              <h2 className="text-xl font-bold text-white mb-2 font-sans">
                Leave Summary
              </h2>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">📍</span>
                  </div>
                  <span className="text-sm">Track all your leave requests in one place</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">📊</span>
                  </div>
                  <span className="text-sm">View comprehensive statistics and analytics</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">📈</span>
                  </div>
                  <span className="text-sm">Monitor leave history and approval status</span>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/leave-request/summary')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition duration-200 flex items-center justify-center gap-2 shadow-lg h-12"
              >
                <FontAwesomeIcon icon={faEye} />
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaveRequest;
