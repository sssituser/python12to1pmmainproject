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
  const [error, setError] = useState("");
  const [historyCleared, setHistoryCleared] = useState(false);

  // Welcome Back font styles - exact same as Playground
  const welcomeBackFont = {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    fontWeight: '700', // font-bold equivalent
  };

  // Real-time validation for Student ID
  const handleStudentIdChange = async (e) => {
    const newStudentId = e.target.value;
    setStudentId(newStudentId);
    
    // Check if Student ID already exists when user has typed at least 3 characters
    if (newStudentId.length >= 3) {
      try {
        const token = localStorage.getItem("access");
        if (token) {
          // Fetch fresh data from database
          const response = await fetch("http://127.0.0.1:8000/api/leave-requests/", {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const allRequests = data.data || data || [];
            
            // Get permanent credentials for comparison
            const permanentName = localStorage.getItem('registeredName') || '';
            const permanentStudentId = localStorage.getItem('registeredStudentId') || '';
            const permanentPhone = localStorage.getItem('registeredPhone') || '';
            
            // Check for existing Student ID
            const existingById = allRequests.find(req => 
              req.student_id && req.student_id.toString() === newStudentId.toString()
            );
            
            // Only show error if ID exists AND it's not the user's permanent ID
            if (existingById && permanentStudentId && existingById.student_id.toString() !== permanentStudentId.toString()) {
              setError("Student ID Already Exists! This ID is already taken by another student.");
            } else {
              setError(""); // Clear error if no conflict or it's user's own ID
            }
          }
        }
      } catch (error) {
        console.error("Error checking Student ID:", error);
      }
    }
  };

  // Real-time validation for Phone Number
  const handlePhoneChange = async (e) => {
    const newPhone = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
    setPhone(newPhone);
    
    // Check if Phone number already exists when user has typed 10 digits
    if (newPhone.length === 10) {
      try {
        const token = localStorage.getItem("access");
        if (token) {
          // Fetch fresh data from database
          const response = await fetch("http://127.0.0.1:8000/api/leave-requests/", {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const allRequests = data.data || data || [];
            
            // Get permanent credentials for comparison
            const permanentName = localStorage.getItem('registeredName') || '';
            const permanentStudentId = localStorage.getItem('registeredStudentId') || '';
            const permanentPhone = localStorage.getItem('registeredPhone') || '';
            
            // Check for existing Phone number
            const existingByPhone = allRequests.find(req => 
              req.phone && req.phone.toString() === newPhone.toString()
            );
            
            // Only show error if phone exists AND it's not the user's permanent phone
            if (existingByPhone && permanentPhone && existingByPhone.phone.toString() !== permanentPhone.toString()) {
              setError("Phone Number Already Exists! This phone number is already taken by another student.");
            } else {
              setError(""); // Clear error if no conflict or it's user's own phone
            }
          }
        }
      } catch (error) {
        console.error("Error checking Phone:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("=== Form Submit Started ===");
    
    // Get permanent credentials once at the beginning
    const permanentName = localStorage.getItem('registeredName') || '';
    const permanentStudentId = localStorage.getItem('registeredStudentId') || '';
    const permanentPhone = localStorage.getItem('registeredPhone') || '';
    
    console.log("=== PERMANENT CREDENTIALS ===");
    console.log("Permanent Name:", permanentName);
    console.log("Permanent Student ID:", permanentStudentId);
    console.log("Permanent Phone:", permanentPhone);
    console.log("Input Name:", name, "Stored Name:", permanentName);
    console.log("Input ID:", studentId, "Stored ID:", permanentStudentId);
    console.log("Input Phone:", phone, "Stored Phone:", permanentPhone);
    
    // Check if there are any current error messages
    if (error && error !== "") {
      console.log("Form submission blocked - there are error messages:", error);
      return; // Prevent submission if there are errors
    }
    
    // Basic validation
    if (!name || !startDate || !endDate || !reason) {
      console.log("Validation failed - missing fields");
      setError("Please fill all required fields (Name, Start Date, End Date, Reason)");
      return;
    }

    // Student ID validation (required for unique identification)
    if (!studentId || studentId.trim() === '') {
      setError("Student ID is required. Please enter your unique Student ID.");
      return;
    }

    // Phone number validation (required for unique identification)
    if (!phone || phone.trim() === '') {
      setError("Phone number is required for verification.");
      return;
    }

    // Check if this Student ID and Phone combination already exists in localStorage
    // If there are permanent credentials, enforce that user must use same ID and phone
    if (permanentName && permanentStudentId && permanentPhone) {
      if (studentId !== permanentStudentId || phone !== permanentPhone) {
        setError(`ID and Phone Mismatch! You must use your registered credentials: Student ID: ${permanentStudentId}, Phone: ${permanentPhone}`);
        return;
      }
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/[^0-9]/g, ''))) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    // Validate Student ID format (basic validation)
    if (studentId.length < 3) {
      setError("Student ID must be at least 3 characters long.");
      return;
    }

    // Check existing credentials in database
    console.log("=== CHECKING DATABASE FOR EXISTING CREDENTIALS ===");
    
    // Skip credential check if user already has permanent credentials
    if (permanentStudentId && permanentPhone) {
      console.log("User has permanent credentials - skipping database check");
    } else {
      const credentialCheck = await checkExistingCredentials(studentId, phone);
      
      if (credentialCheck.error) {
        setError("Error checking existing credentials. Please try again.");
        return;
      }
      
      if (credentialCheck.exists) {
        if (credentialCheck.type === 'student_id') {
          setError(`Student ID Already Exists! This ID is already taken by another student.`);
          return;
        }
        
        if (credentialCheck.type === 'phone') {
          setError(`Phone Number Already Exists! This phone number is already taken by another student.`);
          return;
        }
      }
    }
    
    // If credentials are permanently linked to a specific name
    if (permanentName && permanentStudentId && permanentPhone) {
      // User must use EXACTLY the same name, ID, and phone
      if (name !== permanentName || studentId !== permanentStudentId || phone !== permanentPhone) {
        console.log("PERMANENT CREDENTIALS MISMATCH - Blocking submission");
        setError("You must use your permanently registered credentials only! You cannot change name, ID, or phone number after first registration.");
        return;
      }
      
      // Allow same student to submit (same name + same ID + same phone)
      console.log("Same student with same permanent credentials - allowing submission");
    } else {
      // First time registration - store credentials permanently with this name
      console.log("First time registration - storing credentials permanently for name:", name);
      localStorage.setItem('registeredName', name);
      localStorage.setItem('registeredEmail', email);
      localStorage.setItem('registeredStudentId', studentId);
      localStorage.setItem('registeredPhone', phone);
      console.log("Credentials permanently stored for:", name, studentId, phone);
    }

    // Clear any previous errors
    setError("");
    
    // Submit directly without confirmation modal
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
        setError("Server returned invalid response. Check Django console for errors.");
        setLoading(false);
        return;
      }

      if (response.ok) {
        console.log("Request successful!");
        setError("Leave request submitted successfully!");
        
        // Reset history cleared flag when new request is submitted
        setHistoryCleared(false);
        
        // Store submitted values in localStorage for filtering
        localStorage.setItem('lastSubmittedName', name);
        localStorage.setItem('lastSubmittedEmail', email);
        localStorage.setItem('lastSubmittedPhone', phone);
        localStorage.setItem('lastSubmittedStudentId', studentId);
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
        
        // Clear success message after 3 seconds
        setTimeout(() => setError(""), 3000);
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
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Network error:", error);
      setError("Network error: " + error.message);
    }
    
    setLoading(false);
    console.log("=== Form Submit Ended ===");
  };

  const checkExistingCredentials = async (studentId, phone) => {
    try {
      console.log("=== CHECKING EXISTING CREDENTIALS DEBUG ===");
      console.log("Input Student ID:", studentId);
      console.log("Input Phone:", phone);
      
      const token = localStorage.getItem("access");
      if (!token) {
        console.error("No authentication token found");
        return { exists: false, error: true };
      }
      
      console.log("Making API call to check credentials...");
      const response = await fetch("http://127.0.0.1:8000/api/leave-requests/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      console.log("API Response Status:", response.status);
      console.log("API Response OK:", response.ok);
      
      if (!response.ok) {
        console.error("Failed to check existing credentials - HTTP Status:", response.status);
        return { exists: false, error: true };
      }
      
      const data = await response.json();
      console.log("API Response Data:", data);
      
      const allRequests = data.data || data || [];
      console.log("Total requests in database:", allRequests.length);
      
      // Get permanent credentials for comparison
      const permanentName = localStorage.getItem('registeredName') || '';
      const permanentStudentId = localStorage.getItem('registeredStudentId') || '';
      const permanentPhone = localStorage.getItem('registeredPhone') || '';
      
      console.log("Permanent credentials for comparison:");
      console.log("- Permanent Name:", permanentName);
      console.log("- Permanent Student ID:", permanentStudentId);
      console.log("- Permanent Phone:", permanentPhone);
      
      // Check for existing Student ID
      const existingById = allRequests.find(req => 
        req.student_id && req.student_id.toString() === studentId.toString()
      );
      
      // Check for existing Phone number
      const existingByPhone = allRequests.find(req => 
        req.phone && req.phone.toString() === phone.toString()
      );
      
      console.log("Existing by ID:", existingById);
      console.log("Existing by Phone:", existingByPhone);
      
      // Only return exists=true if credentials belong to someone else
      if (existingById || existingByPhone) {
        if (existingById && permanentStudentId && existingById.student_id.toString() !== permanentStudentId.toString()) {
          console.log("Student ID exists but belongs to different permanent user - blocking");
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
        
        if (existingByPhone && permanentPhone && existingByPhone.phone.toString() !== permanentPhone.toString()) {
          console.log("Phone exists but belongs to different permanent user - blocking");
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
      }
      
      console.log("No conflicting credentials found - allowing submission");
      return { exists: false };
      
    } catch (error) {
      console.error("Error checking existing credentials:", error);
      console.error("Error details:", error.message || error);
      return { exists: false, error: true };
    }
  };

  const clearPermanentCredentials = () => {
    console.log("Clearing all permanent credentials...");
    localStorage.removeItem('registeredName');
    localStorage.removeItem('registeredEmail');
    localStorage.removeItem('registeredPhone');
    localStorage.removeItem('registeredStudentId');
    localStorage.removeItem('lastSubmittedName');
    localStorage.removeItem('lastSubmittedEmail');
    localStorage.removeItem('lastSubmittedPhone');
    localStorage.removeItem('lastSubmittedStudentId');
    console.log("All credentials cleared! Starting fresh...");
    
    // Reset form fields
    setName("");
    setEmail("");
    setPhone("");
    setStudentId("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setLeaveType("Medical");
    setError("");
    
    // Reload requests
    loadRequests();
  };

  const loadRequests = async () => {
    try {
      // Don't reload if history was cleared by user
      if (historyCleared) {
        console.log("History was cleared by user - skipping automatic reload");
        return;
      }
      
      const token = localStorage.getItem("access");
      const response = await fetch("http://127.0.0.1:8000/api/leave-requests/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        console.error("Failed to load requests");
        return;
      }
      
      const data = await response.json();
      const allRequests = data.data || data || [];
      
      // Filter requests for current user
      const permanentName = localStorage.getItem('registeredName') || '';
      const permanentStudentId = localStorage.getItem('registeredStudentId') || '';
      const permanentPhone = localStorage.getItem('registeredPhone') || '';
      
      const filteredRequests = allRequests.filter(req => {
        if (req.student_id && req.phone && permanentStudentId && permanentPhone) {
          return req.student_id.toString() === permanentStudentId.toString() && 
                 req.phone.toString() === permanentPhone.toString();
        }
        return false;
      });
      
      setRequests(filteredRequests);
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  const clearLeaveHistory = async () => {
    console.log("=== CLEAR LEAVE HISTORY BUTTON CLICKED ===");
    
    try {
      console.log("Permanently deleting all leave history from database...");
      
      // Get authentication token
      const token = localStorage.getItem("access");
      if (!token) {
        console.error("No authentication token found");
        setError("No authentication token found. Please log in again.");
        return;
      }

      // First, get all current requests
      const getResponse = await fetch("http://127.0.0.1:8000/api/leave-requests/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!getResponse.ok) {
        console.error("Failed to get current requests");
        setError("Failed to retrieve current requests for deletion.");
        return;
      }

      const data = await getResponse.json();
      const allRequests = data.data || data || [];
      console.log(`Found ${allRequests.length} requests to permanently delete`);

      // Delete each request individually
      let deletedCount = 0;
      let failedCount = 0;
      
      for (const request of allRequests) {
        try {
          const deleteResponse = await fetch(`http://127.0.0.1:8000/api/leave-requests/${request.id}/`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });

          if (deleteResponse.ok) {
            deletedCount++;
            console.log(`✅ Permanently deleted request ${request.id} by ${request.name}`);
          } else {
            failedCount++;
            console.error(`❌ Failed to delete request ${request.id}`);
          }
        } catch (error) {
          failedCount++;
          console.error(`❌ Error deleting request ${request.id}:`, error);
        }
      }

      // Clear local state
      setRequests([]);
      
      // Set flag to prevent automatic reload
      setHistoryCleared(true);
      
      // Show result message
      if (deletedCount > 0 && failedCount === 0) {
        console.log(`✅ Successfully permanently deleted ${deletedCount} leave requests from database`);
        setError(`Successfully permanently deleted ${deletedCount} leave requests from database!`);
      } else if (failedCount > 0) {
        console.log(`❌ Failed to delete ${failedCount} out of ${allRequests.length} requests`);
        setError(`Failed to delete ${failedCount} requests. Please try again.`);
      } else {
        console.log("⚠️ No requests found to delete");
        setError("No leave requests found to delete.");
      }
      
      // Clear success message after 5 seconds
      setTimeout(() => setError(""), 5000);
      
    } catch (error) {
      console.error("Error in permanent deletion process:", error);
      setError("Error deleting leave history: " + error.message);
    }
  };

  const clearAllData = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // Clear all leave requests from database
      const res = await fetch("http://127.0.0.1:8000/api/leave-requests/", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        console.log("All leave requests cleared from database");
      } else {
        console.error("Failed to clear database records");
      }
      
      // Clear localStorage
      localStorage.removeItem('registeredName');
      localStorage.removeItem('registeredEmail');
      localStorage.removeItem('registeredPhone');
      localStorage.removeItem('registeredStudentId');
      
      // Clear requests state
      setRequests([]);
      
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  };

  // Auto-refresh requests every 30 seconds to get updated status
  useEffect(() => {
    const interval = setInterval(() => {
      // Only reload if there are requests showing (don't override cleared state)
      if (requests.length > 0) {
        loadRequests();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Load requests on component mount
  useEffect(() => {
    // Only load requests if history wasn't cleared
    if (!historyCleared) {
      loadRequests();
    }
    
    // Auto-fill user data from localStorage with better logging
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log("Auto-filling user data:", user);
    
    // Use permanent credentials if available (highest priority)
    const permanentName = localStorage.getItem('registeredName') || '';
    const permanentStudentId = localStorage.getItem('registeredStudentId') || '';
    const permanentPhone = localStorage.getItem('registeredPhone') || '';
    
    console.log("=== AUTO-FILL WITH PERMANENT CREDENTIALS ===");
    console.log("Permanent Name:", permanentName);
    console.log("Permanent Student ID:", permanentStudentId);
    console.log("Permanent Phone:", permanentPhone);
    
    // If permanent credentials exist, auto-fill them
    if (permanentName && permanentStudentId && permanentPhone) {
      console.log("Auto-filling permanent credentials");
      setName(permanentName);
      setStudentId(permanentStudentId);
      setPhone(permanentPhone);
      setEmail(user.email || ''); // Use user email if available
    } else {
      console.log("No permanent credentials found, using user profile");
      const userName = user.username || user.firstName || '';
      const userEmail = user.email || '';
      const userStudentId = user.randomId || user.studentId || '';
      const userPhone = user.phone || '';
      
      console.log("Setting form fields from user profile:", {
        name: userName,
        email: userEmail,
        studentId: userStudentId,
        phone: userPhone
      });
      
      setName(userName);
      setEmail(userEmail);
      setStudentId(userStudentId);
      setPhone(userPhone);
    }
  }, [historyCleared]);

  
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
      <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-sm border-b border-gray-200 py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-white bg-opacity-20 rounded-full">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-600 text-sm" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-800" style={welcomeBackFont}>My Leave Requests</h4>
                <p className="text-xs text-gray-600" style={welcomeBackFont}>View and manage your leave history</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 bg-white bg-opacity-20 rounded-lg">
              <FontAwesomeIcon icon={faUser} className="text-gray-600 text-xs" />
              <span className="text-gray-800 font-semibold text-sm">Student</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Leave Request Form - Horizontal Layout */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-400 to-blue-500 px-6 py-2">
            <h6 className="text-xl font-bold text-gray-800 flex items-center gap-2" style={welcomeBackFont}>
              <FontAwesomeIcon icon={faPlus} />
              New Leave Request
            </h6>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4">
            {/* Error/Success Message Display */}
            {error && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${error.includes("successfully") ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
                <div className="flex items-center gap-2">
                  {error.includes("successfully") ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {/* Personal Information Fields */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1" style={welcomeBackFont}>Full Name *</label>
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
                <label className="block text-sm font-semibold text-gray-800 mb-1" style={welcomeBackFont}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1" style={welcomeBackFont}>Phone * (Unique Identifier)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter your unique 10-digit phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                  maxLength={10}
                />
                <p className="text-xs text-gray-500 mt-1">This phone number + Student ID combination will be permanently linked to you</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1" style={welcomeBackFont}>Student ID * (Unique Identifier)</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={handleStudentIdChange}
                  placeholder="Enter your unique Student ID (e.g., 8090)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">This ID + Phone combination will be permanently linked to you</p>
              </div>
              
              {/* Leave Details Fields */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1" style={welcomeBackFont}>Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1" style={welcomeBackFont}>End Date *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1" style={welcomeBackFont}>Leave Type *</label>
                <select 
                  value={leaveType} 
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
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
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
    </>
  );
}

export default LeaveRequest;
