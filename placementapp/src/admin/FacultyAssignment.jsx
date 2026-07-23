import React, { useState, useEffect } from "react";
import { UserCheck, Plus, Trash2, Shield, AlertCircle, BookOpen, Layers } from "lucide-react";
import toast from "react-hot-toast";

export default function FacultyAssignment() {
  const [assignments, setAssignments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    faculty_id: "",
    course_id: "",
    batch_id: "",
    module_id: ""
  });

  const getStoredToken = () => localStorage.getItem("access")?.replace(/^"|"$/g, "");

  const fetchData = async () => {
    setLoading(true);
    const token = getStoredToken();
    try {
      const [assignRes, facRes, batchRes, courseRes] = await Promise.all([
        fetch(`http://${window.location.hostname}:8000/api/faculty-assignments/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://${window.location.hostname}:8000/api/all-users/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://${window.location.hostname}:8000/api/batches/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://${window.location.hostname}:8000/api/courses/`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (assignRes.ok) {
        const data = await assignRes.json();
        setAssignments(data.data || []);
      }

      if (facRes.ok) {
        const users = await facRes.json();
        setFaculties(users.filter(u => u.role === 'faculty'));
      }

      if (batchRes.ok) {
        const bData = await batchRes.json();
        setBatches(bData.data || []);
      }

      if (courseRes.ok) {
        const cData = await courseRes.json();
        setCourses(Array.isArray(cData) ? cData : cData.results || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load faculty assignment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    const token = getStoredToken();

    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/faculty-assignments/assign/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Faculty assigned successfully!");
        setFormData({ faculty_id: "", course_id: "", batch_id: "", module_id: "" });
        fetchData();
      } else {
        toast.error(data.detail || "Failed to assign faculty.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error submitting assignment.");
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to remove this faculty assignment?")) return;

    const token = getStoredToken();
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/faculty-assignments/${id}/remove/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Faculty assignment removed.");
        fetchData();
      } else {
        toast.error("Error removing assignment.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error removing assignment.");
    }
  };

  const filteredBatches = formData.course_id 
    ? batches.filter(b => b.course_id === parseInt(formData.course_id)) 
    : batches;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Faculty Module Assignments</h1>
        <p className="text-sm text-gray-500 mt-1">Assign faculty members per Course → Batch → Technology Module with RBAC scoping</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ASSIGNMENT FORM */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" /> New Faculty Assignment
          </h2>

          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Faculty</label>
              <select
                required
                value={formData.faculty_id}
                onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose Faculty --</option>
                {faculties.map(f => (
                  <option key={f.id} value={f.id}>{f.username} ({f.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Course</label>
              <select
                required
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value, batch_id: "" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose Course --</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Batch</label>
              <select
                required
                value={formData.batch_id}
                onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose Batch --</option>
                {filteredBatches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-md active:scale-95 transition-all mt-4"
            >
              <Plus className="w-4 h-4" /> Assign Faculty to Batch
            </button>
          </form>
        </div>

        {/* ASSIGNMENTS LIST */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 animate-pulse text-center">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center text-gray-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No faculty assignments recorded yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Faculty</th>
                    <th className="p-4">Course</th>
                    <th className="p-4">Batch</th>
                    <th className="p-4">Module</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignments.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-semibold text-gray-900">
                        {a.faculty_name}
                        <div className="text-xs font-normal text-gray-400">{a.faculty_email}</div>
                      </td>
                      <td className="p-4 text-gray-700">{a.course_title}</td>
                      <td className="p-4">
                        <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-100 text-xs">
                          {a.batch_name}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 font-medium">{a.module_name}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleRemove(a.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove Assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
