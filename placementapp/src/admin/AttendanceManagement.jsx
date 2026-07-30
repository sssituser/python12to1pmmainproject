import React, { useState, useEffect, useMemo } from "react";
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle, Save, Users, Download, Search } from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

export default function AttendanceManagement() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Scalable Search & Pagination States
  const [searchStudent, setSearchStudent] = useState("");
  const [filterAttendanceStatus, setFilterAttendanceStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const getStoredToken = () => localStorage.getItem("access")?.replace(/^"|"$/g, "");

  const [usersMap, setUsersMap] = useState({});

  const fetchCoursesAndBatches = async () => {
    try {
      const token = getStoredToken();
      const hostname = window.location.hostname;

      // 1. Fetch Courses
      const cRes = await fetch(`http://${hostname}:8000/api/courses/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (cRes.ok) {
        const cData = await cRes.json();
        setCourses(Array.isArray(cData) ? cData : (cData.data || cData.results || []));
      }

      // 2. Fetch Batches
      const bRes = await fetch(`http://${hostname}:8000/api/batches/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (bRes.ok) {
        const bData = await bRes.json();
        let bList = [];
        if (Array.isArray(bData)) {
          bList = bData;
        } else if (Array.isArray(bData.data)) {
          bList = bData.data;
        } else if (Array.isArray(bData.results)) {
          bList = bData.results;
        }
        setBatches(bList);
        if (bList.length > 0 && !selectedBatchId) {
          setSelectedBatchId(bList[0].id);
        }
      }

      // 3. Fetch All Users to build dynamic Student ID map
      const uRes = await fetch(`http://${hostname}:8000/api/all-users/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (uRes.ok) {
        const uData = await uRes.json();
        const map = {};
        if (Array.isArray(uData)) {
          uData.forEach(u => {
            const displayId = u.studentprofile?.student_id || u.student_id || u.student_id_val;
            if (displayId) {
              map[u.id] = displayId;
              if (u.username) map[u.username] = displayId;
              if (u.email) map[u.email] = displayId;
            }
          });
        }
        setUsersMap(map);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedBatchId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/attendance/${selectedBatchId}/?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${getStoredToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(Array.isArray(data.records) ? data.records : []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch attendance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndBatches();
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
      fetchAttendance();
    }
  }, [selectedBatchId, selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setStudents(prev => (Array.isArray(prev) ? prev : []).map(s => s.student_id === studentId ? { ...s, status } : s));
  };

  const handleMarkAll = (status) => {
    setStudents(prev => (Array.isArray(prev) ? prev : []).map(s => ({ ...s, status })));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setStudents(prev => (Array.isArray(prev) ? prev : []).map(s => s.student_id === studentId ? { ...s, remarks } : s));
  };

  const filteredBatches = (Array.isArray(batches) ? batches : []).filter(b => {
    if (selectedCourseId === "all") return true;
    return String(b.course_id || b.course) === String(selectedCourseId);
  });

  const handleSave = async () => {
    if (!selectedBatchId) return;
    setSaving(true);

    const payload = {
      batch_id: selectedBatchId,
      date: selectedDate,
      records: students.map(s => ({
        student_id: s.student_id,
        status: s.status === 'Unmarked' ? 'Present' : s.status,
        remarks: s.remarks || ''
      }))
    };

    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/attendance/mark/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Attendance saved successfully.");
        fetchAttendance();
      } else {
        toast.error(data.detail || "Failed to save attendance.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error saving attendance.");
    } finally {
      setSaving(false);
    }
  };

  // Excel Export: Date Range Attendance (Start Date to End Date) - Separate Course & Batch Wise Sheets
  const handleExportRangeAttendance = async () => {
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start Date cannot be after End Date.");
      return;
    }

    setExporting(true);
    const workbook = XLSX.utils.book_new();
    const token = getStoredToken();
    const hostname = window.location.hostname;

    try {
      // 1. General Range Summary Sheet
      const summaryRows = [
        { Parameter: "Report Title", Details: "Custom Range Student Attendance Audit Report" },
        { Parameter: "Start Date", Details: startDate },
        { Parameter: "End Date", Details: endDate },
        { Parameter: "Generated On", Details: new Date().toLocaleString() },
        { Parameter: "Filter Course ID", Details: selectedCourseId === "all" ? "All Courses" : selectedCourseId },
        { Parameter: "Total Batches Included", Details: filteredBatches.length }
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(workbook, wsSummary, "Date Range Summary");

      // 2. Iterate through each batch and collect date range records
      for (const batch of filteredBatches) {
        const matchedCourse = courses.find(c => String(c.id) === String(batch.course_id || batch.course));
        const courseTitle = matchedCourse?.title || matchedCourse?.name || "General Course";

        let batchRangeRows = [];

        // Loop from Start Date to End Date
        const curr = new Date(startDate);
        const last = new Date(endDate);

        while (curr <= last) {
          const dateStr = curr.toISOString().split('T')[0];
          try {
            const res = await fetch(`http://${hostname}:8000/api/attendance/${batch.id}/?date=${dateStr}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              const recordsList = Array.isArray(data.records) ? data.records : [];
              
              recordsList.forEach(st => {
                batchRangeRows.push({
                  "Date": dateStr,
                  "Student Name": st.name || st.username || "N/A",
                  "Student ID": usersMap[st.student_id] || usersMap[st.email] || usersMap[st.username] || st.studentprofile?.student_id || st.student_id_val || (st.student_id && String(st.student_id).length > 3 ? st.student_id : null) || `SSSIT-${st.student_id || st.id}`,
                  "Contact Email": st.email || "N/A",
                  "Course Title": courseTitle,
                  "Batch Name": batch.name || batch.batch_name || "Cohort",
                  "Batch Code": batch.code || "N/A",
                  "Attendance Status": st.status || "Unmarked",
                  "Faculty Remarks": st.remarks || "—"
                });
              });
            }
          } catch (dErr) {
            console.warn(`Error fetching date ${dateStr} for batch ${batch.id}`, dErr);
          }

          curr.setDate(curr.getDate() + 1);
        }

        // Add sheet for this batch
        const rawSheetName = `${batch.name || 'Batch'}_${batch.code || batch.id}`.replace(/[:\\/?*\[\]]/g, "_");
        const sheetName = rawSheetName.substring(0, 31);

        // Sort rows by Student Name then Date for multi-student clarity
        batchRangeRows.sort((a, b) => {
          if (a["Student Name"] !== b["Student Name"]) {
            return a["Student Name"].localeCompare(b["Student Name"]);
          }
          return a["Date"].localeCompare(b["Date"]);
        });

        const wsBatch = XLSX.utils.json_to_sheet(
          batchRangeRows.length > 0 ? batchRangeRows : [{ Note: `No attendance records logged between ${startDate} and ${endDate}.` }]
        );

        // Auto-fit column widths for clear readability in Excel
        if (batchRangeRows.length > 0) {
          const colWidths = [
            { wch: 12 }, // Date
            { wch: 25 }, // Student Name
            { wch: 14 }, // Student ID
            { wch: 30 }, // Contact Email
            { wch: 22 }, // Course Title
            { wch: 20 }, // Batch Name
            { wch: 16 }, // Batch Code
            { wch: 18 }, // Attendance Status
            { wch: 25 }  // Faculty Remarks
          ];
          wsBatch['!cols'] = colWidths;
        }

        XLSX.utils.book_append_sheet(workbook, wsBatch, sheetName);
      }

      XLSX.writeFile(workbook, `Attendance_Report_${startDate}_to_${endDate}.xlsx`);
      toast.success("Date Range Attendance Excel exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate range attendance report.");
    } finally {
      setExporting(false);
    }
  };

  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    currentUser = null;
  }
  const userRole = currentUser?.role?.toString().toLowerCase();
  const isStudent = userRole === "student";
  const isAdmin = userRole === "admin";
  const isReadOnly = isStudent || isAdmin;

  const filteredStudents = useMemo(() => {
    return (Array.isArray(students) ? students : []).filter(s => {
      const q = searchStudent.toLowerCase().trim();
      const name = `${s.name || ''} ${s.username || ''}`.toLowerCase();
      const email = String(s.email || '').toLowerCase();
      const sid = String(s.student_id || s.id || '').toLowerCase();

      const matchesSearch = !q || name.includes(q) || email.includes(q) || sid.includes(q);
      const matchesStatus = filterAttendanceStatus === "all" ? true : s.status === filterAttendanceStatus;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchStudent, filterAttendanceStatus]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const presentCount = students.filter(s => s.status === 'Present').length;
  const absentCount = students.filter(s => s.status === 'Absent').length;
  const lateCount = students.filter(s => s.status === 'Late').length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Batch Attendance Tracker
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin
              ? "Read-only attendance audit overview recorded by faculty members"
              : isStudent 
              ? "View your daily attendance history and records" 
              : "Dynamic course-wise and batch-wise attendance management & audit reporting"}
          </p>
        </div>
        
        {isAdmin ? (
          <button
            onClick={handleExportRangeAttendance}
            disabled={exporting}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Generating Excel..." : "Download Date Range Excel"}
          </button>
        ) : !isReadOnly && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMarkAll('Present')}
              disabled={students.length === 0}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('Absent')}
              disabled={students.length === 0}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              Mark All Absent
            </button>
            <button
              onClick={handleSave}
              disabled={saving || students.length === 0}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        )}
      </div>

      {/* DYNAMIC SUMMARY TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</p>
          <p className="text-xl font-extrabold text-slate-800 mt-0.5">{students.length}</p>
        </div>
        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 shadow-2xs">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Present</p>
          <p className="text-xl font-extrabold text-emerald-800 mt-0.5">{presentCount}</p>
        </div>
        <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200/80 shadow-2xs">
          <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Absent</p>
          <p className="text-xl font-extrabold text-rose-800 mt-0.5">{absentCount}</p>
        </div>
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 shadow-2xs">
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Late / Excused</p>
          <p className="text-xl font-extrabold text-amber-800 mt-0.5">{lateCount}</p>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 w-full md:w-auto items-center">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Filter Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  const matching = batches.filter(b => e.target.value === 'all' || String(b.course_id || b.course) === String(e.target.value));
                  if (matching.length > 0) setSelectedBatchId(matching[0].id);
                }}
                className="px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 min-w-[180px]"
              >
                <option value="all">All Courses</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title || c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Batch</label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
              >
                {filteredBatches.map(b => (
                  <option key={b.id} value={b.id}>{b.name || b.batch_name} ({b.code || "Cohort"})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">View Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {isAdmin && (
            <div className="px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" /> Audit Mode (Read-Only)
            </div>
          )}
        </div>

        {/* DATE RANGE EXPORT CONTROLS */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase">Export Date Range:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={handleExportRangeAttendance}
            disabled={exporting}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Generating Range Excel..." : "Download Range Excel (Batch & Course-Wise)"}
          </button>
        </div>
      </div>

      {/* ATTENDANCE TABLE CONTROLS (SEARCH & PAGINATION) */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search student by name, email, ID..."
            value={searchStudent}
            onChange={(e) => {
              setSearchStudent(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Status:</span>
            <select
              value={filterAttendanceStatus}
              onChange={(e) => {
                setFilterAttendanceStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="Present">Present Only</option>
              <option value="Absent">Absent Only</option>
              <option value="Late">Late Only</option>
              <option value="Unmarked">Unmarked</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* ATTENDANCE TABLE */}
      {loading ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 animate-pulse text-center">Loading attendance...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center text-gray-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No enrolled students found matching search criteria in this batch.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-white border-b border-slate-800 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">S.No</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 text-center">Attendance Status</th>
                  <th className="p-4">Remarks & Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedStudents.map((s, idx) => (
                  <tr key={s.student_id || idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-xs font-semibold text-slate-400">{(currentPage - 1) * pageSize + idx + 1}</td>
                    <td className="p-4 font-semibold text-gray-900 capitalize">{s.name || s.username}</td>
                    <td className="p-4 font-mono text-xs font-bold text-slate-800">
                      {usersMap[s.student_id] || usersMap[s.email] || usersMap[s.username] || s.studentprofile?.student_id || s.student_id_val || (s.student_id && String(s.student_id).length > 3 ? s.student_id : null) || `SSSIT-${s.student_id || s.id}`}
                    </td>
                    <td className="p-4 text-gray-500 text-xs">{s.email || "N/A"}</td>
                    <td className="p-4">
                      {isReadOnly ? (
                        <div className="text-center">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold border inline-block ${
                            s.status === 'Present' ? 'bg-green-100 text-green-700 border-green-200' :
                            s.status === 'Absent' ? 'bg-red-100 text-red-700 border-red-200' :
                            s.status === 'Late' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {s.status}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          {['Present', 'Absent', 'Late', 'Excused'].map(st => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(s.student_id, st)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                s.status === st
                                  ? st === 'Present' ? 'bg-green-600 text-white border-green-600 shadow'
                                    : st === 'Absent' ? 'bg-red-600 text-white border-red-600 shadow'
                                    : st === 'Late' ? 'bg-amber-500 text-white border-amber-500 shadow'
                                    : 'bg-blue-600 text-white border-blue-600 shadow'
                                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {isReadOnly ? (
                        <div className="text-xs text-gray-600">
                          <span>{s.remarks || "—"}</span>
                          {s.marked_by && (
                            <span className="block text-[11px] text-slate-400 mt-0.5 font-medium">By: {s.marked_by}</span>
                          )}
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder="Optional remarks..."
                          value={s.remarks || ''}
                          onChange={(e) => handleRemarksChange(s.student_id, e.target.value)}
                          className="w-full px-2.5 py-1 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* DYNAMIC PAGINATION FOOTER */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-100 text-xs text-slate-500">
            <div>
              Showing {Math.min((currentPage - 1) * pageSize + 1, filteredStudents.length)} to {Math.min(currentPage * pageSize, filteredStudents.length)} of {filteredStudents.length} students
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              
              <span className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
