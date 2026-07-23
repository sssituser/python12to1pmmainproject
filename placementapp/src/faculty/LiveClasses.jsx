import React, { useState, useEffect } from "react";
import { Video, Plus, Link, Calendar, Clock, CheckCircle, AlertCircle, PlayCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function LiveClasses() {
  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    batch_id: "",
    meeting_link: "",
    meeting_id: "",
    start_time: "",
    topic: "",
    recording_url: ""
  });

  const getStoredToken = () => localStorage.getItem("access")?.replace(/^"|"$/g, "");

  const fetchData = async () => {
    setLoading(true);
    const token = getStoredToken();
    try {
      const [classRes, batchRes] = await Promise.all([
        fetch(`http://${window.location.hostname}:8000/api/live-classes/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://${window.location.hostname}:8000/api/batches/`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (classRes.ok) {
        const data = await classRes.json();
        setClasses(data.data || []);
      }

      if (batchRes.ok) {
        const bData = await batchRes.json();
        setBatches(bData.data || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load live class data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getStoredToken();
    const selectedBatch = batches.find(b => b.id === parseInt(formData.batch_id));
    if (!selectedBatch) {
      toast.error("Please select a valid batch.");
      return;
    }

    const payload = {
      ...formData,
      course_id: selectedBatch.course_id
    };

    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/live-classes/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Live class scheduled successfully.");
        setIsModalOpen(false);
        setFormData({ title: "", batch_id: "", meeting_link: "", meeting_id: "", start_time: "", topic: "", recording_url: "" });
        fetchData();
      } else {
        toast.error(data.detail || "Failed to schedule live class.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error scheduling live class.");
    }
  };

  const handleUpdateStatus = async (id, status, recordingUrl = '') => {
    const token = getStoredToken();
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/live-classes/${id}/update/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, recording_url: recordingUrl })
      });
      if (res.ok) {
        toast.success("Live class status updated.");
        fetchData();
      }
    } catch (e) {
      console.error(e);
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Live Classes &amp; Class Recordings</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isStudent 
              ? "View live meeting sessions and class recordings for your batch" 
              : "Schedule live meeting sessions and attach recordings scoped to assigned course batches"}
          </p>
        </div>
        {!isStudent && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Schedule Live Class
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 animate-pulse text-center">Loading live classes...</div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center text-gray-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No live classes scheduled yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(c => (
            <div key={c.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                    {c.batch_name}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    c.status === 'Live' ? 'bg-red-100 text-red-700 border-red-200 animate-pulse' :
                    c.status === 'Ended' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                    'bg-blue-100 text-blue-700 border-blue-200'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-lg">{c.title}</h3>
                <p className="text-xs font-semibold text-gray-500 mb-3">{c.course_title} — {c.topic || "General Session"}</p>

                <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{c.start_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-500" />
                    <a href={c.meeting_link} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline font-semibold truncate">
                      Join Live Meeting
                    </a>
                  </div>
                  {c.recording_url && (
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-green-600" />
                      <a href={c.recording_url} target="_blank" rel="noreferrer" className="text-green-600 hover:underline font-semibold truncate">
                        Watch Class Recording
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {!isStudent && (
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  {c.status === 'Scheduled' && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'Live')}
                      className="text-xs font-bold bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 shadow-sm"
                    >
                      Start Class Live
                    </button>
                  )}
                  {c.status === 'Live' && (
                    <button
                      onClick={() => {
                        const rec = prompt("Enter Recording URL (Optional):");
                        handleUpdateStatus(c.id, 'Ended', rec || '');
                      }}
                      className="text-xs font-bold bg-gray-700 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 shadow-sm"
                    >
                      End Class
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule Live Class Session</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Django REST Framework API Authentication"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Batch</label>
                <select
                  required
                  value={formData.batch_id}
                  onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Choose Batch --</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Live Meeting URL (Zoom / Google Meet)</label>
                <input
                  type="url"
                  required
                  placeholder="https://meet.google.com/..."
                  value={formData.meeting_link}
                  onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Start Date &amp; Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
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
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md active:scale-95"
                >
                  Schedule Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
