import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCheck, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";

function LeaveRequest() {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("Student");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    setRequests(data);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !startDate || !endDate || !reason) {
      alert("Fill all fields");
      return;
    }

    const newRequest = {
      id: Date.now(),
      name,
      startDate,
      endDate,
      description: reason,
      status: "Pending",
      approvedBy: null
    };

    const updated = [newRequest, ...requests];
    setRequests(updated);
    localStorage.setItem('leaveRequests', JSON.stringify(updated));
    
    setName("");
    setStartDate("");
    setEndDate("");
    setReason("");
    alert("Request submitted!");
  };

  const handleApproveReject = (id, status) => {
    if (role !== "Faculty") {
      alert("Only faculty can approve/reject");
      return;
    }

    const updated = requests.map(req => 
      req.id === id ? { ...req, status, approvedBy: role } : req
    );
    setRequests(updated);
    localStorage.setItem('leaveRequests', JSON.stringify(updated));
  };

  const handleDelete = (id) => {
    if (confirm("Delete this request?")) {
      const updated = requests.filter(req => req.id !== id);
      setRequests(updated);
      localStorage.setItem('leaveRequests', JSON.stringify(updated));
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN");
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Leave Requests</h1>
        <div className="flex gap-2">
          <select value={role} onChange={(e) => setRole(e.target.value)} className="border rounded px-3 py-1">
            <option value="Student">Student</option>
            <option value="Faculty">Faculty</option>
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">New Request</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for leave"
          className="w-full border rounded px-3 py-2 mb-4"
          rows={2}
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          <FontAwesomeIcon icon={faPlus} className="mr-2" /> Submit
        </button>
      </form>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">All Requests</h2>
        </div>
        
        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No requests found
          </div>
        ) : (
          <div className="divide-y">
            {requests.map((req) => (
              <div key={req.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div className="flex-1">
                  <div className="font-semibold">{req.name}</div>
                  <div className="text-sm text-gray-600">
                    {formatDate(req.startDate)} - {formatDate(req.endDate)}
                  </div>
                  <div className="text-sm text-gray-600 italic">{req.description}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    req.status === "Approved" ? "bg-green-100 text-green-700" :
                    req.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {req.status}
                  </span>
                  
                  {req.status === "Pending" && role === "Faculty" && (
                    <div className="flex gap-1">
                      <button onClick={() => handleApproveReject(req.id, "Approved")} className="bg-green-500 text-white p-1 rounded hover:bg-green-600">
                        <FontAwesomeIcon icon={faCheck} size="xs" />
                      </button>
                      <button onClick={() => handleApproveReject(req.id, "Rejected")} className="bg-red-500 text-white p-1 rounded hover:bg-red-600">
                        <FontAwesomeIcon icon={faTimes} size="xs" />
                      </button>
                    </div>
                  )}
                  
                  <button onClick={() => handleDelete(req.id)} className="bg-gray-500 text-white p-1 rounded hover:bg-gray-600">
                    <FontAwesomeIcon icon={faTrash} size="xs" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveRequest;
