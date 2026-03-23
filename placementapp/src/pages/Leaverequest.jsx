// src/components/Leave.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCalendarAlt, faUser, faFileAlt, faClock, faBell, faDownload } from "@fortawesome/free-solid-svg-icons";
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
    
    // Basic validation
    if (!name || !startDate || !endDate || !reason) {
      console.log("Validation failed - missing fields");
      alert("Please fill all required fields (Name, Start Date, End Date, Reason)");
      return;
    }

    setLoading(true);

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
        setLoading(false);
        return;
      }

      if (response.ok) {
        console.log("Request successful!");
        alert("Leave request submitted successfully!");
        
        // Reset form
        setReason("");
        setStartDate("");
        setEndDate("");
        setEmail("");
        setPhone("");
        setStudentId("");
        setLeaveType("Medical");
        
        // Reload requests
        loadRequests();
      } else {
        console.error("Request failed with status:", response.status);
        console.error("Backend response:", result);
        
        let errorMessage = "Failed to submit request";
        if (result.errors) {
          errorMessage += ": " + JSON.stringify(result.errors);
        } else if (result.error) {
          errorMessage += ": " + result.error;
        } else if (result.detail) {
          errorMessage += ": " + result.detail;
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error: " + error.message);
    }
    
    setLoading(false);
    console.log("=== Form Submit Ended ===");
  };

  const loadRequests = async () => {
    try {
      const token = localStorage.getItem("access");
      const response = await fetch("http://127.0.0.1:8000/api/leave-requests/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        console.error("Failed to load requests:", response.status);
        return;
      }
      
      const data = await response.json();
      console.log("Backend response:", data);
      setRequests(data.data || data);
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  // Auto-refresh requests every 30 seconds to get updated status
  useEffect(() => {
    const interval = setInterval(() => {
      loadRequests();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Load requests on component mount
  useEffect(() => {
    loadRequests();
    
    // Auto-fill user data from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setName(user.username || user.firstName || '');
    setEmail(user.email || '');
    setStudentId(user.randomId || '');
  }, []);

  
  const handleDownloadPDF = (request) => {
    // Create new PDF document for individual request
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Leave Request Details', 105, 20, { align: 'center' });
    
    // Add generation date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
    
    // Add leave request details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Information:', 20, 50);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${request.name}`, 20, 60);
    doc.text(`Email: ${request.email}`, 20, 70);
    doc.text(`Student ID: ${request.student_id}`, 20, 80);
    doc.text(`Phone: ${request.phone}`, 20, 90);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Leave Details:', 20, 110);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Leave Type: ${request.leave_type}`, 20, 120);
    doc.text(`Start Date: ${formatDate(request.start_date)}`, 20, 130);
    doc.text(`End Date: ${formatDate(request.end_date)}`, 20, 140);
    doc.text(`Applied Date: ${formatDate(request.appliedDate || request.created_at)}`, 20, 150);
    doc.text(`Status: ${request.status}`, 20, 160);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Reason for Leave:', 20, 180);
    
    doc.setFont('helvetica', 'normal');
    // Split reason text if it's too long
    const splitReason = doc.splitTextToSize(request.reason, 170);
    doc.text(splitReason, 20, 190);
    
    // Add footer
    doc.setFontSize(8);
    doc.text(`Page 1 of 1`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
    
    // Save the PDF with request ID and name
    const fileName = `leave-request-${request.name}-${request.id}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
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
      'Academic': 'bg-blue-100 text-blue-700 border-blue-200',
      'Family': 'bg-green-100 text-green-700 border-green-200',
      'Other': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[type] || colors['Other'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-full">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-600 text-lg" />
              </div>
              <div>
                <h4 className="text-lg font-black text-green-600" style={{ fontFamily: 'Times New Roman, serif' }}>Leave Request Portal</h4>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white bg-opacity-20 rounded-lg">
              <FontAwesomeIcon icon={faUser} className="text-gray-600 text-sm" />
              <span className="text-gray-700 font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>Student</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Leave Request Form - Horizontal Layout */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-2">
            <h6 className="text-xl font-black text-sky-600 flex items-center gap-2" style={{ fontFamily: 'Times New Roman, serif' }}>
              <FontAwesomeIcon icon={faPlus} />
              New Leave Request
            </h6>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {/* Personal Information Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>Full Name *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>Student ID</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>End Date *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>Leave Type</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>Reason for Leave *</label>
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
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-gray-900 py-2 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPlus} />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* All Leave Requests */}
        <div className="rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-pink-400 to-pink-500 px-6 py-2">
            <div className="flex justify-between items-center">
            <h6 className="text-xl font-black text-gray-900 flex items-center gap-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                <FontAwesomeIcon icon={faCalendarAlt} />
                All Leave Requests
              </h6>
            </div>
          </div>
          
          <div className="p-6">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>No Leave Requests</h3>
                <p className="text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>Submit your first leave request to get started</p>
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
                            <h3 className="font-semibold text-gray-900 text-sm" style={{ fontFamily: 'Times New Roman, serif' }}>{req.name}</h3>
                            <p className="text-sm text-gray-600" style={{ fontFamily: 'Times New Roman, serif' }}>{req.email}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                          <span style={{ fontFamily: 'Times New Roman, serif' }}>{formatDate(req.start_date)} - {formatDate(req.end_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                            <span style={{ fontFamily: 'Times New Roman, serif' }}>Applied: {formatDate(req.appliedDate || req.created_at)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium border" style={{ fontFamily: 'Times New Roman, serif' }}>
                            {req.leave_type}
                          </span>
                          <span className="px-3 py-1 rounded-full text-lg font-bold" style={{ fontFamily: 'Times New Roman, serif' }}>
                            {req.status}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
                            <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 mr-2" />
                          <span style={{ fontFamily: 'Times New Roman, serif' }}>{req.reason}</span>
                          </p>
                      </div>
                      
                      {/* Download Button */}
                      <div className="ml-4">
                        <button
                          onClick={() => handleDownloadPDF(req)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-md"
                          title="Download leave request as PDF"
                        >
                          <FontAwesomeIcon icon={faDownload} />
                          <span style={{ fontFamily: 'Times New Roman, serif' }}>Download PDF</span>
                        </button>
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

export default LeaveRequest;
