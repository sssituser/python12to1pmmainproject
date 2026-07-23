import React, { useState, useEffect } from "react";
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle, Save, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function AttendanceManagement() {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const getStoredToken = () => localStorage.getItem("access")?.replace(/^"|"$/g, "");

  const fetchBatches = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/batches/`, {
        headers: { Authorization: `Bearer ${getStoredToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        const bList = data.data || [];
        setBatches(bList);
        if (bList.length > 0 && !selectedBatchId) {
          setSelectedBatchId(bList[0].id);
        }
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
        setStudents(data.records || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch attendance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
      fetchAttendance();
    }
  }, [selectedBatchId, selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setStudents(prev => prev.map(s => s.student_id === studentId ? { ...s, status } : s));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setStudents(prev => prev.map(s => s.student_id === studentId ? { ...s, remarks } : s));
  };

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

  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    currentUser = null;
  }
  const isStudent = currentUser?.role?.toString().toLowerCase() === "student";

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Batch Attendance Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isStudent 
              ? "View your daily attendance history and records" 
              : "Mark and monitor daily attendance records for enrolled batch students"}
          </p>
        </div>
        {!isStudent && (
          <button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Attendance"}
          </button>
        )}
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Batch</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500 min-w-[240px]"
            >
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* ATTENDANCE TABLE */}
      {loading ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 animate-pulse text-center">Loading attendance...</div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center text-gray-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No enrolled students found in this batch.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-center">Attendance Status</th>
                <th className="p-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map(s => (
                <tr key={s.student_id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-semibold text-gray-900">{s.name || s.username}</td>
                  <td className="p-4 text-gray-500 text-xs">{s.email || "N/A"}</td>
                  <td className="p-4">
                    {isStudent ? (
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
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
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
                    {isStudent ? (
                      <span className="text-xs text-gray-600">{s.remarks || "—"}</span>
                    ) : (
                      <input
                        type="text"
                        placeholder="Optional remarks..."
                        value={s.remarks || ''}
                        onChange={(e) => handleRemarksChange(s.student_id, e.target.value)}
                        className="w-full px-2.5 py-1 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-green-500"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
