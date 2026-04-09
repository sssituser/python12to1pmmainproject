import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCalendarAlt, faUser, faFileAlt, faClock, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import jsPDF from "jspdf";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, errorInfo: error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ hasError: true, error, errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
              <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
              <p className="text-gray-700 mb-4">An error occurred while loading the leave request form.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Get current date for dynamic defaults
const getCurrentDate = () => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error getting current date:", error);
    return "2026-01-01";
  }
};

const getDateRange = () => {
  try {
    const currentYear = new Date().getFullYear();
    return {
      min: `${currentYear}-01-01`,
      max: `${currentYear}-12-31`
    };
  } catch (error) {
    console.error("Error getting date range:", error);
    return {
      min: "2026-01-01",
      max: "2026-12-31"
    };
  }
};

// Generate device fingerprint for unique identification
const generateDeviceFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Create a simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  } catch (error) {
    console.error("Error generating device fingerprint:", error);
    return "default_fingerprint";
  }
};

// Clear all old credentials and start fresh
const clearAllOldCredentials = () => {
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
  
  console.log("=== ALL OLD CREDENTIALS CLEARED - FRESH START ===");
};

function NewLeaveRequest() {
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(getCurrentDate());
  const [endDate, setEndDate] = useState(getCurrentDate());
  const [reason, setReason] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [leaveType, setLeaveType] = useState('SL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentIdError, setStudentIdError] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const dateRange = getDateRange();

  // Clear all old credentials and start fresh
  const clearAllOldCredentials = () => {
    // Clear all old storage keys
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
    
    console.log("=== ALL OLD CREDENTIALS CLEARED - FRESH START ===");
  };

  // Generate device fingerprint for unique identification
  const generateDeviceFingerprint = () => {
    // Create a unique fingerprint based on browser and hardware info
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Create a simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  };

  // Load permanent credentials on component mount
  useEffect(() => {
    
    const currentDeviceFingerprint = generateDeviceFingerprint();
    const storedDeviceFingerprint = localStorage.getItem('deviceFingerprint');
    const storedName = localStorage.getItem('permanentName');
    const storedEmail = localStorage.getItem('permanentEmail');
    const storedStudentId = localStorage.getItem('permanentStudentId');
    const storedPhone = localStorage.getItem('permanentPhone');

    // Check if this is the same device
    if (storedDeviceFingerprint && storedDeviceFingerprint !== currentDeviceFingerprint) {
      // Fingerprint changed (e.g. browser context change), but we KEEP credentials 
      // to ensure leave history is permanent on this laptop.
      console.log("Device fingerprint changed or updated - keeping credentials for permanent history");
      
      // Update fingerprint to new one instead of clearing out the user's saved data
      localStorage.setItem('deviceFingerprint', currentDeviceFingerprint);
    }

    // Store current device fingerprint
    if (!storedDeviceFingerprint) {
      localStorage.setItem('deviceFingerprint', currentDeviceFingerprint);
      console.log("Device fingerprint stored for first time:", currentDeviceFingerprint);
    }

    // Load credentials if they exist for this device
    if (storedName) setName(storedName);
    if (storedEmail) setEmail(storedEmail);
    if (storedStudentId) setStudentId(storedStudentId);
    if (storedPhone) setPhone(storedPhone);
  }, []);

  // Check if user has already registered credentials
  const hasRegisteredCredentials = () => {
    return localStorage.getItem('permanentName') && 
           localStorage.getItem('permanentStudentId') && 
           localStorage.getItem('permanentPhone');
  };

  // Validate credentials in real-time
  const validateCredentials = (field, value) => {
    let error = '';
    
    // Only validate if user has already registered credentials
    if (hasRegisteredCredentials()) {
      const storedName = localStorage.getItem('permanentName');
      const storedStudentId = localStorage.getItem('permanentStudentId');
      const storedPhone = localStorage.getItem('permanentPhone');
      
      if (field === 'name' && value && value !== storedName) {
        error = `Invalid name! Only ${storedName} is allowed on this device`;
      }
      if (field === 'studentId' && value && value !== storedStudentId) {
        error = `Invalid Student ID! Only ${storedStudentId} is allowed on this device`;
      }
      if (field === 'phone' && value && value !== storedPhone) {
        error = `Invalid Phone Number! Only ${storedPhone} is allowed on this device`;
      }
    }
    
    return error;
  };

  // Check for existing credentials in database with fallback options
  const checkExistingCredentials = async (studentId, phone, userName) => {
    // Check if this is a fresh start (no stored credentials)
    const hasStoredCredentials = localStorage.getItem('permanentName') || 
                               localStorage.getItem('permanentStudentId') || 
                               localStorage.getItem('permanentPhone');
    
    if (!hasStoredCredentials) {
      console.log("Fresh start detected - allowing first-time registration without checks");
      return { exists: false, firstTime: true };
    }

    // Always allow first-time registration on a new device
    const deviceFingerprint = localStorage.getItem('deviceFingerprint');
    if (!deviceFingerprint) {
      console.log("New device detected - allowing first-time registration");
      return { exists: false, firstTime: true };
    }

    // Try multiple approaches to avoid authentication issues
    
    // Method 1: Try with authentication token
    try {
      const token = localStorage.getItem("access");
      if (token) {
        console.log("Trying authenticated API call...");
        console.log("Token exists:", !!token);
        
        const response = await fetch(`http://${window.location.hostname}:8000/api/leave-requests/`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        console.log("API Response status:", response.status);

        if (response.status === 401) {
          console.log("401 Unauthorized - trying without token");
        } else if (response.ok) {
          const data = await response.json();
          console.log("API response data:", data);
          
          const allRequests = data.data || data || [];
          console.log("Total requests found:", allRequests.length);

          // Check for existing credentials - but allow user's own credentials
          const studentIdExists = allRequests.some(req => 
            req.student_id && req.student_id.toString() === studentId.toString() &&
            req.name !== userName // Allow if it's the same user's own credentials
          );
          
          const phoneExists = allRequests.some(req => 
            req.phone && req.phone.toString() === phone.toString() &&
            req.name !== userName // Allow if it's the same user's own credentials
          );

          console.log("Student ID exists for different user:", studentIdExists);
          console.log("Phone exists for different user:", phoneExists);

          if (studentIdExists) {
            return { exists: true, type: 'student_id' };
          }
          
          if (phoneExists) {
            return { exists: true, type: 'phone' };
          }

          return { exists: false };
        }
      }
    } catch (error) {
      console.log("Authenticated API call failed, trying fallback");
    }

    // Method 2: Try without authentication (if endpoint allows)
    try {
      console.log("Trying unauthenticated API call...");
      const response = await fetch(`http://${window.location.hostname}:8000/api/leave-requests/`, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Unauthenticated API response data:", data);
        
        const allRequests = data.data || data || [];
        console.log("Total requests found (unauth):", allRequests.length);

        // Check for existing credentials - but allow user's own credentials
        const studentIdExists = allRequests.some(req => 
          req.student_id && req.student_id.toString() === studentId.toString() &&
          req.name !== userName // Allow if it's the same user's own credentials
        );
        
        const phoneExists = allRequests.some(req => 
          req.phone && req.phone.toString() === phone.toString() &&
          req.name !== userName // Allow if it's the same user's own credentials
        );

        console.log("Student ID exists for different user (unauth):", studentIdExists);
        console.log("Phone exists for different user (unauth):", phoneExists);

        if (studentIdExists) {
          return { exists: true, type: 'student_id' };
        }
        
        if (phoneExists) {
          return { exists: true, type: 'phone' };
        }

        return { exists: false };
      }
    } catch (error) {
      console.log("Unauthenticated API call failed");
    }

    // Method 3: Fallback - allow registration (for development/testing)
    console.log("API calls failed, allowing registration as fallback");
    return { exists: false, fallback: true };
  };

  // Handle name change with validation
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    const error = validateCredentials('name', value);
    setNameError(error);
  };

  // Handle student ID change with validation
  const handleStudentIdChange = (e) => {
    const value = e.target.value;
    setStudentId(value);
    const error = validateCredentials('studentId', value);
    setStudentIdError(error);
  };

  // Handle phone change with validation
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    const error = validateCredentials('phone', value);
    setPhoneError(error);
  };

  // Real-time validation for Student ID
  const handleStudentIdChangeAsync = async (e) => {
    const newStudentId = e.target.value;
    setStudentId(newStudentId);
    
    if (newStudentId.length >= 3) {
      try {
        const token = localStorage.getItem("access");
        if (token) {
          const response = await fetch(`http://${window.location.hostname}:8000/api/leave-requests/`, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const allRequests = data.data || data || [];
            const permanentStudentId = localStorage.getItem('registeredStudentId') || '';
            const permanentPhone = localStorage.getItem('registeredPhone') || '';
            
            const filteredRequests = allRequests.filter(req => {
              if (req.student_id && req.phone && permanentStudentId && permanentPhone) {
                return req.student_id.toString() === permanentStudentId.toString() && 
                       req.phone.toString() === permanentPhone.toString();
              }
              return false;
            });
            
            const existingRequest = filteredRequests.find(req => 
              req.student_id.toString() === newStudentId.toString()
            );
            
            if (existingRequest && existingRequest.student_id.toString() !== permanentStudentId.toString()) {
              setError(`Student ID Already Exists! This ID is already taken by another student.`);
            } else {
              setError("");
            }
          }
        }
      } catch (error) {
        console.error("Error checking student ID:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("=== Form Submit Started ===");
    
    // Clear previous errors
    setNameError('');
    setStudentIdError('');
    setPhoneError('');
    
    // Check if user has already registered credentials
    const userHasRegistered = hasRegisteredCredentials();
    
    if (userHasRegistered) {
      // Validate credentials against stored ones
      const nameValidationError = validateCredentials('name', name);
      const studentIdValidationError = validateCredentials('studentId', studentId);
      const phoneValidationError = validateCredentials('phone', phone);
      
      if (nameValidationError) {
        setNameError(nameValidationError);
        setError(nameValidationError);
        return;
      }
      
      if (studentIdValidationError) {
        setStudentIdError(studentIdValidationError);
        setError(studentIdValidationError);
        return;
      }
      
      if (phoneValidationError) {
        setPhoneError(phoneValidationError);
        setError(phoneValidationError);
        return;
      }
    }
    
    if (!name || !email || !phone || !studentId || !leaveType || !startDate || !endDate || !reason) {
      setError("Please fill in all required fields");
      return;
    }

    if (phone.length !== 10) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("End date cannot be before start date");
      return;
    }

    setLoading(true);
    setError("");

    // Use a toast to show processing started
    const submitToastId = toast.loading("Submitting your leave request...");

    try {
      const token = localStorage.getItem("access");
      if (!token) {
        setError("You must be logged in to submit a leave request");
        setLoading(false);
        return;
      }

      // If user hasn't registered yet, check for existing credentials in database
      if (!userHasRegistered) {
        console.log("=== FIRST TIME USER - CHECKING DATABASE ===");
        
        try {
          const credentialCheck = await checkExistingCredentials(studentId, phone, name);
          
          console.log("Credential check result:", credentialCheck);
          
          if (credentialCheck.firstTime) {
            console.log("First-time registration on new device - allowing registration");
            // Don't show error to user, just proceed with registration
          } else if (credentialCheck.fallback) {
            console.log("Using fallback mode - API calls failed but allowing registration");
            // Don't show error to user, just proceed with registration
            // This prevents authentication issues from blocking users
          } else if (credentialCheck.exists) {
            if (credentialCheck.type === 'student_id') {
              console.log("Student ID already exists for different user");
              setError(`Student ID Already Exists! This ID is already registered to another user.`);
              return;
            }
            
            if (credentialCheck.type === 'phone') {
              console.log("Phone number already exists for different user");
              setError(`Phone Number Already Exists! This phone number is already registered to another user.`);
              return;
            }
          } else {
            console.log("Credential check passed - no conflicts found");
          }
        } catch (apiError) {
          console.error("API Error during credential check:", apiError);
          // Don't block user registration due to API issues
          console.log("API check failed, proceeding with registration");
        }
        
        // Store credentials permanently for this user on this device
        const currentDeviceFingerprint = generateDeviceFingerprint();
        localStorage.setItem('permanentName', name);
        localStorage.setItem('permanentStudentId', studentId);
        localStorage.setItem('permanentPhone', phone);
        localStorage.setItem('permanentEmail', email);
        localStorage.setItem('deviceFingerprint', currentDeviceFingerprint);
        
        console.log("=== CREDENTIALS STORED PERMANENTLY ON THIS DEVICE ===");
        console.log("Device Fingerprint:", currentDeviceFingerprint);
      }

      console.log("=== SUBMITTING LEAVE REQUEST ===");
      
      const requestData = {
        name,
        email,
        phone,
        student_id: studentId,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason,
      };
      
      console.log("Request data being sent:", requestData);
      console.log("Token being used:", token ? "Present" : "Missing");
      
      try {
        const response = await fetch(`http://${window.location.hostname}:8000/api/leave-requests/create/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        });

        if (response.status === 401) {
          setError("Your session has expired. Please log in again.");
          localStorage.removeItem("access");
          setTimeout(() => {
            navigate('/');
          }, 3000);
          return;
        }

        if (response.status === 400) {
          // Bad Request - get detailed error from API
          try {
            const errorData = await response.json();
            console.error("=== 400 BAD REQUEST DETAILS ===");
            console.error("Full error response:", JSON.stringify(errorData, null, 2));
            console.error("Error keys:", Object.keys(errorData));
            
            let errorMessage = "Failed to submit leave request";
            
            // Try multiple error message formats
            if (errorData.message) {
              errorMessage = errorData.message;
              console.error("Found message:", errorData.message);
            } else if (errorData.error) {
              errorMessage = errorData.error;
              console.error("Found error:", errorData.error);
            } else if (errorData.detail) {
              errorMessage = errorData.detail;
              console.error("Found detail:", errorData.detail);
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
              console.error("Error is string:", errorData);
            } else {
              // If it's an object with field-specific errors
              const fieldErrors = [];
              for (const [field, errors] of Object.entries(errorData)) {
                if (Array.isArray(errors)) {
                  fieldErrors.push(`${field}: ${errors.join(', ')}`);
                } else if (typeof errors === 'string') {
                  fieldErrors.push(`${field}: ${errors}`);
                }
              }
              if (fieldErrors.length > 0) {
                errorMessage = fieldErrors.join('; ');
                console.error("Field errors:", fieldErrors);
              }
            }
            
            console.error("Final error message:", errorMessage);
            setError(errorMessage);
            return;
          } catch (parseError) {
            console.error("Could not parse 400 error response:", parseError);
            setError("Bad Request - Please check all fields and try again");
            return;
          }
        }

        if (response.ok) {
          // Show success toast immediately
          toast.update(submitToastId, { 
            render: "Leave request submitted successfully!", 
            type: "success", 
            isLoading: false,
            autoClose: 2000
          });
          
          // Trigger leave request update event
          window.dispatchEvent(new Event("leaveRequestUpdated"));
          localStorage.setItem("leaveRequestUpdated", Date.now().toString());
          
          // Clear form
          setName('');
          setEmail('');
          setPhone('');
          setStudentId('');
          setLeaveType('SL');
          setStartDate(getCurrentDate());
          setEndDate(getCurrentDate());
          setReason('');
          
          // Navigate back quickly
          setTimeout(() => {
            navigate('/dashboard/leave-request');
          }, 1500);
          
        } else {
          const errorData = await response.json();
          console.error('Error submitting leave request:', errorData);
          toast.update(submitToastId, { 
            render: errorData.message || 'Failed to submit leave request', 
            type: "error", 
            isLoading: false,
            autoClose: 3000
          });
        }
      } catch (submitError) {
        console.error("Submit error:", submitError);
        toast.update(submitToastId, { 
          render: 'An error occurred while submitting the leave request', 
          type: "error", 
          isLoading: false,
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error("General error:", error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="w-full px-0 py-0">
          {/* Back Button */}
          <div className="p-4">
            <button
              onClick={() => navigate('/leave-request')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-4"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back
            </button>
          </div>
          
          {/* Leave Request Form */}
          <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6">
                {/* Error/Success Message Display */}
                {error && (
                  <div className={`mb-6 p-4 rounded-lg text-sm ${error.includes("successfully") ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
                    <div className="flex items-center gap-2">
                      {error.includes("successfully") ? (
                        <span>✅ {error}</span>
                      ) : (
                        <span>❌ {error}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Form Fields in 2-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information Fields */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2 font-sans">Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={handleNameChange}
                      placeholder="Enter full name"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition ${
                        nameError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      required
                    />
                    {nameError && (
                      <p className="mt-1 text-sm text-red-600 font-medium">{nameError}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2 font-sans">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2 font-sans">Phone Number *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="Enter phone number"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition ${
                        phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      required
                    />
                    {phoneError && (
                      <p className="mt-1 text-sm text-red-600 font-medium">{phoneError}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2 font-sans">Student ID *</label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={handleStudentIdChange}
                      placeholder="Enter student ID"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition ${
                        studentIdError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      required
                    />
                    {studentIdError && (
                      <p className="mt-1 text-sm text-red-600 font-medium">{studentIdError}</p>
                    )}
                  </div>
                  
                  {/* Date Fields */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2 font-sans">Start Date *</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={dateRange.min}
                      max={dateRange.max}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2 font-sans">End Date *</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={dateRange.min}
                      max={dateRange.max}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  
                  {/* Leave Type Field */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Leave Type
                      </label>
                      <select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      >
                        <option value="">Select Leave Type</option>
                        <option value="CL">Casual Leave</option>
                        <option value="SL">Sick Leave </option>
                        <option value="EL">Earned Leave </option>
                        <option value="PTO">Paid Time Off</option>
                        <option value="ML">Maternity Leave</option>
                        <option value="PL">Paternity Leave</option>
                        <option value="BL">Bereavement Leave</option>
                        <option value="CO">Compensatory Off</option>
                        <option value="PH">Public Holidays</option>
                        <option value="LWP">Loss of Pay </option>
                        <option value="WFH">Work From Home</option>
                        <option value="SAB">Sabbatical Leave</option>
                        <option value="MRL">Marriage Leave</option>
                       
                      </select>
                    </div>
                  </div>
                  
                  {/* Reason Field - Spans multiple columns */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2 font-sans">Reason for Leave *</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please provide a detailed reason for your leave request..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                      rows={4}
                      required
                    />
                  </div>
                  
                  {/* Submit Button - Spans multiple columns */}
                  <div className="md:col-span-2">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faPlus} />
                          Submit Leave Request
                        </>
                      )}
                    </button>
                  </div>
                </div>
            </form>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default NewLeaveRequest;
