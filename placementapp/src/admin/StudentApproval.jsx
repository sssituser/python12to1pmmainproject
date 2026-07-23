import React, { useEffect, useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  ShieldCheck, 
  ChevronUp, 
  ChevronDown, 
  Calendar,
  User, 
  Mail, 
  BookOpen, 
  AlertCircle,
  FileText
} from "lucide-react";
import { toast } from "react-toastify";
import { useSEO } from "../utils/useSEO";

function StudentApproval() {
  useSEO("Student Approvals", "Manage and review registered student accounts.");
  
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("registration_date");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Modal states
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const refreshAccessToken = async () => {
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
      return null;
    }
  };

  const makeRequest = async (url, options = {}) => {
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
      const newToken = await refreshAccessToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(url, { ...options, headers });
      }
    }
    return res;
  };

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        sort_by: sortBy,
        order: sortOrder,
        page: page.toString(),
        page_size: "10"
      });
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      
      const res = await makeRequest(`http://${window.location.hostname}:8000/api/admin/student-approvals/?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setApprovals(result.data);
          setTotalPages(result.pagination.pages);
          setTotalCount(result.pagination.total);
        }
      } else {
        toast.error("Failed to load student approvals.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while fetching approvals.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await makeRequest(`http://${window.location.hostname}:8000/api/batches/`);
      if (res.ok) {
        const data = await res.json();
        setBatches(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchApprovals();
    fetchBatches();
  }, [searchTerm, statusFilter, sortBy, sortOrder, page]);

  const openApproveModal = (student) => {
    setSelectedStudent(student);
    setSelectedBatchId("");
    setIsApproveModalOpen(true);
  };

  const handleApproveSubmit = async () => {
    if (!selectedStudent) return;
    try {
      const res = await makeRequest(`http://${window.location.hostname}:8000/api/admin/student-approvals/${selectedStudent.id}/approve/`, {
        method: "POST",
        body: JSON.stringify({ batch_id: selectedBatchId || null })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          toast.success(result.message || "Student account approved successfully.");
          setIsApproveModalOpen(false);
          fetchApprovals();
        }
      } else {
        toast.error("Failed to approve student.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error approving student.");
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedStudent) return;
    try {
      const res = await makeRequest(`http://${window.location.hostname}:8000/api/admin/student-approvals/${selectedStudent.id}/reject/`, {
        method: "POST",
        body: JSON.stringify({ rejection_reason: rejectionReason })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          toast.success(result.message || "Student account rejected successfully.");
          setIsRejectModalOpen(false);
          setRejectionReason("");
          fetchApprovals();
        }
      } else {
        toast.error("Failed to reject student.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error rejecting student.");
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Student Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">Review, approve, or reject registered student profiles ({totalCount} total)</p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, email, ID..."
            className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>

        <div className="flex flex-row gap-3 w-full md:w-auto items-center justify-end">
          <Filter className="text-gray-400 w-4 h-4" />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort("username")}>
                  Student Name {sortBy === "username" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort("student_id")}>
                  Student ID {sortBy === "student_id" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort("registered_course")}>
                  Registered Course {sortBy === "registered_course" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort("registration_date")}>
                  Registered Date {sortBy === "registration_date" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Approved By</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-600">
              {loading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse bg-white">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-36"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-28 mx-auto"></div></td>
                  </tr>
                ))
              ) : approvals.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-gray-300" />
                      <p>No student approval requests found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                approvals.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{profile.username}</td>
                    <td className="px-6 py-4">{profile.student_id || "N/A"}</td>
                    <td className="px-6 py-4">{profile.email}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{profile.registered_course}</td>
                    <td className="px-6 py-4">{profile.registration_date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                        profile.status === "approved" 
                          ? "bg-green-100 text-green-800" 
                          : profile.status === "rejected" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {profile.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {profile.approved_by ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-700">{profile.approved_by}</span>
                          <span className="text-[10px] text-gray-400">{profile.approved_at}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => { setSelectedStudent(profile); setIsDetailsModalOpen(true); }}
                          title="View Details"
                          className="p-1.5 text-gray-500 hover:text-green-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {profile.status === "pending" && (
                          <>
                            <button
                              onClick={() => openApproveModal(profile)}
                              title="Approve Account"
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setSelectedStudent(profile); setIsRejectModalOpen(true); }}
                              title="Reject Account"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500 font-medium">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* DETAILS MODAL */}
      {isDetailsModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-green-600 text-white flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" /> Student Details
              </h3>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-white hover:text-gray-200">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase">Student Name</label>
                  <p className="font-semibold text-gray-800">{selectedStudent.username}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase">Student ID</label>
                  <p className="font-semibold text-gray-800">{selectedStudent.student_id || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 uppercase">Email Address</label>
                  <p className="font-semibold text-gray-800 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {selectedStudent.email}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 uppercase">Registered Course</label>
                  <p className="font-semibold text-gray-800 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-gray-400" /> {selectedStudent.registered_course}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase">Registration Date</label>
                  <p className="font-semibold text-gray-800 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {selectedStudent.registration_date}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase">Current Status</label>
                  <p className="mt-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                      selectedStudent.status === "approved" 
                        ? "bg-green-100 text-green-800" 
                        : selectedStudent.status === "rejected" 
                          ? "bg-red-100 text-red-800" 
                          : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {selectedStudent.status}
                    </span>
                  </p>
                </div>
                {selectedStudent.approved_by && (
                  <div className="col-span-2 border-t pt-3">
                    <label className="text-xs text-gray-400 uppercase">Approved/Rejected By</label>
                    <p className="font-semibold text-gray-800">{selectedStudent.approved_by} on {selectedStudent.approved_at}</p>
                  </div>
                )}
                {selectedStudent.status === "rejected" && selectedStudent.rejection_reason && (
                  <div className="col-span-2 border-t pt-3 bg-red-50 p-3 rounded-lg border border-red-100">
                    <label className="text-xs text-red-700 uppercase font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Rejection Reason
                    </label>
                    <p className="text-sm text-red-800 mt-1">{selectedStudent.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
              <button onClick={() => setIsDetailsModalOpen(false)} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-gray-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {isRejectModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-red-600 text-white flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <XCircle className="w-5 h-5" /> Reject Registration
              </h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-white hover:text-gray-200">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-sm">
                You are rejecting registration for <strong className="text-gray-800">{selectedStudent.username}</strong>. Please provide an optional reason for the rejection.
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rejection Reason</label>
                <textarea
                  placeholder="e.g. Invalid student ID, duplicate registration..."
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button 
                onClick={() => { setIsRejectModalOpen(false); setRejectionReason(""); }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleRejectSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Reject Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE & BATCH ASSIGNMENT MODAL */}
      {isApproveModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-green-600 text-white flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Approve &amp; Assign Batch
              </h3>
              <button onClick={() => setIsApproveModalOpen(false)} className="text-white hover:text-gray-200">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-sm">
                Approving registration for <strong className="text-gray-900">{selectedStudent.username}</strong> ({selectedStudent.email}).
              </p>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Assign Batch</label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">-- Assign Batch Later / Default --</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code}) - {b.course_title}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Per specification: Student approval requires assigning a batch.</p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button 
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleApproveSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
              >
                Approve Student Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentApproval;
