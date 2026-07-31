import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert, 
  Layers, 
  BookOpen, 
  Calendar, 
  Video, 
  X, 
  Zap, 
  Eye, 
  EyeOff, 
  Check, 
  Lock, 
  Mail, 
  Phone, 
  GraduationCap
} from "lucide-react";
import { toast } from "react-toastify";
import { useSEO } from "../utils/useSEO";

import FacultyAssignment from "./FacultyAssignment";
import LiveClasses from "../faculty/LiveClasses";

function AdminPanel() {
  useSEO("SSSIT Faculty Hub Management", "Professional, high-performance, and responsive faculty management system for SSSIT Admin Panel.");
  
  const navigate = useNavigate();
  const location = useLocation();

  // State Management
  const [facultyList, setFacultyList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [batchesList, setBatchesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLiveSync, setIsLiveSync] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  // Navigation Subtabs
  const [facultySubTab, setFacultySubTab] = useState("list"); // list, assignments, live-classes

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive
  const [courseFilter, setCourseFilter] = useState("all");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    student_id: "",
    course_id: "",
    batch_id: "",
    is_active: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const getStoredToken = () => localStorage.getItem("access")?.replace(/^"|"$/g, "");

  // Sync tab with URL route
  useEffect(() => {
    if (location.pathname.includes('/faculty-assignments') || location.pathname.includes('/faculty-assignment')) {
      setFacultySubTab("assignments");
    } else if (location.pathname.includes('/live-classes')) {
      setFacultySubTab("live-classes");
    } else {
      setFacultySubTab("list");
    }
  }, [location.pathname]);

  // Dynamic Data Fetching
  const fetchFacultyData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    const token = getStoredToken();
    const hostname = window.location.hostname;

    try {
      const [usersRes, coursesRes, batchesRes] = await Promise.allSettled([
        fetch(`http://${hostname}:8000/api/all-users/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://${hostname}:8000/api/courses/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://${hostname}:8000/api/batches/`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (usersRes.status === "fulfilled" && usersRes.value.ok) {
        const data = await usersRes.value.json();
        setFacultyList(Array.isArray(data) ? data.filter(u => u.role === 'faculty') : []);
      }

      if (coursesRes.status === "fulfilled" && coursesRes.value.ok) {
        const cData = await coursesRes.value.json();
        setCoursesList(Array.isArray(cData) ? cData : (cData.data || cData.results || []));
      }

      if (batchesRes.status === "fulfilled" && batchesRes.value.ok) {
        const bData = await batchesRes.value.json();
        setBatchesList(Array.isArray(bData) ? bData : (bData.data || bData.results || []));
      }

      setLastSyncTime(new Date());
    } catch (e) {
      console.error("Failed to fetch faculty data", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFacultyData();

    let interval;
    if (isLiveSync) {
      interval = setInterval(() => {
        fetchFacultyData(false);
      }, 12000);
    }
    return () => clearInterval(interval);
  }, [fetchFacultyData, isLiveSync]);

  // Statistics
  const activeCount = useMemo(() => facultyList.filter(f => f.is_active).length, [facultyList]);
  const inactiveCount = useMemo(() => facultyList.filter(f => !f.is_active).length, [facultyList]);

  // Dynamic Filtering Memo
  const filteredFaculty = useMemo(() => {
    return facultyList.filter(f => {
      const q = searchQuery.toLowerCase().trim();
      const name = `${f.first_name || ''} ${f.last_name || ''}`.toLowerCase();
      const email = String(f.email || '').toLowerCase();
      const username = String(f.username || '').toLowerCase();
      const fid = String(f.student_id || f.id || '').toLowerCase();

      const matchesSearch = !q || name.includes(q) || email.includes(q) || username.includes(q) || fid.includes(q);
      const matchesStatus = statusFilter === "all" ? true : statusFilter === "active" ? f.is_active : !f.is_active;

      return matchesSearch && matchesStatus;
    });
  }, [facultyList, searchQuery, statusFilter]);

  // Add Faculty Handler
  const handleAddFacultySubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    const token = getStoredToken();

    try {
      const payload = {
        ...formData,
        role: "faculty"
      };

      const res = await fetch(`http://${window.location.hostname}:8000/api/create-faculty/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && (data.success || data.id)) {
        toast.success("Faculty member created successfully!");
        setIsAddModalOpen(false);
        setFormData({
          username: "",
          email: "",
          first_name: "",
          last_name: "",
          password: "",
          student_id: "",
          course_id: "",
          batch_id: "",
          is_active: true
        });
        fetchFacultyData(true);
      } else {
        toast.error(data.detail || data.error || "Failed to create faculty member.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error submitting form.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (facultyId, currentStatus) => {
    const token = getStoredToken();
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/toggle-faculty-status/${facultyId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (res.ok) {
        toast.success(`Faculty ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        fetchFacultyData(true);
      } else {
        toast.error("Failed to update faculty status.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error toggling status.");
    }
  };

  // Delete Faculty
  const handleDeleteFaculty = async (facultyId) => {
    if (!window.confirm("Are you sure you want to delete this faculty member?")) return;
    const token = getStoredToken();
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/delete-faculty/${facultyId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Faculty member deleted successfully!");
        fetchFacultyData(true);
      } else {
        toast.error("Failed to delete faculty member.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error deleting faculty.");
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (faculty) => {
    setSelectedFaculty(faculty);
    setFormData({
      username: faculty.username || "",
      email: faculty.email || "",
      first_name: faculty.first_name || "",
      last_name: faculty.last_name || "",
      password: "",
      is_active: faculty.is_active ?? true
    });
    setIsEditModalOpen(true);
  };

  // Edit Faculty Handler
  const handleEditFacultySubmit = async (e) => {
    e.preventDefault();
    if (!selectedFaculty?.id) return;
    setFormSubmitting(true);
    const token = getStoredToken();

    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        is_active: formData.is_active
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await fetch(`http://${window.location.hostname}:8000/api/update-faculty/${selectedFaculty.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && (data.success || data.message)) {
        toast.success("Faculty updated successfully!");
        setIsEditModalOpen(false);
        setSelectedFaculty(null);
        fetchFacultyData(true);
      } else {
        toast.error(data.detail || data.error || "Failed to update faculty member.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error updating faculty.");
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600 font-semibold text-sm">Loading SSSIT Faculty Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50 font-sans">
      {/* 1. HEADER BANNER MATCHING STUDENT HUB PATTERN */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100/60 shadow-sm">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">SSSIT Faculty Hub</h1>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" /> Live Dynamic
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">Faculty staff management, instant status toggles, course assignments & live session monitoring</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
            onClick={() => fetchFacultyData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition text-sm disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition shadow-sm text-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            + Add Faculty
          </button>
        </div>
      </div>

      {/* 2. STATS SUMMARY CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => { setFacultySubTab("list"); setStatusFilter("all"); }}
          className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition hover:shadow-md ${
            facultySubTab === "list" && statusFilter === "all" ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10" : "border-slate-200/80"
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Faculty</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{facultyList.length}</h3>
            <p className="text-xs text-blue-600 mt-1 font-medium">All registered instructors</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div 
          onClick={() => { setFacultySubTab("list"); setStatusFilter("active"); }}
          className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition hover:shadow-md ${
            facultySubTab === "list" && statusFilter === "active" ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10" : "border-slate-200/80"
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Staff</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</h3>
            <p className="text-xs text-emerald-600/80 mt-1 font-medium">Currently active</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div 
          onClick={() => { setFacultySubTab("list"); setStatusFilter("inactive"); }}
          className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition hover:shadow-md ${
            facultySubTab === "list" && statusFilter === "inactive" ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/10" : "border-slate-200/80"
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Deactivated</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{inactiveCount}</h3>
            <p className="text-xs text-rose-600/80 mt-1 font-medium">Inactive access</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
            <UserX className="w-6 h-6" />
          </div>
        </div>

        <div 
          onClick={() => setFacultySubTab("assignments")}
          className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition hover:shadow-md ${
            facultySubTab === "assignments" ? "border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/10" : "border-slate-200/80"
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignments</p>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">{coursesList.length}</h3>
            <p className="text-xs text-purple-600/80 mt-1 font-medium">Course mapping</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. SUBTAB NAVIGATION BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 pt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFacultySubTab("list")}
              className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                facultySubTab === "list"
                  ? "bg-white text-blue-600 border-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 border-transparent"
              }`}
            >
              <Users className="w-4 h-4" />
              All Managed Faculty
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 font-bold">
                {facultyList.length}
              </span>
            </button>

            <button
              onClick={() => setFacultySubTab("assignments")}
              className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                facultySubTab === "assignments"
                  ? "bg-white text-blue-600 border-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 border-transparent"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Faculty Course Assignments
            </button>

            <button
              onClick={() => setFacultySubTab("live-classes")}
              className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                facultySubTab === "live-classes"
                  ? "bg-white text-blue-600 border-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 border-transparent"
              }`}
            >
              <Video className="w-4 h-4" />
              Live Classes Monitor
            </button>
          </div>

          <div className="text-xs text-slate-400 pb-3 flex items-center gap-1.5 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Last updated: {lastSyncTime.toLocaleTimeString()}
          </div>
        </div>

        {/* TAB CONTENT 1: ALL MANAGED FACULTY */}
        {facultySubTab === "list" && (
          <div className="p-6 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search faculty by name, email, username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                  <tr>
                    <th className="p-3.5 pl-4">S.NO</th>
                    <th className="p-3.5">Faculty Member</th>
                    <th className="p-3.5">Contact Email</th>
                    <th className="p-3.5">Username</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredFaculty.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400">
                        No faculty members found matching current search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredFaculty.map((f, idx) => {
                      const name = `${f.first_name || ''} ${f.last_name || ''}`.trim() || f.username;
                      return (
                        <tr key={f.id || idx} className="hover:bg-slate-50/70 transition">
                          <td className="p-3.5 pl-4 font-medium text-slate-500">{idx + 1}</td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 capitalize">{name}</p>
                                <p className="text-xs text-slate-400">Faculty Staff</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-xs text-slate-600">{f.email || "N/A"}</td>
                          <td className="p-3.5 font-mono text-xs font-semibold text-slate-800">@{f.username}</td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleToggleStatus(f.id, f.is_active)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer border ${
                                f.is_active
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                              }`}
                            >
                              {f.is_active ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditModal(f)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                title="Edit Faculty Details"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteFaculty(f.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Delete Faculty"
                              >
                                <Trash2 size={16} />
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
          </div>
        )}

        {/* TAB CONTENT 2: FACULTY ASSIGNMENTS */}
        {facultySubTab === "assignments" && (
          <div className="p-6">
            <FacultyAssignment />
          </div>
        )}

        {/* TAB CONTENT 3: LIVE CLASSES */}
        {facultySubTab === "live-classes" && (
          <div className="p-6">
            <LiveClasses />
          </div>
        )}
      </div>

      {/* --- MODAL: ADD FACULTY MEMBER --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" /> Add New Faculty Member
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFacultySubmit} className="space-y-3 text-xs">

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
                >
                  {formSubmitting ? "Creating..." : "Save Faculty"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT FACULTY MEMBER --- */}
      {isEditModalOpen && selectedFaculty && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" /> Edit Faculty Details
              </h3>
              <button 
                onClick={() => { setIsEditModalOpen(false); setSelectedFaculty(null); }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditFacultySubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Username (Read Only)</label>
                <input
                  type="text"
                  disabled
                  value={formData.username}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">New Password (Leave blank to keep current)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter new password..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Status</label>
                <select
                  value={formData.is_active ? "active" : "inactive"}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === "active" }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setSelectedFaculty(null); }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
                >
                  {formSubmitting ? "Updating..." : "Update Faculty"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
