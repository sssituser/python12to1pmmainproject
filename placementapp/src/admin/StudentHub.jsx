import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw, 
  ChevronUp, 
  ChevronDown, 
  Building, 
  GraduationCap, 
  Phone, 
  Mail, 
  Calendar, 
  Layers, 
  BookOpen, 
  AlertCircle,
  X,
  Check,
  Edit3,
  Lock,
  Unlock,
  UserPlus,
  Zap,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { toast } from "react-toastify";
import { useSEO } from "../utils/useSEO";
import AttendanceManagement from "./AttendanceManagement";

// Helper functions to safely extract string titles from primitive values or objects
const getCourseDisplayName = (courseObj) => {
  if (!courseObj) return "Unassigned";
  if (typeof courseObj === "string") return courseObj;
  if (typeof courseObj === "object") return courseObj.title || courseObj.name || `Course #${courseObj.id}`;
  return String(courseObj);
};

const getBatchDisplayName = (batchObj) => {
  if (!batchObj) return "Unassigned";
  if (typeof batchObj === "string") return batchObj;
  if (typeof batchObj === "object") return batchObj.batch_name || batchObj.name || `Batch #${batchObj.id}`;
  return String(batchObj);
};

// Interactive Multi-Select Course Dropdown with Checkboxes
const MultiCourseSelectDropdown = ({ selectedCourseIds = [], availableCourses = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validCourses = availableCourses.filter(c => {
    const title = (c.name || c.title || "").trim().toLowerCase();
    return title && title !== "all batches" && title !== "all courses";
  });

  const handleToggle = (cIdStr) => {
    const isChecked = selectedCourseIds.includes(cIdStr);
    const updated = isChecked
      ? selectedCourseIds.filter(id => id !== cIdStr)
      : [...selectedCourseIds, cIdStr];
    onChange(updated);
  };

  const handleSelectAll = () => {
    const allIds = validCourses.map(c => String(c.id));
    onChange(allIds);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const selectedCourseObjs = validCourses.filter(c => selectedCourseIds.includes(String(c.id)));
  
  const getButtonText = () => {
    if (selectedCourseObjs.length === 0) return "Select Courses...";
    if (selectedCourseObjs.length === 1) return selectedCourseObjs[0].name || selectedCourseObjs[0].title;
    return `${selectedCourseObjs.length} Courses Selected`;
  };

  return (
    <div className="relative w-full text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full p-2.5 mt-1 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-sm font-medium text-slate-700 flex items-center justify-between shadow-sm transition active:scale-[0.99]"
      >
        <span className="truncate">{getButtonText()}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Select Multiple Courses</span>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={handleSelectAll}
                className="text-[10px] font-bold text-indigo-600 hover:underline"
              >
                Select All
              </button>
              <button 
                type="button"
                onClick={handleClearAll}
                className="text-[10px] font-bold text-slate-400 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {validCourses.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No courses available</p>
            ) : (
              validCourses.map(c => {
                const cIdStr = String(c.id);
                const isChecked = selectedCourseIds.includes(cIdStr);
                return (
                  <label
                    key={c.id}
                    className={`flex items-center justify-between p-2 hover:bg-indigo-50/60 rounded-xl cursor-pointer transition text-xs font-semibold ${
                      isChecked ? "text-indigo-900 bg-indigo-50/40" : "text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(cIdStr)}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="truncate">{c.name || c.title}</span>
                    </div>
                    {isChecked && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </label>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider hover:bg-indigo-700 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Interactive Multi-Select Batch Dropdown with Checkboxes
const MultiBatchSelectDropdown = ({ student, batches, onUpdateBatches }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getAssignedIds = () => {
    let ids = [];
    if (Array.isArray(student.assigned_batches)) {
      ids = [...student.assigned_batches];
    } else if (Array.isArray(student.studentprofile?.assigned_batches)) {
      ids = [...student.studentprofile.assigned_batches];
    }
    const single = student.studentprofile?.batch || student.batch;
    if (single && !ids.some(i => String(i) === String(single))) {
      ids.push(single);
    }
    const enrolled = student.enrolled_courses || student.studentprofile?.enrolled_courses || [];
    if (Array.isArray(enrolled)) {
      enrolled.forEach(c => {
        if (c.batch_id && !ids.some(i => String(i) === String(c.batch_id))) {
          ids.push(c.batch_id);
        }
      });
    }
    return ids.map(String);
  };

  const [selectedIds, setSelectedIds] = useState(getAssignedIds());

  useEffect(() => {
    setSelectedIds(getAssignedIds());
  }, [student]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (bIdStr) => {
    let updated;
    if (selectedIds.includes(bIdStr)) {
      updated = selectedIds.filter(i => i !== bIdStr);
    } else {
      updated = [...selectedIds, bIdStr];
    }
    setSelectedIds(updated);
    onUpdateBatches(student.id, updated);
  };

  const handleSelectAll = () => {
    const allIds = batches.map(b => String(b.id));
    setSelectedIds(allIds);
    onUpdateBatches(student.id, allIds);
  };

  const handleClearAll = () => {
    setSelectedIds([]);
    onUpdateBatches(student.id, []);
  };

  const selectedBatchObjs = batches.filter(b => selectedIds.includes(String(b.id)));
  const getButtonText = () => {
    if (selectedBatchObjs.length === 0) return "-- No Batch --";
    if (selectedBatchObjs.length === 1) return selectedBatchObjs[0].batch_name || selectedBatchObjs[0].name;
    return `${selectedBatchObjs.length} Batches Selected`;
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="px-3 py-1.5 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 flex items-center justify-between gap-2 shadow-sm transition active:scale-95"
      >
        <span className="truncate max-w-[130px]">{getButtonText()}</span>
        <ChevronDown className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:left-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assign Multiple Batches</span>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={handleSelectAll}
                className="text-[10px] font-bold text-indigo-600 hover:underline"
              >
                All
              </button>
              <button 
                type="button"
                onClick={handleClearAll}
                className="text-[10px] font-bold text-slate-400 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
            {batches.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No batches created yet</p>
            ) : (
              batches.map(b => {
                const bIdStr = String(b.id);
                const isChecked = selectedIds.includes(bIdStr);
                return (
                  <label
                    key={b.id}
                    className="flex items-center gap-2.5 p-2 hover:bg-indigo-50/60 rounded-xl cursor-pointer transition text-xs font-semibold text-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggle(bIdStr)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="truncate">{b.batch_name || b.name}</span>
                  </label>
                );
              })
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider hover:bg-indigo-700 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const extractId = (val) => {
  if (!val) return "";
  if (typeof val === "object") return val.id?.toString() || "";
  return val.toString();
};

const getStudentIdDisplay = (student) => {
  if (!student) return "N/A";
  const val = 
    student.student_id ?? 
    student.studentprofile?.student_id ?? 
    student.student_profile?.student_id ?? 
    student.random_id;
  
  if (val !== null && val !== undefined && String(val).trim() !== "" && String(val) !== "null" && String(val) !== "N/A") {
    return String(val);
  }

  // Mandatory Fallback: If no custom student_id exists yet, derive from student.id or profile id so it never displays N/A
  if (student.id) {
    return String(student.id);
  }
  return "N/A";
};

function StudentHub({ defaultTab }) {
  useSEO("Dynamic Student Management & Approvals", "Manage active students, review pending registration requests, and handle student approvals in a real-time dynamic dashboard.");
  
  const location = useLocation();
  const navigate = useNavigate();

  // Active Tab from prop, search param, or default
  const getInitialTab = () => {
    if (defaultTab) return defaultTab;
    const params = new URLSearchParams(location.search);
    const urlTab = params.get("tab");
    if (urlTab === "approvals" || urlTab === "pending") return "approvals";
    if (urlTab === "history") return "history";
    return "students";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Live Auto Sync state
  const [isLiveSync, setIsLiveSync] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  // Managed Students States
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [searchStudent, setSearchStudent] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, blocked
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterBatch, setFilterBatch] = useState("all");
  const [studentSortBy, setStudentSortBy] = useState("name");
  const [studentSortOrder, setStudentSortOrder] = useState("asc");

  // Pagination for Students
  const [studentPage, setStudentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Approval & Audit States
  const [approvals, setApprovals] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingApprovals, setLoadingApprovals] = useState(true);
  const [searchApproval, setSearchApproval] = useState("");
  const [approvalStatusFilter, setApprovalStatusFilter] = useState("pending");
  const [approvalSortBy, setApprovalSortBy] = useState("registration_date");
  const [approvalSortOrder, setApprovalSortOrder] = useState("desc");
  const [approvalPage, setApprovalPage] = useState(1);
  const [approvalTotalPages, setApprovalTotalPages] = useState(1);
  const [approvalTotalCount, setApprovalTotalCount] = useState(0);

  // Metadata Dropdowns
  const [availableCourses, setAvailableCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  // Modals
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Edit Student Modal
  const [editingStudent, setEditingStudent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    student_id: "",
    course_id: "",
    batch_id: "",
    is_active: true
  });

  // Create Student Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    student_id: "",
    course_id: "",
    batch_id: ""
  });

  // Multi-Course Assignment Modal State
  const [isAssignCoursesModalOpen, setIsAssignCoursesModalOpen] = useState(false);
  const [assignTargetStudent, setAssignTargetStudent] = useState(null);
  const [selectedCourseIdsToAssign, setSelectedCourseIdsToAssign] = useState([]);
  const [assignBatchMap, setAssignBatchMap] = useState({});

  const handleOpenAssignCoursesModal = (student) => {
    setAssignTargetStudent(student);
    const existing = student.enrolled_courses || student.studentprofile?.enrolled_courses || [];
    setSelectedCourseIdsToAssign(existing.map(c => c.id));
    
    const bMap = {};
    existing.forEach(c => {
      if (c.batch_id) bMap[c.id] = c.batch_id;
    });
    setAssignBatchMap(bMap);
    setIsAssignCoursesModalOpen(true);
  };

  const handleSaveStudentCoursesSubmit = async (e) => {
    e.preventDefault();
    if (!assignTargetStudent) return;

    if (selectedCourseIdsToAssign.length === 0) {
      if (!window.confirm(`Are you sure you want to un-enroll ${assignTargetStudent.username} from ALL courses?`)) {
        return;
      }
    }

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/student/courses/assign/`, {
        method: "POST",
        body: JSON.stringify({
          student_id: assignTargetStudent.id,
          course_ids: selectedCourseIdsToAssign,
          batch_map: assignBatchMap
        })
      });

      if (res.ok) {
        toast.success(`Updated courses & batch assignments for ${assignTargetStudent.username}!`);
        setIsAssignCoursesModalOpen(false);
        fetchAllUsers();
      } else {
        toast.error("Failed to update student courses.");
      }
    } catch (err) {
      toast.error("Error assigning courses to student.");
    }
  };

  // Helper HTTP Requests
  const refreshAccessToken = async () => {
    const currentToken = localStorage.getItem("access");
    if (currentToken && currentToken.startsWith("mock_admin_token_")) {
      return currentToken;
    }
    try {
      const refreshToken = localStorage.getItem("refresh")?.replace(/^"|"$/g, "");
      if (!refreshToken) throw new Error("No refresh token");
      const response = await fetch(`http://${window.location.hostname}:8000/api/jwt/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access", data.access);
        return data.access;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }
    return null;
  };

  const makeAuthenticatedRequest = async (url, options = {}) => {
    let token = localStorage.getItem("access")?.replace(/^"|"$/g, "");
    const headers = {
      ...options.headers,
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      if (token) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
          res = await fetch(url, { ...options, headers });
        } else {
          localStorage.removeItem("access");
        }
      }
    }
    return res;
  };

  // Data Fetching Functions
  const fetchCourses = useCallback(async () => {
    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/courses/`);
      if (res.ok) {
        const data = await res.json();
        setAvailableCourses(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  }, []);

  const fetchBatches = useCallback(async () => {
    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/batches/`);
      if (res.ok) {
        const data = await res.json();
        setBatches(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch batches", err);
    }
  }, []);

  const fetchAllUsers = useCallback(async (silent = false) => {
    if (!silent) setLoadingStudents(true);
    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/all-users/`);
      if (res && res.ok) {
        const data = await res.json();
        const studentList = data.filter(u => 
          ((u.role || 'student').toLowerCase() === 'student') && 
          !u.is_staff && 
          !u.username.toLowerCase().includes('admin')
        );
        setStudents(studentList);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      if (!silent) setLoadingStudents(false);
    }
  }, []);

  const fetchApprovals = useCallback(async (silent = false) => {
    if (!silent) setLoadingApprovals(true);
    try {
      const params = new URLSearchParams({
        search: searchApproval,
        sort_by: approvalSortBy,
        order: approvalSortOrder,
        page: approvalPage.toString(),
        page_size: "10"
      });
      
      if (activeTab === "approvals") {
        params.append("status", "pending");
      } else if (activeTab === "history") {
        params.append("status", approvalStatusFilter === "all" ? "approved,rejected" : approvalStatusFilter);
      } else if (approvalStatusFilter !== "all") {
        params.append("status", approvalStatusFilter);
      }

      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/admin/student-approvals/?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          const studentOnlyData = (result.data || []).filter(item => {
            const uName = (item.username || '').toLowerCase();
            const uEmail = (item.email || '').toLowerCase();
            return !uName.includes('admin') && !uEmail.includes('admin@placement.com');
          });
          setApprovals(studentOnlyData);
          if (result.audit_logs) {
            setAuditLogs(result.audit_logs);
          }
          setApprovalTotalPages(result.pagination.pages);
          setApprovalTotalCount(studentOnlyData.length);
        }
      }
    } catch (err) {
      console.error("Error fetching approvals:", err);
    } finally {
      if (!silent) setLoadingApprovals(false);
    }
  }, [activeTab, searchApproval, approvalStatusFilter, approvalSortBy, approvalSortOrder, approvalPage]);

  // Initial Load
  useEffect(() => {
    fetchCourses();
    fetchBatches();
    fetchAllUsers();
    fetchApprovals();
  }, [fetchCourses, fetchBatches, fetchAllUsers, fetchApprovals]);

  // Tab or filter change refetch
  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  // Real-time Event Listener for Dynamic Updates
  useEffect(() => {
    const handleStudentDataUpdated = () => {
      fetchAllUsers(true);
      fetchApprovals(true);
    };
    window.addEventListener("studentDataUpdated", handleStudentDataUpdated);
    const handleStorageChange = (e) => {
      if (e.key === "studentDataUpdated") handleStudentDataUpdated();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("studentDataUpdated", handleStudentDataUpdated);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [fetchAllUsers, fetchApprovals]);

  // Live Sync Polling (Only for Admin / Faculty)
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdminOrFaculty = currentUser.role === "admin" || currentUser.role === "faculty" || currentUser.is_staff;
    if (!isLiveSync || !isAdminOrFaculty) return;

    const interval = setInterval(async () => {
      setIsSyncing(true);
      await Promise.all([fetchAllUsers(true), fetchApprovals(true)]);
      setLastSyncTime(new Date());
      setIsSyncing(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [isLiveSync, fetchAllUsers, fetchApprovals]);

  // Dynamic Derived Stats
  const activeStudentsCount = useMemo(() => students.filter(s => s.is_active).length, [students]);
  const blockedStudentsCount = useMemo(() => students.filter(s => !s.is_active).length, [students]);
  const pendingApprovalsCount = useMemo(() => {
    return approvals.filter(a => a.approval_status === "pending").length || (activeTab === "approvals" ? approvalTotalCount : 0);
  }, [approvals, activeTab, approvalTotalCount]);

  // Dynamic Optimistic Actions
  const handleToggleStatus = async (student) => {
    const newStatus = !student.is_active;
    const actionText = student.is_active ? "block" : "unblock";
    
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, is_active: newStatus } : s));

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/update-user-status/${student.id}/`, {
        method: "PUT",
        body: JSON.stringify({ is_active: newStatus })
      });
      if (res.ok) {
        toast.success(`Student ${actionText}ed dynamically`);
      } else {
        setStudents(prev => prev.map(s => s.id === student.id ? { ...s, is_active: student.is_active } : s));
        toast.error(`Failed to ${actionText} student`);
      }
    } catch (err) {
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, is_active: student.is_active } : s));
      toast.error(`Error updating student status`);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student account? This action is permanent.")) return;
    
    setStudents(prev => prev.filter(s => s.id !== studentId));

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/delete-user/${studentId}/`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Student account deleted dynamically");
      } else {
        fetchAllUsers();
        toast.error("Failed to delete student");
      }
    } catch (err) {
      fetchAllUsers();
      toast.error("Error deleting student");
    }
  };

  // Inline Dynamic Multi-Batch Assignment
  const handleInlineBatchAssign = async (studentId, batchIds) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const batchArray = Array.isArray(batchIds) ? batchIds : [batchIds].filter(Boolean);
    const primaryBatch = batchArray.length > 0 ? batchArray[0] : "";

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const selectedBatchObjs = batches.filter(b => batchArray.map(String).includes(String(b.id)));
        const batchNames = selectedBatchObjs.map(b => b.batch_name || b.name).join(", ");
        return {
          ...s,
          assigned_batches: batchArray,
          studentprofile: {
            ...s.studentprofile,
            batch: primaryBatch,
            assigned_batches: batchArray,
            batch_name: batchNames || "No Batch"
          }
        };
      }
      return s;
    }));

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/update-student/${studentId}/`, {
        method: "PUT",
        body: JSON.stringify({ 
          batch_id: primaryBatch,
          assigned_batches: batchArray 
        })
      });
      if (res.ok) {
        toast.success("Assigned batches updated dynamically");
      } else {
        fetchAllUsers();
        toast.error("Failed to update batch assignment");
      }
    } catch (err) {
      fetchAllUsers();
      toast.error("Error assigning batch");
    }
  };

  // Edit Modal Actions
  // Edit Modal Actions
  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    const existingId = getStudentIdDisplay(student);

    // Collect enrolled course IDs
    const enrolled = student.enrolled_courses || student.studentprofile?.enrolled_courses || [];
    let initialCourseIds = enrolled.map(c => String(c.id));
    const singleCourse = extractId(student.studentprofile?.course || student.course);
    if (singleCourse && !initialCourseIds.includes(String(singleCourse))) {
      initialCourseIds.push(String(singleCourse));
    }

    // Collect assigned batch IDs
    let initialBatchIds = Array.isArray(student.assigned_batches) 
      ? student.assigned_batches.map(String) 
      : Array.isArray(student.studentprofile?.assigned_batches) 
      ? student.studentprofile.assigned_batches.map(String) 
      : [];
    const singleBatch = extractId(student.studentprofile?.batch || student.batch);
    if (singleBatch && !initialBatchIds.includes(String(singleBatch))) {
      initialBatchIds.push(String(singleBatch));
    }
    if (Array.isArray(enrolled)) {
      enrolled.forEach(c => {
        if (c.batch_id && !initialBatchIds.includes(String(c.batch_id))) {
          initialBatchIds.push(String(c.batch_id));
        }
      });
    }

    setEditFormData({
      first_name: student.first_name || "",
      last_name: student.last_name || "",
      email: student.email || "",
      student_id: existingId === "N/A" ? "" : existingId,
      course_id: initialCourseIds[0] || "",
      course_ids: initialCourseIds,
      batch_id: initialBatchIds[0] || "",
      batch_ids: initialBatchIds,
      is_active: student.is_active
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      const primaryCourse = (editFormData.course_ids && editFormData.course_ids.length > 0) ? editFormData.course_ids[0] : editFormData.course_id;
      const primaryBatch = (editFormData.batch_ids && editFormData.batch_ids.length > 0) ? editFormData.batch_ids[0] : editFormData.batch_id;

      // Optimistically update local state immediately
      setStudents(prev => prev.map(s => {
        if (s.id === editingStudent.id) {
          return {
            ...s,
            first_name: editFormData.first_name,
            last_name: editFormData.last_name,
            email: editFormData.email,
            student_id: editFormData.student_id,
            studentprofile: {
              ...(s.studentprofile || {}),
              student_id: editFormData.student_id
            }
          };
        }
        return s;
      }));

      const payload = {
        first_name: editFormData.first_name,
        last_name: editFormData.last_name,
        email: editFormData.email,
        student_id: editFormData.student_id,
        course_id: primaryCourse,
        batch_id: primaryBatch,
        assigned_batches: editFormData.batch_ids || []
      };

      console.log("DEBUG handleSaveEdit payload:", JSON.stringify(payload));

      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/update-student/${editingStudent.id}/`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      // Save multi-course selection if courses were chosen
      if (editFormData.course_ids && editFormData.course_ids.length > 0) {
        const batchMap = {};
        editFormData.course_ids.forEach((cId, idx) => {
          batchMap[cId] = (editFormData.batch_ids && editFormData.batch_ids[idx]) || primaryBatch || "";
        });

        await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/student/courses/assign/`, {
          method: "POST",
          body: JSON.stringify({
            student_id: editingStudent.id,
            course_ids: editFormData.course_ids,
            batch_map: batchMap
          })
        });
      }

      if (res.ok) {
        toast.success("Student profile and courses updated successfully!");
        setIsEditModalOpen(false);
        fetchAllUsers();
        window.dispatchEvent(new Event("studentDataUpdated"));
        localStorage.setItem("studentDataUpdated", Date.now().toString());
      } else {
        const data = await res.json();
        toast.error(data.error || data.detail || "Failed to update student details");
        fetchAllUsers();
      }
    } catch (err) {
      toast.error("Error updating student");
      fetchAllUsers();
    }
  };

  // Create Student Handler
  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.username || !addFormData.email || !addFormData.password) {
      toast.warning("Username, Email, and Password are required!");
      return;
    }
    try {
      const payload = {
        ...addFormData,
        role: "student",
        is_active: true
      };
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/create-student/`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const studentData = await res.json();
        const newStudentId = studentData.id || studentData.user_id || studentData.data?.id;

        // Save course selection if courses were chosen
        if (newStudentId && addFormData.course_ids && addFormData.course_ids.length > 0) {
          const batchMap = {};
          addFormData.course_ids.forEach((cId) => {
            batchMap[cId] = addFormData.batch_id || "";
          });

          await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/student/courses/assign/`, {
            method: "POST",
            body: JSON.stringify({
              student_id: newStudentId,
              course_ids: addFormData.course_ids,
              batch_map: batchMap
            })
          });
        }

        toast.success("New student created successfully!");
        setIsAddModalOpen(false);
        setAddFormData({
          username: "",
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          student_id: "",
          course_id: "",
          course_ids: [],
          batch_id: ""
        });
        fetchAllUsers();
      } else {
        const data = await res.json();
        toast.error(data.detail || data.error || "Failed to create student.");
      }
    } catch (err) {
      toast.error("Error adding new student");
    }
  };

  // Approval Actions
  const handleApprove = async () => {
    if (!selectedBatchId) {
      toast.warning("Please select a batch to assign the student.");
      return;
    }

    setApprovals(prev => prev.map(a => a.id === selectedStudent.id ? { ...a, approval_status: "approved" } : a));

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/admin/student-approvals/${selectedStudent.id}/approve/`, {
        method: "POST",
        body: JSON.stringify({ batch_id: selectedBatchId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Student account approved dynamically!");
        setIsApproveModalOpen(false);
        setSelectedStudent(null);
        setSelectedBatchId("");
        fetchApprovals();
        fetchAllUsers();
      } else {
        toast.error(data.message || "Failed to approve student.");
        fetchApprovals();
      }
    } catch (err) {
      toast.error("Error submitting approval decision.");
      fetchApprovals();
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.warning("Please enter a reason for rejection.");
      return;
    }

    setApprovals(prev => prev.map(a => a.id === selectedStudent.id ? { ...a, approval_status: "rejected" } : a));

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/admin/student-approvals/${selectedStudent.id}/reject/`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectionReason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Student registration rejected.");
        setIsRejectModalOpen(false);
        setSelectedStudent(null);
        setRejectionReason("");
        fetchApprovals();
      } else {
        toast.error(data.message || "Failed to reject student.");
        fetchApprovals();
      }
    } catch (err) {
      toast.error("Error submitting rejection decision.");
      fetchApprovals();
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Username,First Name,Last Name,Email,Course,Batch,Status\n";
    filteredStudents.forEach(s => {
      const courseStr = `"${s.studentprofile?.course_name || getCourseDisplayName(s.studentprofile?.course)}"`;
      const batchStr = `"${s.studentprofile?.batch_name || getBatchDisplayName(s.studentprofile?.batch)}"`;
      const status = s.is_active ? "Active" : "Blocked";
      csvContent += `${s.id},${s.username},${s.first_name || ''},${s.last_name || ''},${s.email},${courseStr},${batchStr},${status}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `students_dynamic_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamic Filtering & Sorting
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const searchLower = searchStudent.toLowerCase().trim();
      const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      const enrolledTitles = (s.enrolled_courses || s.studentprofile?.enrolled_courses || [])
        .map(c => String(c.title || c.name || '').toLowerCase()).join(' ');
      const batchNameStr = getBatchDisplayName(s.studentprofile?.batch).toLowerCase();

      const matchesSearch = 
        !searchLower ||
        String(s.username || '').toLowerCase().includes(searchLower) ||
        String(s.email || '').toLowerCase().includes(searchLower) ||
        fullName.includes(searchLower) ||
        String(s.student_id || s.studentprofile?.student_id || '').toLowerCase().includes(searchLower) ||
        enrolledTitles.includes(searchLower) ||
        batchNameStr.includes(searchLower);

      const matchesStatus = 
        filterStatus === "all" ? true :
        filterStatus === "active" ? s.is_active :
        filterStatus === "blocked" ? !s.is_active : true;

      // Dynamic Course Matching (By ID, Title, or Enrolled Courses Array)
      let matchesCourse = filterCourse === "all";
      if (!matchesCourse) {
        const targetStr = filterCourse.toString().trim().toLowerCase();
        
        // 1. Check studentprofile.course ID / title
        const pCourseId = extractId(s.studentprofile?.course).toLowerCase();
        const pCourseName = getCourseDisplayName(s.studentprofile?.course).toLowerCase();
        if (pCourseId === targetStr || pCourseName.includes(targetStr) || targetStr.includes(pCourseName)) {
          matchesCourse = true;
        }

        // 2. Check enrolled_courses array
        const enrolled = s.enrolled_courses || s.studentprofile?.enrolled_courses || [];
        if (!matchesCourse && Array.isArray(enrolled)) {
          matchesCourse = enrolled.some(c => {
            const cId = String(c.id || c.course_id || "").toLowerCase();
            const cTitle = String(c.title || c.name || "").toLowerCase();
            return cId === targetStr || cTitle.includes(targetStr) || targetStr.includes(cTitle);
          });
        }
      }

      // Dynamic Batch Matching (By ID, Name, Assigned Batches, or Enrolled Courses)
      let matchesBatch = filterBatch === "all";
      if (!matchesBatch) {
        const targetBatchStr = filterBatch.toString().trim().toLowerCase();
        
        // 1. Check studentprofile.batch ID / name
        const pBatchId = extractId(s.studentprofile?.batch).toLowerCase();
        const pBatchName = getBatchDisplayName(s.studentprofile?.batch).toLowerCase();
        if (pBatchId === targetBatchStr || pBatchName.includes(targetBatchStr) || targetBatchStr.includes(pBatchName)) {
          matchesBatch = true;
        }

        // 2. Check assigned_batches array
        const assignedB = s.assigned_batches || s.studentprofile?.assigned_batches || [];
        if (!matchesBatch && Array.isArray(assignedB)) {
          matchesBatch = assignedB.some(bId => String(bId).toLowerCase() === targetBatchStr);
        }

        // 3. Check enrolled_courses batch_id
        const enrolled = s.enrolled_courses || s.studentprofile?.enrolled_courses || [];
        if (!matchesBatch && Array.isArray(enrolled)) {
          matchesBatch = enrolled.some(c => String(c.batch_id || "").toLowerCase() === targetBatchStr);
        }
      }

      return matchesSearch && matchesStatus && matchesCourse && matchesBatch;
    }).sort((a, b) => {
      let valA = (a.first_name || a.username).toLowerCase();
      let valB = (b.first_name || b.username).toLowerCase();
      if (studentSortBy === "id") {
        valA = (a.studentprofile?.student_id || '').toLowerCase();
        valB = (b.studentprofile?.student_id || '').toLowerCase();
      } else if (studentSortBy === "email") {
        valA = a.email.toLowerCase();
        valB = b.email.toLowerCase();
      }
      return studentSortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [students, searchStudent, filterStatus, filterCourse, filterBatch, studentSortBy, studentSortOrder]);

  // Paginated Students
  const paginatedStudents = useMemo(() => {
    if (pageSize === 0) return filteredStudents;
    const startIndex = (studentPage - 1) * pageSize;
    return filteredStudents.slice(startIndex, startIndex + pageSize);
  }, [filteredStudents, studentPage, pageSize]);

  const totalStudentPages = useMemo(() => {
    if (pageSize === 0) return 1;
    return Math.ceil(filteredStudents.length / pageSize) || 1;
  }, [filteredStudents, pageSize]);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearchStudent("");
    setFilterStatus("all");
    setFilterCourse("all");
    setFilterBatch("all");
    setStudentPage(1);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100/60 shadow-sm">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">SSSIT Student Hub</h1>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" /> Live Dynamic
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">Real-time student administration, instant status toggles, batch assignments & registration verification</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Sync Toggle */}
          <button 
            onClick={() => setIsLiveSync(prev => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition ${
              isLiveSync 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm" 
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
            title="Toggle background live auto-sync"
          >
            <span className={`w-2 h-2 rounded-full ${isLiveSync ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`}></span>
            Auto Sync: {isLiveSync ? "ON" : "OFF"}
          </button>

          <button 
            onClick={() => { 
              setIsSyncing(true);
              Promise.all([fetchAllUsers(), fetchApprovals()]).then(() => {
                setLastSyncTime(new Date());
                setIsSyncing(false);
                toast.info("Data refreshed dynamically");
              });
            }}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-indigo-600" : ""}`} />
            {isSyncing ? "Syncing..." : "Refresh"}
          </button>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-sm text-sm"
          >
            <UserPlus className="w-4 h-4" />
            + Add Student
          </button>
        </div>
      </div>

      {/* Interactive Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Enrolled */}
        <div 
          onClick={() => { setActiveTab("students"); setFilterStatus("all"); }}
          className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition hover:shadow-md hover:border-blue-300 ${
            activeTab === "students" && filterStatus === "all" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10" : "border-slate-200/80"
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Registered</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{students.length}</h3>
            <p className="text-xs text-blue-600 mt-1 font-medium">Click to view all</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 2: Active Students */}
        <div 
          onClick={() => { setActiveTab("students"); setFilterStatus("active"); }}
          className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition hover:shadow-md hover:border-emerald-300 ${
            activeTab === "students" && filterStatus === "active" ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10" : "border-slate-200/80"
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Accounts</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{activeStudentsCount}</h3>
            <p className="text-xs text-emerald-600/80 mt-1 font-medium">
              {students.length > 0 ? Math.round((activeStudentsCount / students.length) * 100) : 0}% active ratio
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 3: Pending Approvals */}
        <div 
          onClick={() => setActiveTab("approvals")}
          className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition hover:shadow-md hover:border-amber-300 ${
            activeTab === "approvals" ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20" : "border-slate-200/80"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Verification</p>
              {pendingApprovalsCount > 0 && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{pendingApprovalsCount}</h3>
            <p className="text-xs text-amber-600/80 mt-1 font-medium">Requires action</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 4: Blocked Students */}
        <div 
          onClick={() => { setActiveTab("students"); setFilterStatus("blocked"); }}
          className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition hover:shadow-md hover:border-rose-300 ${
            activeTab === "students" && filterStatus === "blocked" ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/10" : "border-slate-200/80"
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Blocked Accounts</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{blockedStudentsCount}</h3>
            <p className="text-xs text-rose-600/80 mt-1 font-medium">Access restricted</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
            <UserX className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Container with Custom Dynamic Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Navigation Bar */}
        <div className="border-b border-slate-200 bg-slate-50/60 px-6 pt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-1 sm:space-x-2 border-b border-transparent">
            <button
              onClick={() => setActiveTab("students")}
              className={`px-4 py-3 font-semibold text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                activeTab === "students"
                  ? "bg-white text-indigo-600 border-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 border-transparent"
              }`}
            >
              <Users className="w-4 h-4" />
              All Managed Students
              <span className="ml-1.5 px-2.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
                {filteredStudents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("approvals")}
              className={`px-4 py-3 font-semibold text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                activeTab === "approvals"
                  ? "bg-white text-indigo-600 border-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 border-transparent"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Pending Registrations
              {pendingApprovalsCount > 0 && (
                <span className="ml-1.5 px-2.5 py-0.5 text-xs rounded-full bg-amber-500 text-white font-bold animate-pulse">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-3 font-semibold text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                activeTab === "history"
                  ? "bg-white text-indigo-600 border-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 border-transparent"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Approval Audit Trail
            </button>

            <button
              onClick={() => setActiveTab("attendance")}
              className={`px-4 py-3 font-semibold text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                activeTab === "attendance"
                  ? "bg-white text-indigo-600 border-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 border-transparent"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Batch Attendance Tracker
            </button>
          </div>

          <div className="text-xs text-slate-400 pb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Last updated: {lastSyncTime.toLocaleTimeString()}
          </div>
        </div>

        {/* TAB 1: ALL MANAGED STUDENTS */}
        {activeTab === "students" && (
          <div className="p-6 space-y-4">
            {/* Dynamic Search & Filter Controls Bar */}
            <div className="flex flex-col lg:flex-row gap-3 justify-between items-center bg-slate-50/80 p-4 rounded-xl border border-slate-200/70">
              <div className="relative w-full lg:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Live search by name, email, student ID..."
                  value={searchStudent}
                  onChange={(e) => { setSearchStudent(e.target.value); setStudentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
                {searchStudent && (
                  <button onClick={() => setSearchStudent("")} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                {/* Status Filter */}
                <select 
                  value={filterStatus} 
                  onChange={(e) => { setFilterStatus(e.target.value); setStudentPage(1); }}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="blocked">Blocked Only</option>
                </select>

                {/* Course Filter */}
                <select 
                  value={filterCourse} 
                  onChange={(e) => { setFilterCourse(e.target.value); setStudentPage(1); }}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">All Courses</option>
                  {availableCourses.map(c => (
                    <option key={c.id} value={c.id}>{c.name || c.title}</option>
                  ))}
                </select>

                {/* Reset Filters */}
                {(searchStudent || filterStatus !== "all" || filterCourse !== "all") && (
                  <button 
                    onClick={handleResetFilters}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Reset all filters"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}

                <button 
                  onClick={handleExportCSV}
                  className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 pl-4">Student Profile</th>
                    <th className="p-3.5">Student ID</th>
                    <th className="p-3.5">Contact Email</th>
                    <th className="p-3.5">Enrolled Course</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loadingStudents ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        Loading student database...
                      </td>
                    </tr>
                  ) : paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-slate-400">
                        <UserX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No students found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((s) => {
                      const fullName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.username;
                      const courseNameDisplay = s.studentprofile?.course_name || getCourseDisplayName(s.studentprofile?.course);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition">
                          <td className="p-3.5 pl-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                                {fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{fullName}</p>
                                <p className="text-xs text-slate-400">@{s.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-xs">
                            {(() => {
                              const sid = getStudentIdDisplay(s);
                              if (sid !== "N/A") {
                                return (
                                  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg border border-slate-200 shadow-sm">
                                    {sid}
                                  </span>
                                );
                              }
                              return <span className="text-slate-400 font-medium">N/A</span>;
                            })()}
                          </td>
                          <td className="p-3.5 text-slate-600">{s.email}</td>
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {(() => {
                                const enrolled = s.enrolled_courses || s.studentprofile?.enrolled_courses || [];
                                if (enrolled && enrolled.length > 0) {
                                  return enrolled.map(c => (
                                    <span key={c.id} className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-100/80">
                                      {c.title}
                                    </span>
                                  ));
                                }
                                return (
                                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                                    {courseNameDisplay}
                                  </span>
                                );
                              })()}
                            </div>
                          </td>

                          <td className="p-3.5">
                            {s.is_active ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Blocked
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right pr-4">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Assign Multiple Courses Action */}
                              <button 
                                onClick={() => handleOpenAssignCoursesModal(s)}
                                title="Assign / Manage Courses for Student"
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                              >
                                <BookOpen className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleOpenEditModal(s)}
                                title="Edit details"
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleToggleStatus(s)}
                                title={s.is_active ? "Block user" : "Unblock user"}
                                className={`p-1.5 rounded-lg transition ${
                                  s.is_active 
                                    ? "text-slate-500 hover:text-amber-600 hover:bg-amber-50" 
                                    : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                                }`}
                              >
                                {s.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </button>
                              <button 
                                onClick={() => handleDeleteStudent(s.id)}
                                title="Delete account"
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Dynamic Pagination Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Per Page:</span>
                <select 
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setStudentPage(1); }}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={0}>All</option>
                </select>
                <span>Showing {filteredStudents.length > 0 ? (studentPage - 1) * pageSize + 1 : 0} to {pageSize === 0 ? filteredStudents.length : Math.min(studentPage * pageSize, filteredStudents.length)} of {filteredStudents.length}</span>
              </div>

              {pageSize > 0 && totalStudentPages > 1 && (
                <div className="flex items-center gap-1">
                  <button 
                    disabled={studentPage === 1}
                    onClick={() => setStudentPage(p => p - 1)}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 font-semibold text-slate-700">
                    Page {studentPage} of {totalStudentPages}
                  </span>
                  <button 
                    disabled={studentPage === totalStudentPages}
                    onClick={() => setStudentPage(p => p + 1)}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PENDING REGISTRATION APPROVALS */}
        {activeTab === "approvals" && (
          <div className="p-6 space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-slate-50/80 p-4 rounded-xl border border-slate-200/70">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Live search pending requests by name, email, college..."
                  value={searchApproval}
                  onChange={(e) => setSearchApproval(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/80 font-semibold">
                  {approvals.filter(a => (a.status || a.approval_status) === "pending").length} Pending Registration(s)
                </span>
              </div>
            </div>

            {/* Approvals Cards */}
            <div className="space-y-3">
              {loadingApprovals ? (
                <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                  Fetching pending registration requests...
                </div>
              ) : approvals.filter(a => (a.status || a.approval_status) === "pending").length === 0 ? (
                <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
                  <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
                  <h3 className="text-base font-semibold text-slate-800">All caught up!</h3>
                  <p className="text-sm text-slate-500 mt-1">There are no pending registration requests at the moment.</p>
                </div>
              ) : (
                approvals.filter(a => (a.status || a.approval_status) === "pending").map((profile) => {
                  const studentName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username || (profile.user ? (profile.user.first_name ? `${profile.user.first_name} ${profile.user.last_name || ''}`.trim() : profile.user.username) : 'Student');
                  const emailDisplay = profile.email || profile.user?.email || 'No email';
                  const registeredCourseDisplay = profile.registered_course || profile.course_name || 'Aptitude and Reasoning';
                  return (
                    <div 
                      key={profile.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {studentName.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-slate-900">{studentName}</h4>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-md">
                              Pending Verification
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-400" /> {emailDisplay}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Course: {registeredCourseDisplay}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Registered: {profile.registration_date || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <button
                          onClick={() => { setSelectedStudent(profile); setIsDetailsModalOpen(true); }}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                        <button
                          onClick={() => { setSelectedStudent(profile); setIsRejectModalOpen(true); }}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button
                          onClick={() => { setSelectedStudent(profile); setIsApproveModalOpen(true); }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve & Assign Batch
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: APPROVAL AUDIT TRAIL */}
        {activeTab === "history" && (
          <div className="p-6 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-slate-50/80 p-4 rounded-xl border border-slate-200/70">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search history by student name, action..."
                  value={searchApproval}
                  onChange={(e) => setSearchApproval(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={approvalStatusFilter}
                  onChange={(e) => setApprovalStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="all">Approved & Rejected</option>
                  <option value="approved">Approved Only</option>
                  <option value="rejected">Rejected Only</option>
                </select>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 pl-4">Student</th>
                    <th className="p-3.5">Student ID</th>
                    <th className="p-3.5">Action / Event</th>
                    <th className="p-3.5">Performed By</th>
                    <th className="p-3.5">Audit Details / Reason</th>
                    <th className="p-3.5 text-right pr-4">Action Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loadingApprovals ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        Loading audit trail records...
                      </td>
                    </tr>
                  ) : (() => {
                    // Combine auditLogs and non-pending approvals
                    const rawList = [...auditLogs];
                    
                    // Add non-pending approvals if not already logged
                    approvals.filter(a => (a.status || a.approval_status) !== "pending").forEach(a => {
                      const exists = rawList.some(item => String(item.user_id) === String(a.user_id) && item.action_type === a.approval_status);
                      if (!exists) {
                        rawList.push({
                          id: `app_${a.id}`,
                          user_id: a.user_id,
                          student_name: a.full_name || a.username,
                          student_email: a.email || "N/A",
                          student_id: a.student_id || a.studentId || a.user_id,
                          student_id_val: a.student_id || a.studentId || a.user_id,
                          action_type: a.approval_status || "approved",
                          action_title: (a.approval_status || "approved") === "approved" ? "Account Approved" : "Account Rejected",
                          performed_by: a.approved_by || "admin",
                          details: a.rejection_reason || (a.registered_course ? `Assigned Course: ${a.registered_course}` : "Account verified"),
                          action_date: a.approved_at || a.registration_date || "N/A"
                        });
                      }
                    });

                    // Keep ONLY Approved or Rejected records, deduplicated per student (showing 1 decision per student)
                    const approvalDecisionsOnly = [];
                    const seenUsers = new Set();

                    rawList.forEach(item => {
                      const act = (item.action_type || '').toLowerCase();
                      if (act === 'approved' || act === 'rejected') {
                        const key = String(item.user_id || item.student_name);
                        if (!seenUsers.has(key)) {
                          seenUsers.add(key);
                          approvalDecisionsOnly.push(item);
                        }
                      }
                    });

                    const searchLower = searchApproval.toLowerCase().trim();
                    const filtered = approvalDecisionsOnly.filter(item => {
                      const matchesSearch = !searchLower || 
                        (item.student_name || '').toLowerCase().includes(searchLower) ||
                        (item.student_email || '').toLowerCase().includes(searchLower) ||
                        String(item.student_id_val || item.student_id || '').toLowerCase().includes(searchLower) ||
                        (item.action_title || '').toLowerCase().includes(searchLower) ||
                        (item.details || '').toLowerCase().includes(searchLower);

                      if (!matchesSearch) return false;

                      if (approvalStatusFilter === "approved") {
                        return item.action_type === "approved";
                      }
                      if (approvalStatusFilter === "rejected") {
                        return item.action_type === "rejected";
                      }
                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan="6" className="p-12 text-center text-slate-400">
                            No historical audit or approval records found matching current filters.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((item, idx) => {
                      const actType = (item.action_type || 'updated').toLowerCase();
                      let badgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
                      let icon = <Sparkles className="w-3.5 h-3.5 text-blue-600" />;

                      if (actType === "approved") {
                        badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
                        icon = <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
                      } else if (actType === "rejected") {
                        badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
                        icon = <XCircle className="w-3.5 h-3.5 text-rose-600" />;
                      } else if (actType === "created") {
                        badgeStyle = "bg-indigo-50 text-indigo-700 border-indigo-200";
                        icon = <Sparkles className="w-3.5 h-3.5 text-indigo-600" />;
                      } else if (actType === "status_toggled") {
                        badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
                        icon = <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
                      } else if (actType === "deleted") {
                        badgeStyle = "bg-slate-100 text-slate-700 border-slate-300";
                        icon = <UserX className="w-3.5 h-3.5 text-slate-600" />;
                      }

                      return (
                        <tr key={item.id || idx} className="hover:bg-slate-50/70 transition">
                          <td className="p-3.5 pl-4">
                            <div>
                              <p className="font-semibold text-slate-900">{item.student_name}</p>
                              <p className="text-xs text-slate-400">{item.student_email || item.email || "N/A"}</p>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-xs">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg border border-slate-200 shadow-sm">
                              {item.student_id_val || item.student_id || "N/A"}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}>
                              {icon} {item.action_title || item.action_type}
                            </span>
                          </td>
                          <td className="p-3.5 text-xs font-semibold text-slate-700">
                            {item.performed_by || "Admin"}
                          </td>
                          <td className="p-3.5 text-xs text-slate-600 max-w-xs truncate">
                            {item.details || "Action recorded"}
                          </td>
                          <td className="p-3.5 text-right pr-4 text-xs font-medium text-slate-500">
                            {item.action_date || item.created_at || "N/A"}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: BATCH ATTENDANCE TRACKER */}
        {activeTab === "attendance" && (
          <div className="p-6">
            <AttendanceManagement />
          </div>
        )}
      </div>

      {/* --- MODAL 1: VIEW STUDENT DETAILS --- */}
      {isDetailsModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Student Profile Details</h3>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Full Name</p>
                  <p className="font-semibold text-slate-800">
                    {selectedStudent.user?.first_name} {selectedStudent.user?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Username</p>
                  <p className="font-semibold text-slate-800">@{selectedStudent.user?.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Email Address</p>
                  <p className="font-medium text-slate-800">{selectedStudent.user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Phone Number</p>
                  <p className="font-medium text-slate-800">{selectedStudent.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">College</p>
                  <p className="font-medium text-slate-800">{selectedStudent.college_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Branch / Year</p>
                  <p className="font-medium text-slate-800">{selectedStudent.branch || 'N/A'} ({selectedStudent.passout_year || 'N/A'})</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: APPROVE & ASSIGN BATCH --- */}
      {isApproveModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Approve Student Account</h3>
              </div>
              <button onClick={() => setIsApproveModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600">
              Assign a batch to approve registration for <strong className="text-slate-900">{selectedStudent.user?.first_name || selectedStudent.user?.username}</strong>.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Select Target Batch *</label>
              <select 
                value={selectedBatchId} 
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choose Batch --</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.batch_name || b.name || `Batch #${b.id}`}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={handleApprove}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: REJECT STUDENT --- */}
      {isRejectModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <h3 className="text-lg font-bold text-slate-900">Reject Registration</h3>
              </div>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600">
              Specify reason for rejecting <strong className="text-slate-900">{selectedStudent.user?.first_name || selectedStudent.user?.username}</strong>.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Rejection Reason *</label>
              <textarea 
                rows="3"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Invalid college ID or unverified credentials"
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: EDIT MANAGED STUDENT --- */}
      {isEditModalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200/90 shadow-2xl my-auto max-h-[90vh] flex flex-col">
            
            {/* Header (Fixed) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100/80">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Student Profile</h3>
                  <p className="text-xs text-slate-500">Update account info, enrolled courses, and batch assignments</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)} 
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body (Scrollable) */}
            <div className="overflow-y-auto space-y-4 pr-1 flex-1 py-1">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs font-semibold text-slate-700">First Name</label>
                  <input 
                    type="text" 
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                    className="w-full p-2.5 mt-1 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Last Name</label>
                  <input 
                    type="text" 
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                    className="w-full p-2.5 mt-1 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="text-sm">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <input 
                  type="email" 
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full p-2.5 mt-1 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div className="text-sm">
                <label className="text-xs font-semibold text-slate-700">Student ID</label>
                <input 
                  type="text" 
                  value={editFormData.student_id}
                  onChange={(e) => setEditFormData({...editFormData, student_id: e.target.value})}
                  className="w-full p-2.5 mt-1 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  placeholder="Enter unique Student ID"
                />
              </div>
            </div>

            {/* Footer (Fixed) */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 shrink-0">
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-indigo-500/25 transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL 5: ADD NEW STUDENT --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddStudentSubmit} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Add New Student Account</h3>
              </div>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="text-xs font-semibold text-slate-600">Username *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. john_doe"
                  value={addFormData.username}
                  onChange={(e) => setAddFormData({...addFormData, username: e.target.value})}
                  className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Password *</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={addFormData.password}
                  onChange={(e) => setAddFormData({...addFormData, password: e.target.value})}
                  className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="text-xs font-semibold text-slate-600">First Name</label>
                <input 
                  type="text" 
                  placeholder="John"
                  value={addFormData.first_name}
                  onChange={(e) => setAddFormData({...addFormData, first_name: e.target.value})}
                  className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Last Name</label>
                <input 
                  type="text" 
                  placeholder="Doe"
                  value={addFormData.last_name}
                  onChange={(e) => setAddFormData({...addFormData, last_name: e.target.value})}
                  className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="text-sm">
              <label className="text-xs font-semibold text-slate-600">Email Address *</label>
              <input 
                type="email" 
                required
                placeholder="john@example.com"
                value={addFormData.email}
                onChange={(e) => setAddFormData({...addFormData, email: e.target.value})}
                className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="text-sm">
              <label className="text-xs font-semibold text-slate-600">Student ID</label>
              <input 
                type="text" 
                placeholder="SSSIT2026-001"
                value={addFormData.student_id}
                onChange={(e) => setAddFormData({...addFormData, student_id: e.target.value})}
                className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm"
              >
                Create Student
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL: DYNAMIC MULTI-COURSE ASSIGNMENT --- */}
      {isAssignCoursesModalOpen && assignTargetStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveStudentCoursesSubmit} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Assign Multiple Courses</h3>
                  <p className="text-xs text-slate-500">Student: {assignTargetStudent.first_name ? `${assignTargetStudent.first_name} ${assignTargetStudent.last_name || ''}` : assignTargetStudent.username} ({assignTargetStudent.email})</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsAssignCoursesModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Courses & Assign Cohort Batches</p>
                <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full">
                  {selectedCourseIdsToAssign.length} Enrolled
                </span>
              </div>
              
              <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-2.5 max-h-72 overflow-y-auto">
                {availableCourses.length === 0 ? (
                  <p className="text-xs text-slate-400 p-4 text-center">No available courses found.</p>
                ) : (
                  availableCourses.map((course) => {
                    const isChecked = selectedCourseIdsToAssign.includes(course.id);
                    const courseBatches = batches.filter(b => b.course_id === course.id);
                    return (
                      <div key={course.id} className={`p-3 rounded-xl border transition-all ${isChecked ? 'bg-indigo-50/70 border-indigo-200 shadow-2xs' : 'bg-white hover:bg-slate-100/60 border-slate-200/80'}`}>
                        <div className="flex items-center justify-between gap-3">
                          <label className="flex items-center gap-3 cursor-pointer flex-1">
                            <input 
                              type="checkbox"
                              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCourseIdsToAssign([...selectedCourseIdsToAssign, course.id]);
                                } else {
                                  setSelectedCourseIdsToAssign(selectedCourseIdsToAssign.filter(id => id !== course.id));
                                }
                              }}
                            />
                            <div>
                              <span className={`text-xs font-bold ${isChecked ? 'text-indigo-950' : 'text-slate-700'}`}>{course.title || course.name}</span>
                              <span className="ml-2 text-[10px] text-slate-400 font-medium font-mono">({course.level || 'Beginner'})</span>
                            </div>
                          </label>

                          {isChecked && (
                            <button
                              type="button"
                              onClick={() => setSelectedCourseIdsToAssign(selectedCourseIdsToAssign.filter(id => id !== course.id))}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition text-xs flex items-center gap-1"
                              title="Un-enroll course"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {isChecked && (
                          <div className="mt-2.5 pl-7 border-t border-indigo-100/60 pt-2 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batch:</span>
                            <select
                              className="px-2.5 py-1 text-xs border border-indigo-200 rounded-lg bg-white font-semibold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 shadow-2xs"
                              value={assignBatchMap[course.id] || ""}
                              onChange={(e) => setAssignBatchMap({ ...assignBatchMap, [course.id]: e.target.value ? parseInt(e.target.value) : null })}
                            >
                              <option value="">-- Self-Paced (No Batch) --</option>
                              {courseBatches.length > 0 ? (
                                courseBatches.map(b => (
                                  <option key={b.id} value={b.id}>{b.batch_name || b.name} ({b.code || 'Cohort'})</option>
                                ))
                              ) : (
                                batches.map(b => (
                                  <option key={b.id} value={b.id}>{b.batch_name || b.name}</option>
                                ))
                              )}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsAssignCoursesModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl shadow-sm"
              >
                Save Enrolled Courses
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default StudentHub;
