import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faClipboardList, 
  faCalendarDays, 
  faFaceSadTear, 
  faPlus, 
  faCheck, 
  faTimes, 
  faUserShield 
} from "@fortawesome/free-solid-svg-icons";

const STORAGE_KEY = "placementapp_leave_requests";

function LeaveRequest() {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [view, setView] = useState("form"); // "form" | "list"
  
  // Simulation of logged-in user role
  const [currentUserRole, setCurrentUserRole] = useState("Student"); 

  // Load saved leave requests
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setLeaveRequests(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setLeaveRequests([]);
    }
  }, []);

  const saveLeaveRequests = (list) => {
    setLeaveRequests(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate || !reason.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      alert("End date must be on or after start date.");
      return;
    }
    const newRequest = {
      id: Date.now(),
      name: name.trim(),
      startDate,
      endDate,
      description: reason.trim(),
      status: "Pending",
      approvedBy: null,
    };
    saveLeaveRequests([newRequest, ...leaveRequests]);
    setName("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setView("list");
  };

  const handleApproveReject = (id, newStatus) => {
    // Only authorized roles can perform this action
    const authorizedRoles = ["Faculty"];
    
    if (!authorizedRoles.includes(currentUserRole)) {
      alert("You do not have permission to approve or reject leaves.");
      return;
    }

    setLeaveRequests((prev) => {
      const updated = prev.map((req) =>
        req.id === id
          ? { 
              ...req, 
              status: newStatus, 
              approvedBy: newStatus === "Pending" ? null : currentUserRole 
            }
          : req
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearAll = () => {
    if (window.confirm("Remove all leave requests and start fresh?")) {
      setLeaveRequests([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Role Switcher (For Development/Demo purposes) */}
      <div className="mb-6 p-3 bg-gray-100 rounded-xl flex items-center gap-4 border border-gray-200">
        <span className="text-sm font-bold text-gray-600 flex items-center gap-2">
          <FontAwesomeIcon icon={faUserShield} /> Logged in as:
        </span>
        <select 
          value={currentUserRole} 
          onChange={(e) => setCurrentUserRole(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="Student">Student (Apply Only)</option>
          <option value="Faculty">Faculty</option>
        </select>
      </div>

      {view === "form" ? (
        <>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1004ef] to-[#6131b5] text-white px-6 py-3 rounded-xl font-semibold text-lg mb-6 shadow-lg">
            <FontAwesomeIcon icon={faClipboardList} />
            <span>Leave Request Form</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-wrap gap-6 items-end">
              <div className="flex-1 min-w-[180px]">
                <label className="block font-medium text-gray-700 mb-1 text-sm">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border-2 border-gray-200 py-2.5 px-4 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block font-medium text-gray-700 mb-1 text-sm">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 py-2.5 px-4 outline-none transition"
                  required
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block font-medium text-gray-700 mb-1 text-sm">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 py-2.5 px-4 outline-none transition"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="block font-medium text-gray-700 text-sm">Reason for Leave</label>
              <textarea
                placeholder="Briefly describe why you are taking leave..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full rounded-xl border-2 border-gray-200 py-2.5 px-4 outline-none transition resize-none"
                required
              />
              <button
                type="submit"
                className="mt-2 w-fit bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95"
              >
                Submit Request
              </button>
            </div>
          </form>

          {leaveRequests.length > 0 && (
            <button
              type="button"
              onClick={() => setView("list")}
              className="mt-6 text-indigo-600 hover:underline font-bold flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faClipboardList} />
              View Leave History
            </button>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Applied Leave Requests</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClearAll}
                className="text-red-500 text-sm font-semibold hover:bg-red-50 px-3 py-2 rounded-lg transition"
              >
                Clear All
              </button>
              <button
                onClick={() => setView("form")}
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm"
              >
                <FontAwesomeIcon icon={faPlus} />
                New Request
              </button>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-xl">
            {/* Table Header */}
            <div className="grid grid-cols-[1.5fr_1fr_1fr_2.5fr_1fr_1fr] gap-4 bg-[#1004ef] text-white px-6 py-4 font-bold text-xs uppercase tracking-wider">
              <div>Name</div>
              <div>Start Date</div>
              <div>End Date</div>
              <div>Description</div>
              <div>Status</div>
              <div>Approved By</div>
            </div>

            {/* Table Content */}
            {leaveRequests.length === 0 ? (
              <div className="flex flex-col items-center py-20 opacity-40">
                <FontAwesomeIcon icon={faFaceSadTear} size="3x" />
                <p className="mt-4 font-bold">No requests found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {leaveRequests.map((req) => (
                  <div key={req.id} className="grid grid-cols-[1.5fr_1fr_1fr_2.5fr_1fr_1fr] gap-4 px-6 py-5 text-sm items-center hover:bg-gray-50 transition">
                    <div className="font-bold text-gray-900">{req.name}</div>
                    <div className="text-gray-600">{formatDate(req.startDate)}</div>
                    <div className="text-gray-600">{formatDate(req.endDate)}</div>
                    <div className="text-gray-600 italic">"{req.description}"</div>
                    
                    <div>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${
                        req.status === "Approved" ? "bg-green-100 text-green-700" :
                        req.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {req.status}
                      </span>
                      
                      {/* Only show Action Buttons if status is Pending AND user is authorized */}
                      {req.status === "Pending" && ["Faculty"].includes(currentUserRole) && (
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleApproveReject(req.id, "Approved")} className="bg-green-500 text-white p-1 rounded hover:bg-green-600 transition shadow-sm">
                            <FontAwesomeIcon icon={faCheck} size="xs" />
                          </button>
                          <button onClick={() => handleApproveReject(req.id, "Rejected")} className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition shadow-sm">
                            <FontAwesomeIcon icon={faTimes} size="xs" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-gray-400">
                      {req.approvedBy || "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="mt-4 text-xs text-gray-400">
            Note: Only Faculty can approve these requests.
          </p>
        </>
      )}
    </div>
  );
}

export default LeaveRequest;