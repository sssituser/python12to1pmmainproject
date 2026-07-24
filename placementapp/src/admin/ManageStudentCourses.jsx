import React, { useEffect, useState } from "react";
import { 
  BookOpen, 
  Search, 
  Plus, 
  Trash2, 
  User, 
  ArrowRight,
  Loader,
  GraduationCap,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { useSEO } from "../utils/useSEO";

function ManageStudentCourses() {
  useSEO("Manage Student Courses", "Assign and remove courses for individual students.");

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Selected student management states
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [currentCourses, setCurrentCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatchToAssign, setSelectedBatchToAssign] = useState("");
  const [selectedCoursesToAssign, setSelectedCoursesToAssign] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await makeRequest(`http://${window.location.hostname}:8000/api/batches/`);
      if (res && res.ok) {
        const bData = await res.json();
        setBatches(bData.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

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

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      // Reusing the all-users endpoint and filtering for active/approved students
      const res = await makeRequest(`http://${window.location.hostname}:8000/api/all-users/`);
      if (res.ok) {
        const data = await res.json();
        // filter students only
        const studentList = data.filter(user => user.role === 'student');
        setStudents(studentList);
      } else {
        toast.error("Failed to load students list.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while fetching students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchStudentCoursesAndAvailable = async (student) => {
    setLoadingEnrollments(true);
    try {
      // 1. Fetch current enrollments
      const enrollmentsRes = await makeRequest(`http://${window.location.hostname}:8000/api/student/${student.id}/courses/`);
      let currentList = [];
      if (enrollmentsRes.ok) {
        const resData = await enrollmentsRes.json();
        if (resData.success) {
          currentList = resData.data;
          setCurrentCourses(resData.data);
        }
      }
      
      // 2. Fetch all available courses
      const availableRes = await makeRequest(`http://${window.location.hostname}:8000/api/student/courses/available/`);
      if (availableRes.ok) {
        const resData = await availableRes.json();
        if (resData.success) {
          // Filter out courses student is already enrolled in
          const currentCourseIds = new Set(currentList.map(c => c.course_id));
          const filteredAvailable = resData.data.filter(c => !currentCourseIds.has(c.id));
          setAvailableCourses(filteredAvailable);
          
          setSelectedCoursesToAssign([]);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading enrollment details.");
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const handleOpenManageModal = (student) => {
    setSelectedStudent(student);
    setIsManageModalOpen(true);
    fetchStudentCoursesAndAvailable(student);
  };

  const handleAssignCourse = async () => {
    if (selectedCoursesToAssign.length === 0) {
      toast.warn("Please select at least one course to assign.");
      return;
    }

    const courseTitles = selectedCoursesToAssign.map(id => {
      const c = availableCourses.find(item => item.id === id);
      return c ? c.title : "";
    }).filter(Boolean);

    if (!window.confirm(`Are you sure you want to assign [ ${courseTitles.join(', ')} ] to ${selectedStudent?.name || selectedStudent?.username || "this student"}?`)) {
      return;
    }
    
    try {
      const res = await makeRequest(`http://${window.location.hostname}:8000/api/student/courses/assign/`, {
        method: "POST",
        body: JSON.stringify({
          student_id: selectedStudent.id,
          course_ids: selectedCoursesToAssign,
          batch_id: selectedBatchToAssign ? parseInt(selectedBatchToAssign) : null
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          toast.success(data.message || "Courses assigned successfully.");
          setSelectedCoursesToAssign([]);
          setSelectedBatchToAssign("");
          // Refresh enrollments
          fetchStudentCoursesAndAvailable(selectedStudent);
        }
      } else {
        const errData = await res.json();
        toast.error(errData.detail || "Failed to assign courses.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error assigning courses.");
    }
  };

  const handleRemoveCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to remove '${courseTitle}' enrollment for this student?`)) return;
    
    try {
      const res = await makeRequest(`http://${window.location.hostname}:8000/api/student/courses/remove/`, {
        method: "POST",
        body: JSON.stringify({
          student_id: selectedStudent.id,
          course_id: courseId
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          toast.success(data.message || "Course enrollment removed.");
          // Refresh enrollments
          fetchStudentCoursesAndAvailable(selectedStudent);
        }
      } else {
        const errData = await res.json();
        toast.error(errData.detail || "Failed to remove course.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error removing course.");
    }
  };

  const handleUpdateEnrollmentBatch = async (courseId, batchId) => {
    try {
      const res = await makeRequest(`http://${window.location.hostname}:8000/api/student/courses/update-batch/`, {
        method: "POST",
        body: JSON.stringify({
          student_id: selectedStudent.id,
          course_id: courseId,
          batch_id: batchId ? parseInt(batchId) : null
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          toast.success(data.message || "Batch assignment updated successfully.");
          fetchStudentCoursesAndAvailable(selectedStudent);
        }
      } else {
        const errData = await res.json();
        toast.error(errData.detail || "Failed to update batch assignment.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating batch assignment.");
    }
  };

  const filteredStudents = students.filter(student => {
    const sid = String(student.student_id || student.studentprofile?.student_id || "").toLowerCase();
    const query = searchTerm.toLowerCase();
    return (
      student.username.toLowerCase().includes(query) ||
      (student.email && student.email.toLowerCase().includes(query)) ||
      sid.includes(query)
    );
  });

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      {/* HEADER SECTION */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            Manage Student Courses
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Assign curriculum modules, manage active course cohorts, and supervise student enrollments
          </p>
        </div>
      </div>

      {/* SEARCH AND CONTROLS */}
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 border border-slate-100 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-4 top-3.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search students by name, email, or ID..."
            className="pl-11 pr-4 py-3 w-full border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm placeholder:text-slate-400 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
          Showing {filteredStudents.length} Students
        </div>
      </div>

      {/* STUDENT CARDS GRID */}
      {loadingStudents ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm animate-pulse">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-10 bg-slate-100 rounded-2xl w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm max-w-md mx-auto">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-12 h-12 text-slate-300 animate-bounce" />
            <h3 className="font-bold text-slate-800 text-lg">No Results Found</h3>
            <p className="text-sm text-slate-500">We couldn't find any students matching your search criteria.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-[0_10px_30px_rgba(99,102,241,0.06)] hover:border-indigo-100 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 flex items-center justify-center rounded-2xl font-extrabold text-lg border border-indigo-100/50 shadow-sm">
                    {student.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{student.username}</h3>
                    <p className="text-xs text-slate-400 font-medium truncate max-w-[180px]">{student.email || "No email provided"}</p>
                  </div>
                </div>
                
                <div className="border-t border-slate-50 pt-4 mb-5 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Student ID</span>
                    <span className="font-bold text-slate-700 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl shadow-2xs">
                      {student.student_id || student.studentprofile?.student_id || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Account Status</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${student.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                      {student.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenManageModal(student)}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3 rounded-2xl text-sm transition-all duration-300 shadow-sm hover:shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
              >
                Manage Courses <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MANAGE COURSES MODAL */}
      {isManageModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 flex items-center justify-center rounded-xl border border-indigo-500/20 shadow-inner">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Manage Student Cohorts</h3>
                  <p className="text-xs text-indigo-300 font-medium">Student: {selectedStudent.username}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsManageModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 flex items-center justify-center transition-all duration-200"
              >
                ✕
              </button>
            </div>

            {loadingEnrollments ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 flex-1">
                <Loader className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Retrieving student enrollment profiles...</p>
              </div>
            ) : (
              <div className="p-8 space-y-8 overflow-y-auto flex-1">
                {/* ASSIGN NEW COURSE FORM */}
                <div className="bg-[#f8fafc] rounded-3xl p-6 border border-slate-100 shadow-inner">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> Assign Dynamic Curriculum
                  </h4>
                  {availableCourses.length === 0 ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      This student is already enrolled in all available courses.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="border border-slate-200/80 rounded-2xl p-4 bg-white max-h-48 overflow-y-auto space-y-2 w-full shadow-inner">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Available Courses</p>
                          {availableCourses.map(course => {
                            const isChecked = selectedCoursesToAssign.includes(course.id);
                            return (
                              <label key={course.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isChecked ? 'bg-indigo-50/50 border-indigo-200' : 'hover:bg-slate-50 border-transparent'}`}>
                                <input
                                  type="checkbox"
                                  className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedCoursesToAssign([...selectedCoursesToAssign, course.id]);
                                    } else {
                                      setSelectedCoursesToAssign(selectedCoursesToAssign.filter(id => id !== course.id));
                                    }
                                  }}
                                />
                                <span className={`text-xs font-bold ${isChecked ? 'text-indigo-900' : 'text-slate-700'}`}>{course.title} <span className="text-[10px] text-slate-400 font-medium">({course.level})</span></span>
                              </label>
                            );
                          })}
                        </div>

                        {selectedCoursesToAssign.length === 1 && (
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Assign Batch (Optional)</label>
                            <select
                              className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-full shadow-sm font-semibold text-slate-700 cursor-pointer"
                              value={selectedBatchToAssign}
                              onChange={(e) => setSelectedBatchToAssign(e.target.value)}
                            >
                              <option value="">-- No Cohort Batch (Self-paced) --</option>
                              {batches
                                .filter(b => b.course_id === selectedCoursesToAssign[0])
                                .map(b => (
                                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                                ))
                              }
                            </select>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleAssignCourse}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-[0.98]"
                      >
                        <Plus className="w-4 h-4" /> Confirm &amp; Assign Curriculum
                      </button>
                    </div>
                  )}
                </div>

                {/* CURRENT ENROLLMENTS */}
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400" /> Active Course Enrollments ({currentCourses.length})
                  </h4>
                  {currentCourses.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                      <p className="text-sm font-semibold text-slate-400">No courses assigned to this student yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {currentCourses.map(enrollment => (
                        <div key={enrollment.enrollment_id} className="flex justify-between items-center border border-slate-100 rounded-2xl p-4 bg-white hover:bg-slate-50/50 transition-all duration-200 shadow-2xs hover:shadow-xs group/item">
                          <div className="flex-1 min-w-0 pr-4">
                             <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                               <p className="font-bold text-slate-800 text-sm truncate">{enrollment.title}</p>
                               <select
                                 value={enrollment.batch_id || ""}
                                 onChange={(e) => handleUpdateEnrollmentBatch(enrollment.course_id, e.target.value)}
                                 className="text-xs bg-indigo-50/50 text-indigo-700 font-bold px-3 py-1.5 rounded-xl border border-indigo-100/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[180px]"
                               >
                                 <option value="">-- Self-paced Batch --</option>
                                 {batches
                                   .filter(b => b.course_id === enrollment.course_id)
                                   .map(b => (
                                     <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                                   ))
                                 }
                               </select>
                             </div>
                             <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400 font-medium mt-2">
                               <span className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md text-[10px] text-slate-500 font-bold">{enrollment.level}</span>
                               <span>•</span>
                               <span>Progress: <strong className="text-slate-700">{enrollment.progress}%</strong></span>
                               <span>•</span>
                               <span className="capitalize">Status: <strong className="text-emerald-600">{enrollment.status}</strong></span>
                             </div>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveCourse(enrollment.course_id, enrollment.title)}
                            className="w-9 h-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0"
                            title="De-enroll Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-[2rem]">
              <button 
                onClick={() => setIsManageModalOpen(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageStudentCourses;
