// src/components/Leave.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faCalendarAlt, faUser, faFileAlt, faClock, faBell, faDownload } from "@fortawesome/free-solid-svg-icons";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function LeaveRequest() {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState("");
  const [leaveType, setLeaveType] = useState("Medical");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("=== Form Submit Started ===");
    
    if (!name || !startDate || !endDate || !reason) {
      console.log("Validation failed - missing fields");
      alert("Fill all required fields");
      return;
    }

    // First test if server is working
    console.log("Testing server connection...");
    try {
      const testResponse = await fetch("http://127.0.0.1:8000/api/test/");
      const testData = await testResponse.json();
      console.log("Server test result:", testData);
      
      if (!testResponse.ok) {
        console.error("Server test failed");
        alert("Server is not responding correctly. Check Django server.");
        return;
      }
    } catch (error) {
      console.error("Cannot connect to server:", error);
      alert("Cannot connect to Django server. Make sure it's running on http://127.0.0.1:8000");
      return;
    }

    const newRequest = {
      name,
      email,
      phone,
      student_id: studentId,
      start_date: startDate,
      end_date: endDate,
      reason,
      leave_type: leaveType,
      status: "Pending",
      approved_by: null,
      appliedDate: new Date().toISOString()
    };

    console.log("Submitting request:", newRequest);

    try {
      console.log("Sending POST request to /api/leave-requests/create/");
      const response = await fetch("http://127.0.0.1:8000/api/leave-requests/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newRequest)
      });

      console.log("Response received:");
      console.log("- Status:", response.status);
      console.log("- Status Text:", response.statusText);
      console.log("- OK:", response.ok);
      
      // Get response text first to see what we received
      const responseText = await response.text();
      console.log("- Raw Response:", responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log("- Parsed Response:", result);
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        console.log("- Response was not valid JSON:", responseText);
        alert("Server returned invalid response. Check Django console for errors.");
        return;
      }

      if (response.ok) {
        console.log("Request successful!");
        alert("Request submitted successfully!");
        
        // Reset form
        setReason("");
        setLeaveType("Medical");
        
        // Reload requests from backend
        console.log("Reloading requests...");
        loadRequests();
      } else {
        console.error("Request failed with status:", response.status);
        console.error("Backend response:", result);
        
        let errorMessage = "Failed to submit request";
        if (result.errors) {
          errorMessage += ": " + JSON.stringify(result.errors);
        } else if (result.error) {
          errorMessage += ": " + result.error;
        } else if (result.message) {
          errorMessage += ": " + result.message;
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Network error occurred:");
      console.error("- Error:", error);
      console.error("- Error message:", error.message);
      console.error("- Error stack:", error.stack);
      alert("Network error: " + error.message);
    }
    
    console.log("=== Form Submit Ended ===");
  };

  const loadRequests = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/leave-requests/");
      const data = await response.json();
      console.log("Backend response:", data);
      setRequests(data.data || data);
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  // Load requests on component mount
  useEffect(() => {
    loadRequests();
    
    // Auto-fill user data from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setName(user.username || user.firstName || '');
    setEmail(user.email || '');
    setStudentId(user.randomId || '');
  }, []);

  const handleDelete = async (id) => {
    const requestToDelete = requests.find(req => req.id === id);
    if (confirm(`Are you sure you want to permanently delete this leave request from ${requestToDelete?.name || 'Unknown'}? This action cannot be undone.`)) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/leave-requests/${id}/delete/`, {
          method: "DELETE"
        });

        if (response.ok) {
          alert(`Leave request from ${requestToDelete?.name || 'Unknown'} has been permanently deleted.`);
          loadRequests();
        } else {
          alert("Failed to delete request");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Server error. Please try again.");
      }
    }
  };

  const handleExportData = () => {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Leave Requests Report', 105, 20, { align: 'center' });
    
    // Add generation date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
    
    // Prepare table data
    const tableData = requests.map((req, index) => [
      index + 1,
      req.name || 'N/A',
      req.email || 'N/A',
      req.student_id || 'N/A',
      req.phone || 'N/A',
      formatDate(req.start_date),
      formatDate(req.end_date),
      req.leave_type || 'N/A',
      req.status || 'N/A',
      req.reason || 'N/A'
    ]);
    
    // Add table to PDF
    doc.autoTable({
      head: [
        ['S.No', 'Name', 'Email', 'Student ID', 'Phone', 'Start Date', 'End Date', 'Leave Type', 'Status', 'Reason']
      ],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue color
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Light gray for alternate rows
      },
      columnStyles: {
        0: { cellWidth: 15 }, // S.No
        1: { cellWidth: 25 }, // Name
        2: { cellWidth: 30 }, // Email
        3: { cellWidth: 20 }, // Student ID
        4: { cellWidth: 25 }, // Phone
        5: { cellWidth: 25 }, // Start Date
        6: { cellWidth: 25 }, // End Date
        7: { cellWidth: 20 }, // Leave Type
        8: { cellWidth: 20 }, // Status
        9: { cellWidth: 'auto' }, // Reason (auto width)
      },
      margin: { left: 10, right: 10 },
      didDrawPage: (data) => {
        // Add footer with page number
        doc.setFontSize(8);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
      }
    });
    
    // Add summary at the bottom
    const finalY = doc.lastAutoTable.finalY || 40;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Requests: ${requests.length}`, 10, finalY + 10);
    
    // Status summary
    const approvedCount = requests.filter(req => req.status === 'Approved').length;
    const rejectedCount = requests.filter(req => req.status === 'Rejected').length;
    const pendingCount = requests.filter(req => req.status === 'Pending').length;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Approved: ${approvedCount} | Rejected: ${rejectedCount} | Pending: ${pendingCount}`, 10, finalY + 15);
    
    // Save the PDF
    doc.save(`leave-requests-report-${new Date().toISOString().split('T')[0]}.pdf`);
    alert('Leave requests report downloaded successfully as PDF!');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      'Medical': 'bg-red-100 text-red-700 border-red-200',
      'Personal': 'bg-blue-100 text-blue-700 border-blue-200',
      'Academic': 'bg-purple-100 text-purple-700 border-purple-200',
      'Family': 'bg-green-100 text-green-700 border-green-200',
      'Other': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[type] || colors['Other'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600 text-xl" />
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-900" style={{ fontFamily: 'Times New Roman, serif' }}>Leave Request Portal</h4>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <FontAwesomeIcon icon={faUser} className="text-gray-600 text-sm" />
              <span className="text-gray-700 font-medium">Student</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Leave Request Form - Horizontal Layout */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2">
            <h6 className="text-xl font-black text-white flex items-center gap-2" style={{ fontFamily: 'Times New Roman, serif' }}>
              <FontAwesomeIcon icon={faPlus} />
              New Leave Request
            </h6>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {/* Personal Information Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Student ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              
              {/* Leave Details Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select 
                  value={leaveType} 
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="Medical">Medical</option>
                  <option value="Personal">Personal</option>
                  <option value="Academic">Academic</option>
                  <option value="Family">Family</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {/* Reason Field - Spans multiple columns */}
              <div className="lg:col-span-2 xl:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leave *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a detailed reason for your leave request..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  rows={2}
                  required
                />
              </div>
              
              {/* Submit Button */}
              <div className="flex items-end">
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* All Leave Requests */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-2">
            <div className="flex justify-between items-center">
              <h5 className="text-xl font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                <FontAwesomeIcon icon={faBell} />
                All Leave Requests
              </h5>
              <button
                onClick={handleExportData}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                title="Download all leave requests"
              >
                <FontAwesomeIcon icon={faDownload} />
                Download
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leave Requests</h3>
                <p className="text-gray-600">Submit your first leave request to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div key={req.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faUser} className="text-blue-600 text-sm" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{req.name}</h3>
                            <p className="text-sm text-gray-600">{req.email}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                            <span>{formatDate(req.start_date)} - {formatDate(req.end_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                            <span>Applied: {formatDate(req.appliedDate || req.created_at)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLeaveTypeColor(req.leave_type)}`}>
                            {req.leave_type}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            req.status === "Approved" ? "bg-green-100 text-green-700" :
                            req.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {req.status}
                          </span>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700">
                            <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 mr-2" />
                            {req.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end items-center gap-2 pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => handleDelete(req.id)} 
                        className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center gap-1 text-sm"
                        title="Delete this request"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Delete
                      </button>
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

export default LeaveRequest;
