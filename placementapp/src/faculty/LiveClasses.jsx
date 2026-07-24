import React, { useState, useEffect } from "react";
import { Video, Plus, Calendar, Clock, CheckCircle, AlertCircle, PlayCircle, ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSEO } from "../utils/useSEO";

export default function LiveClasses() {
  const navigate = useNavigate();
  useSEO("Live Classes", "Attend live lecture sessions, access recording notes, and check schedules for your batch.");

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
  const [editingClassId, setEditingClassId] = useState(null);

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
      const url = editingClassId
        ? `http://${window.location.hostname}:8000/api/live-classes/${editingClassId}/update/`
        : `http://${window.location.hostname}:8000/api/live-classes/create/`;
      const method = editingClassId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || (editingClassId ? "Live class updated successfully." : "Live class scheduled successfully."));
        setIsModalOpen(false);
        setEditingClassId(null);
        setFormData({ title: "", batch_id: "", meeting_link: "", meeting_id: "", start_time: "", topic: "", recording_url: "" });
        fetchData();
      } else {
        toast.error(data.detail || "Operation failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error saving live class.");
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
      const data = await res.json();
      if (res.ok) {
        toast.success("Live class status updated.");
        fetchData();
      } else {
        toast.error(data.detail || "Failed to update status.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this live class session?")) return;
    const token = getStoredToken();
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/live-classes/${id}/delete/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        toast.success("Live class session deleted.");
        fetchData();
      } else {
        toast.error("Failed to delete live class.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error deleting live class.");
    }
  };

  const handleEditClick = (c) => {
    // start_time is stored as YYYY-MM-DD HH:MM. HTML input datetime-local expects YYYY-MM-DDTHH:MM
    const formattedTime = c.start_time ? c.start_time.replace(' ', 'T') : "";
    setFormData({
      title: c.title,
      batch_id: c.batch_id,
      meeting_link: c.meeting_link,
      meeting_id: c.meeting_id || "",
      start_time: formattedTime,
      topic: c.topic || "",
      recording_url: c.recording_url || ""
    });
    setEditingClassId(c.id);
    setIsModalOpen(true);
  };

  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    currentUser = null;
  }
  const isStudent = currentUser?.role?.toString().toLowerCase() === "student";

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen font-sans">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-xs font-bold uppercase tracking-wider transition-all group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
              <Video className="w-5 h-5" />
            </div>
            Live Classes &amp; Recordings
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl">
            {isStudent 
              ? "View live meeting sessions and class recordings for your batch" 
              : "Schedule live meeting sessions and attach recordings scoped to assigned course batches"}
          </p>
        </div>
        {!isStudent && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-purple-500/20 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" /> Schedule Live Class
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm animate-pulse text-center text-slate-400 font-medium">Loading live classes...</div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-100 text-center text-slate-400 shadow-sm max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="font-bold text-slate-800 text-base">No live classes scheduled</p>
          <p className="text-xs text-slate-400 mt-1">Check back later for newly scheduled batch sessions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(c => (
            <div key={c.id} className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wider">
                    {c.batch_name}
                  </span>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${
                    c.status === 'Live' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' :
                    c.status === 'Ended' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                    'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-lg group-hover:text-purple-700 transition-colors">{c.title}</h3>
                <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wide">{c.course_title} — {c.topic || "General Session"}</p>

                <div className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{c.start_time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Video className="w-4 h-4 text-purple-500" />
                    {c.is_future && c.status !== 'Live' ? (
                      <span className="text-slate-400 font-bold italic cursor-not-allowed" title={`Scheduled for ${c.start_time}`}>
                        Join Locked (Starts {c.start_time})
                      </span>
                    ) : (
                      <a href={c.meeting_link} target="_blank" rel="noreferrer" className="text-purple-600 hover:text-purple-700 hover:underline font-bold transition">
                        Join Live Meeting
                      </a>
                    )}
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
                  <div className="flex gap-2">
                    {c.status === 'Scheduled' && (
                      <button
                        onClick={() => {
                          if (c.is_future) {
                            toast.error(`This meeting is scheduled for ${c.start_time} and cannot be started yet.`);
                            return;
                          }
                          handleUpdateStatus(c.id, 'Live');
                        }}
                        disabled={c.is_future}
                        className={`text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition-all ${
                          c.is_future
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-750 active:scale-95'
                        }`}
                      >
                        Start Live
                      </button>
                    )}
                    {c.status === 'Live' && (
                      <button
                        onClick={() => {
                          const rec = prompt("Enter Recording URL (Optional):");
                          handleUpdateStatus(c.id, 'Ended', rec || '');
                        }}
                        className="text-xs font-bold bg-slate-800 text-white px-3 py-2 rounded-xl hover:bg-slate-900 shadow-sm active:scale-95"
                      >
                        End Class
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleEditClick(c)}
                      className="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-600 hover:text-red-750 bg-red-50 hover:bg-red-100 p-2 rounded-xl transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editingClassId ? "Edit Live Class Session" : "Schedule Live Class Session"}</h2>
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
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingClassId(null);
                    setFormData({ title: "", batch_id: "", meeting_link: "", meeting_id: "", start_time: "", topic: "", recording_url: "" });
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md active:scale-95"
                >
                  {editingClassId ? "Save Changes" : "Schedule Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
