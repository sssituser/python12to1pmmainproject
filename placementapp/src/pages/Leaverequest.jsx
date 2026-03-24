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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("=== Form Submit Started ===");
    
    // Basic validation
    if (!name || !startDate || !endDate || !reason) {
      console.log("Validation failed - missing fields");
      alert("Please fill all required fields (Name, Start Date, End Date, Reason)");
      return;
    }

    // Student ID validation (required for unique identification)
    if (!studentId || studentId.trim() === '') {
      alert("Student ID is required. Please enter your unique Student ID.");
      return;
    }

    // Phone number validation (required for unique identification)
    if (!phone || phone.trim() === '') {
      alert("Phone number is required for verification.");
      return;
    }

    // Check if this Student ID and Phone combination already exists in localStorage
    const storedName = localStorage.getItem('lastSubmittedName') || '';
    const storedEmail = localStorage.getItem('lastSubmittedEmail') || '';
    const storedPhone = localStorage.getItem('lastSubmittedPhone') || '';
    const storedStudentId = localStorage.getItem('lastSubmittedStudentId') || '';

    // If there are stored values, enforce that the user must use the same ID and phone
    if (storedPhone && storedStudentId) {
      if (studentId !== storedStudentId || phone !== storedPhone) {
        alert(`⚠️  ID and Phone Mismatch!\n\n` +
          `You must use your registered credentials:\n` +
          `Student ID: ${storedStudentId}\n` +
          `Phone: ${storedPhone}\n\n` +
          `You cannot use different credentials for leave requests.\n` +
          `Please use your correct Student ID and Phone number.`);
        return;
      }
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/[^0-9]/g, ''))) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    // Validate Student ID format (basic validation)
    if (studentId.length < 3) {
      alert("Student ID must be at least 3 characters long.");
      return;
    }

    // Check existing credentials in database
    console.log("=== CHECKING DATABASE FOR EXISTING CREDENTIALS ===");
    const credentialCheck = await checkExistingCredentials(studentId, phone);
    
    if (credentialCheck.error) {
      alert("Error checking existing credentials. Please try again.");
      return;
    }
    
    if (credentialCheck.exists) {
      if (credentialCheck.type === 'student_id') {
        alert(`⚠️  Student ID Already Exists!\n\n` +
          `This Student ID is already registered to another student:\n` +
          `Student ID: ${credentialCheck.existingData.student_id}\n` +
          `Phone: ${credentialCheck.existingData.phone}\n` +
          `Name: ${credentialCheck.existingData.name}\n\n` +
          `Please use your own unique Student ID.\n` +
          `Names can be the same, but Student IDs must be different.`);
        return;
      }
      
      if (credentialCheck.type === 'phone') {
        alert(`⚠️  Phone Number Already Exists!\n\n` +
          `This Phone number is already registered to another student:\n` +
          `Student ID: ${credentialCheck.existingData.student_id}\n` +
          `Phone: ${credentialCheck.existingData.phone}\n` +
          `Name: ${credentialCheck.existingData.name}\n\n` +
          `Please use your own unique Phone number.\n` +
          `Names can be the same, but Phone numbers must be different.`);
        return;
      }
    }
    
    if (credentialCheck.sameStudent) {
      console.log("Same student submitting additional request - allowing");
      // This is the same student submitting another request
    }

    // Show custom confirmation modal instead of browser confirm
    const details = {
      name,
      email,
      phone,
      studentId,
      startDate,
      endDate,
      leaveType,
      reason
    };
    showCustomConfirmation(details);
  };

  const showCustomConfirmation = (details) => {
    setConfirmationDetails(details);
    setShowConfirmation(true);
  };

  const handleConfirmationSubmit = async () => {
    setShowConfirmation(false);
    
    setLoading(true);

    const newRequest = {
      name: confirmationDetails.name,
      email: confirmationDetails.email,
      phone: confirmationDetails.phone,
      student_id: confirmationDetails.studentId,
      start_date: confirmationDetails.startDate,
      end_date: confirmationDetails.endDate,
      reason: confirmationDetails.reason,
      leave_type: confirmationDetails.leaveType,
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
        
        // Store submitted values in localStorage for filtering
        localStorage.setItem('lastSubmittedName', confirmationDetails.name);
        localStorage.setItem('lastSubmittedEmail', confirmationDetails.email);
        localStorage.setItem('lastSubmittedPhone', confirmationDetails.phone);
        localStorage.setItem('lastSubmittedStudentId', confirmationDetails.studentId);
        console.log("Stored submitted values in localStorage for filtering");
        
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

  const handleConfirmationCancel = () => {
    setShowConfirmation(false);
    console.log("User cancelled leave submission");
  };

  const checkExistingCredentials = async (studentId, phone) => {
    try {
      const token = localStorage.getItem("access");
      const response = await fetch("http://127.0.0.1:8000/api/leave-requests/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        console.error("Failed to check existing credentials");
        return { exists: false, error: true };
      }
      
      const data = await response.json();
      const allRequests = data.data || data || [];
      
      console.log("=== CHECKING EXISTING CREDENTIALS ===");
      console.log("Checking Student ID:", studentId);
      console.log("Checking Phone:", phone);
      
      // Check for existing Student ID
      const existingById = allRequests.find(req => 
        req.student_id && req.student_id.toString() === studentId.toString()
      );
      
      // Check for existing Phone
      const existingByPhone = allRequests.find(req => 
        req.phone && req.phone.toString() === phone.toString()
      );
      
      console.log("Existing by ID:", existingById);
      console.log("Existing by Phone:", existingByPhone);
      
      if (existingById && existingByPhone) {
        // Both ID and Phone exist (could be same student)
        if (existingById.phone === phone) {
          console.log("Same student found - allowing submission");
          return { exists: false, sameStudent: true, student: existingById };
        }
      }
      
      if (existingById) {
        console.log("Student ID already exists with different phone");
        return { 
          exists: true, 
          type: 'student_id', 
          existingData: {
            student_id: existingById.student_id,
            phone: existingById.phone,
            name: existingById.name
          }
        };
      }
      
      if (existingByPhone) {
        console.log("Phone already exists with different student ID");
        return { 
          exists: true, 
          type: 'phone', 
          existingData: {
            student_id: existingByPhone.student_id,
            phone: existingByPhone.phone,
            name: existingByPhone.name
          }
        };
      }
      
      console.log("No existing credentials found - new student");
      return { exists: false, sameStudent: false };
      
    } catch (error) {
      console.error("Error checking existing credentials:", error);
      return { exists: false, error: true };
    }
  };

  const clearAllData = async () => {
    if (!confirm("⚠️  WARNING: This will delete ALL leave requests from the database and clear all local data. Are you absolutely sure?")) {
      return;
    }

    try {
      // Clear localStorage data
      localStorage.removeItem('lastSubmittedName');
      localStorage.removeItem('lastSubmittedEmail');
      localStorage.removeItem('lastSubmittedPhone');
      localStorage.removeItem('lastSubmittedStudentId');
      console.log("Cleared localStorage data");

      // Clear the requests state
      setRequests([]);
      
      alert("✅ All local data cleared successfully!\n\nNote: To clear database records, you need to:\n1. Go to Django admin panel\n2. Navigate to Leave requests\n3. Delete all records\n\nOr contact your administrator to clear the database.");
      
    } catch (error) {
      console.error("Error clearing data:", error);
      alert("Error clearing data: " + error.message);
    }
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
      console.log("=== RAW API RESPONSE ===");
      console.log("Full response data:", data);
      console.log("Data type:", typeof data);
      console.log("Data keys:", Object.keys(data));
      
      // Get current logged-in user info (for reference only)
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserEmail = currentUser.email || '';
      const currentUserName = currentUser.username || currentUser.firstName || '';
      const currentStudentId = currentUser.randomId || currentUser.studentId || '';
      const currentUserPhone = currentUser.phone || '';
      
      console.log("=== CURRENT USER INFO (from localStorage) ===");
      console.log("Current user from localStorage:", currentUser);
      console.log("Current user name:", currentUserName);
      console.log("Current user email:", currentUserEmail);
      console.log("Current user student ID:", currentStudentId);
      console.log("Current user phone:", currentUserPhone);
      
      // IMPORTANT: Use the most recently submitted values for filtering
      // Store submitted values in localStorage when form is submitted
      const lastSubmittedName = localStorage.getItem('lastSubmittedName') || '';
      const lastSubmittedEmail = localStorage.getItem('lastSubmittedEmail') || '';
      const lastSubmittedPhone = localStorage.getItem('lastSubmittedPhone') || '';
      const lastSubmittedStudentId = localStorage.getItem('lastSubmittedStudentId') || '';
      
      console.log("=== LAST SUBMITTED VALUES (for filtering) ===");
      console.log("Last submitted name:", lastSubmittedName);
      console.log("Last submitted email:", lastSubmittedEmail);
      console.log("Last submitted phone:", lastSubmittedPhone);
      console.log("Last submitted student ID:", lastSubmittedStudentId);
      
      // Use last submitted values for filtering (what was actually submitted)
      const filterName = lastSubmittedName || name;
      const filterEmail = lastSubmittedEmail || email;
      const filterPhone = lastSubmittedPhone || phone;
      const filterStudentId = lastSubmittedStudentId || studentId;
      
      console.log("=== FILTERING CRITERIA ===");
      console.log("Using name for filtering:", filterName);
      console.log("Using email for filtering:", filterEmail);
      console.log("Using phone for filtering:", filterPhone);
      console.log("Using student ID for filtering:", filterStudentId);
      
      // Get all requests from database
      const allRequests = data.data || data || [];
      console.log("=== ALL REQUESTS FROM DATABASE ===");
      console.log("All requests array:", allRequests);
      console.log("Number of requests:", allRequests.length);
      
      allRequests.forEach((req, index) => {
        console.log(`Request ${index + 1}:`, {
          id: req.id,
          name: req.name,
          email: req.email,
          phone: req.phone,
          student_id: req.student_id,
          status: req.status,
          leave_type: req.leave_type
        });
      });
      
      // Filter requests - require BOTH Student ID AND Phone to match (strict uniqueness)
      const filteredRequests = allRequests.filter(req => {
        // STRATEGY: Match by Student ID AND Phone (BOTH must match for security)
        if (req.student_id && filterStudentId && req.phone && filterPhone &&
            req.student_id.toString() === filterStudentId.toString() && 
            req.phone.toString() === filterPhone.toString()) {
          console.log("✅ MATCHED BY STUDENT ID + PHONE (SECURE):", req.student_id, req.phone);
          return true;
        }
        
        console.log("❌ NO MATCH for request:", req.id);
        console.log("❌ Required: Student ID:", filterStudentId, "AND Phone:", filterPhone);
        console.log("❌ Found: Student ID:", req.student_id, "AND Phone:", req.phone);
        return false;
      });
      
      console.log("=== FILTERING RESULTS ===");
      console.log("Total requests in database:", allRequests.length);
      console.log("Filtered requests count:", filteredRequests.length);
      console.log("Filtered requests data:", filteredRequests);
      
      setRequests(filteredRequests);
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
    
    // Auto-fill user data from localStorage with better logging
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log("Auto-filling user data:", user);
    
    const userName = user.username || user.firstName || '';
    const userEmail = user.email || '';
    const userStudentId = user.randomId || user.studentId || '';
    const userPhone = user.phone || '';
    
    console.log("Setting form fields:", {
      name: userName,
      email: userEmail,
      studentId: userStudentId,
      phone: userPhone
    });
    
    setName(userName);
    setEmail(userEmail);
    setStudentId(userStudentId);
    setPhone(userPhone);
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
    <>
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
                <h4 className="text-lg font-bold text-gray-800">My Leave Requests</h4>
                <p className="text-sm text-gray-600">View and manage your leave history</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white bg-opacity-20 rounded-lg">
              <FontAwesomeIcon icon={faUser} className="text-gray-600 text-sm" />
              <span className="text-gray-800 font-semibold">Student</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Leave Request Form - Horizontal Layout */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-2">
            <h6 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FontAwesomeIcon icon={faPlus} />
              New Leave Request
            </h6>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {/* Personal Information Fields */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Full Name *</label>
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
                <label className="block text-sm font-semibold text-gray-800 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Phone * (Unique Identifier)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your unique 10-digit phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                  maxLength={10}
                />
                <p className="text-xs text-gray-500 mt-1">This phone number + Student ID combination will be permanently linked to you</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Student ID * (Unique Identifier)</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter your unique Student ID (e.g., 8090)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">This ID + Phone combination will be permanently linked to you</p>
              </div>
              
              {/* Leave Details Fields */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">End Date *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Leave Type</label>
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
                <label className="block text-sm font-semibold text-gray-800 mb-1">Reason for Leave *</label>
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

        {/* My Leave Requests */}
        <div className="rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-pink-400 to-pink-500 px-6 py-2">
            <div className="flex justify-between items-center">
            <h6 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarAlt} />
                My Leave History
              </h6>
            </div>
          </div>
          
          <div className="p-6">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No Leave Requests Found</h3>
                <p className="text-gray-600">You haven't submitted any leave requests yet</p>
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
                          <span className="px-3 py-1 rounded-full text-lg font-bold">
                            {req.status === 'Approved' ? (
                              <span className="text-green-600">{req.status}</span>
                            ) : req.status === 'Rejected' ? (
                              <span className="text-red-600">{req.status}</span>
                            ) : (
                              <span className="text-gray-800">{req.status}</span>
                            )}
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

      {/* Custom Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-full">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Confirm Leave Request Submission</h3>
                    <p className="text-blue-100 text-sm">Please review your details before submitting</p>
                  </div>
                </div>
                <button
                  onClick={handleConfirmationCancel}
                  className="text-white hover:text-blue-200 transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Student Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                  Student Information
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-800">{confirmationDetails.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-800">{confirmationDetails.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone <span className="text-red-500">*</span></p>
                    <p className="font-medium text-gray-800">{confirmationDetails.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Student ID <span className="text-red-500">*</span></p>
                    <p className="font-medium text-gray-800">{confirmationDetails.studentId}</p>
                  </div>
                </div>
              </div>

              {/* Leave Details */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600" />
                  Leave Details
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Leave Type</p>
                    <p className="font-medium text-gray-800">{confirmationDetails.leaveType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-gray-800">
                      {confirmationDetails.startDate} to {confirmationDetails.endDate}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Reason for Leave</p>
                    <p className="font-medium text-gray-800 bg-white p-3 rounded border border-gray-200">
                      {confirmationDetails.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-yellow-100 rounded-full">
                      <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-800 mb-2">🔐 Uniqueness Policy</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Names can be the same (multiple students can have same name)</li>
                        <li>• Student ID must be unique (no two students can share same ID)</li>
                        <li>• Phone number must be unique (no two students can share same phone)</li>
                        <li>• This Student ID + Phone combination will be permanently linked to you</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleConfirmationCancel}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
                <button
                  onClick={handleConfirmationSubmit}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Submit Leave Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LeaveRequest;
