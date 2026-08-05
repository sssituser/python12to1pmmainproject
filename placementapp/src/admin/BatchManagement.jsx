import React, { useState, useEffect } from "react";
import { Plus, Search, Calendar, Users, Clock, CheckCircle2, AlertCircle, Edit, Shield, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function BatchManagement() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const getStoredToken = () => localStorage.getItem("access")?.replace(/^"|"$/g, "");

  const handleDeleteBatch = async (batchId, batchName) => {
    if (!window.confirm(`Are you sure you want to delete batch "${batchName}"?`)) return;
    const token = getStoredToken();
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/batches/${batchId}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Batch "${batchName}" deleted successfully.`);
        fetchBatches();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Failed to delete batch.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error deleting batch.");
    }
  };
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    code: "",
    course_id: "",
    timing: "",
    expected_start_date: "",
    expected_end_date: "",
    max_students: 30,
    status: "Upcoming",
    description: ""
  });

  const fetchCourses = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/courses/`, {
        headers: { Authorization: `Bearer ${getStoredToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : data.results || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/batches/`, {
        headers: { Authorization: `Bearer ${getStoredToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBatches(data.data || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch batches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchBatches();
  }, []);

  const handleOpenModal = (batch = null) => {
    if (batch) {
      setFormData({
        id: batch.id,
        name: batch.name,
        code: batch.code,
        course_id: batch.course_id,
        timing: batch.timing || "",
        expected_start_date: batch.expected_start_date || "",
        expected_end_date: batch.expected_end_date || "",
        max_students: batch.max_students || 30,
        status: batch.status || "Upcoming",
        description: batch.description || ""
      });
    } else {
      setFormData({
        id: null,
        name: "",
        code: "",
        course_id: courses[0]?.id || "",
        timing: "9:00 AM - 11:00 AM",
        expected_start_date: "",
        expected_end_date: "",
        max_students: 30,
        status: "Upcoming",
        description: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getStoredToken();
    const url = formData.id 
      ? `http://${window.location.hostname}:8000/api/batches/${formData.id}/update/`
      : `http://${window.location.hostname}:8000/api/batches/create/`;
    
    const method = formData.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Batch saved successfully!");
        setIsModalOpen(false);
        fetchBatches();
      } else {
        toast.error(data.detail || "Error saving batch.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error saving batch.");
    }
  };

  const filteredBatches = batches.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.course_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Running':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    currentUser = null;
  }
  const isAdmin = currentUser?.role?.toString().toLowerCase() === "admin";

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Batch Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin 
              ? "Organize student groups, schedules, dynamic timelines, and course batches" 
              : "View student groups, schedules, dynamic timelines, and course batches"}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create New Batch
          </button>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by batch name, code, course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Running">Running</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* BATCHES GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(n => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-gray-200 animate-pulse h-48" />
          ))}
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center text-gray-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No batches found matching criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map(batch => (
            <div key={batch.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase text-blue-600 tracking-wider bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    {batch.code}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(batch.status)}`}>
                    {batch.status}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-lg">{batch.name}</h3>
                <p className="text-xs font-semibold text-gray-500 mb-4">{batch.course_title}</p>

                <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{batch.timing || "Timing not specified"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{batch.expected_start_date || "TBD"} — {batch.expected_end_date || "TBD"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{batch.current_students} / {batch.max_students} Students Enrolled</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenModal(batch)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Details
                  </button>

                  <button
                    onClick={() => handleDeleteBatch(batch.id, batch.name)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Batch
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {formData.id ? "Edit Batch Details" : "Create New Batch"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Batch Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Python FullStack Batch A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Batch Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PY-2026-M1"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Course</label>
                  <select
                    required
                    value={formData.course_id}
                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Batch Timing (IST)</label>
                <div className="flex items-center gap-2 p-1.5 border border-gray-300 rounded-xl bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 shadow-sm">
                  {/* Manual Text Input */}
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM - 11:00 AM IST"
                    value={formData.timing}
                    onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                    className="flex-1 px-2.5 py-1 text-sm outline-none bg-transparent min-w-0 font-medium text-gray-800 placeholder-gray-400"
                  />
                  
                  <div className="h-5 w-[1px] bg-gray-200" />
                  
                  {/* Time Pickers inside the same bar */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 pr-1 shrink-0">
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                      <span className="text-[10px] font-bold uppercase text-gray-400">Start</span>
                      <input
                        type="time"
                        title="Pick Start Time (IST)"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const [h, m] = val.split(":");
                          let hours = parseInt(h, 10);
                          const ampm = hours >= 12 ? "PM" : "AM";
                          hours = hours % 12 || 12;
                          const formattedHours = hours < 10 ? `0${hours}` : hours;
                          const formattedStart = `${formattedHours}:${m} ${ampm}`;
                          
                          let currentEnd = "";
                          if (formData.timing.includes("-")) {
                            currentEnd = formData.timing.split("-")[1].trim();
                          }
                          const newTiming = currentEnd ? `${formattedStart} - ${currentEnd}` : formattedStart;
                          setFormData({ ...formData, timing: newTiming });
                        }}
                        className="bg-transparent text-xs font-medium text-gray-700 outline-none cursor-pointer w-16"
                      />
                    </div>

                    <span className="text-gray-400 font-semibold">-</span>

                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                      <span className="text-[10px] font-bold uppercase text-gray-400">End</span>
                      <input
                        type="time"
                        title="Pick End Time (IST)"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const [h, m] = val.split(":");
                          let hours = parseInt(h, 10);
                          const ampm = hours >= 12 ? "PM" : "AM";
                          hours = hours % 12 || 12;
                          const formattedHours = hours < 10 ? `0${hours}` : hours;
                          const formattedEnd = `${formattedHours}:${m} ${ampm}`;
                          
                          let currentStart = "";
                          if (formData.timing.includes("-")) {
                            currentStart = formData.timing.split("-")[0].trim();
                          } else if (formData.timing.trim()) {
                            currentStart = formData.timing.trim();
                          }
                          const newTiming = currentStart ? `${currentStart} - ${formattedEnd}` : formattedEnd;
                          setFormData({ ...formData, timing: newTiming });
                        }}
                        className="bg-transparent text-xs font-medium text-gray-700 outline-none cursor-pointer w-16"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Expected Start</label>
                  <input
                    type="date"
                    value={formData.expected_start_date}
                    onChange={(e) => setFormData({ ...formData, expected_start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Expected End</label>
                  <input
                    type="date"
                    value={formData.expected_end_date}
                    onChange={(e) => setFormData({ ...formData, expected_end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Running">Running</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
