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
  const [selectedCourseToAssign, setSelectedCourseToAssign] = useState("");
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
          
          if (filteredAvailable.length > 0) {
            setSelectedCourseToAssign(filteredAvailable[0].id.toString());
          } else {
            setSelectedCourseToAssign("");
          }
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
    if (!selectedCourseToAssign) {
      toast.warn("Please select a course to assign.");
      return;
    }
    
    try {
      const res = await makeRequest(`http://${window.location.hostname}:8000/api/student/courses/assign/`, {
        method: "POST",
        body: JSON.stringify({
          student_id: selectedStudent.id,
          course_id: parseInt(selectedCourseToAssign),
          batch_id: selectedBatchToAssign ? parseInt(selectedBatchToAssign) : null
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          toast.success(data.message || "Course assigned successfully.");
          setSelectedBatchToAssign("");
          // Refresh enrollments
          fetchStudentCoursesAndAvailable(selectedStudent);
        }
      } else {
        const errData = await res.json();
        toast.error(errData.detail || "Failed to assign course.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error assigning course.");
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Student Courses</h1>
        <p className="text-gray-500 text-sm mt-1">Assign additional courses or manage multiple course enrollments for students</p>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mb-6 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search student by name, email, or Student ID..."
            className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* STUDENT GRID */}
      {loadingStudents ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-gray-300" />
            <p>No students found matching your search.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 text-green-700 flex items-center justify-center rounded-full font-bold">
                      {student.username[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{student.username}</h3>
                      <p className="text-xs text-gray-500">{student.email || "No email provided"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-3 mb-4 space-y-2 text-xs text-gray-500">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Student ID:</span>
                    <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                      {student.student_id || student.studentprofile?.student_id || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Account Status:</span>
                    <span className={`px-2 py-0.5 rounded-full font-semibold uppercase ${student.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {student.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenManageModal(student)}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
              >
                Manage Courses <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MANAGE COURSES MODAL */}
      {isManageModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 bg-green-600 text-white flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <GraduationCap className="w-5 h-5" /> Manage Courses: {selectedStudent.username}
              </h3>
              <button 
                onClick={() => setIsManageModalOpen(false)}
                className="text-white hover:text-gray-200 transition"
              >
                ✕
              </button>
            </div>

            {loadingEnrollments ? (
              <div className="p-10 flex flex-col items-center justify-center gap-2">
                <Loader className="w-8 h-8 text-green-600 animate-spin" />
                <p className="text-sm text-gray-500">Loading student course assignments...</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* ASSIGN NEW COURSE WORKFLOW */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <h4 className="text-sm font-bold text-green-800 flex items-center gap-1.5 mb-3">
                    <Sparkles className="w-4 h-4" /> Assign New Course
                  </h4>
                  {availableCourses.length === 0 ? (
                    <p className="text-xs text-green-700 italic">This student is already enrolled in all available courses.</p>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <select
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        value={selectedCourseToAssign}
                        onChange={(e) => setSelectedCourseToAssign(e.target.value)}
                      >
                        {availableCourses.map(course => (
                          <option key={course.id} value={course.id}>{course.title} ({course.level})</option>
                        ))}
                      </select>

                      <select
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        value={selectedBatchToAssign}
                        onChange={(e) => setSelectedBatchToAssign(e.target.value)}
                      >
                        <option value="">-- Batch (Optional) --</option>
                        {batches
                          .filter(b => b.course_id === parseInt(selectedCourseToAssign))
                          .map(b => (
                            <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                          ))
                        }
                      </select>

                      <button
                        onClick={handleAssignCourse}
                        className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        <Plus className="w-4 h-4" /> Assign
                      </button>
                    </div>
                  )}
                </div>

                {/* CURRENT ENROLLMENTS */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-gray-400" /> Current Courses ({currentCourses.length})
                  </h4>
                  {currentCourses.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl">
                      <p className="text-sm text-gray-500">No courses assigned to this student.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {currentCourses.map(enrollment => (
                        <div key={enrollment.enrollment_id} className="flex justify-between items-center border border-gray-200 rounded-xl p-3 bg-white hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                             <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                               <p className="font-semibold text-gray-800 text-sm">{enrollment.title}</p>
                               <select
                                 value={enrollment.batch_id || ""}
                                 onChange={(e) => handleUpdateEnrollmentBatch(enrollment.course_id, e.target.value)}
                                 className="text-xs bg-purple-50 text-purple-700 font-bold px-2 py-1 rounded-md border border-purple-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 max-w-[180px]"
                               >
                                 <option value="">-- Unassigned Batch --</option>
                                 {batches
                                   .filter(b => b.course_id === enrollment.course_id)
                                   .map(b => (
                                     <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                                   ))
                                 }
                               </select>
                             </div>
                             <div className="flex gap-3 text-xs text-gray-500 mt-1">
                               <span>Level: {enrollment.level}</span>
                               <span>•</span>
                               <span>Progress: {enrollment.progress}%</span>
                               <span>•</span>
                               <span>Status: {enrollment.status}</span>
                             </div>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveCourse(enrollment.course_id, enrollment.title)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Remove Enrollment"
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

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
              <button 
                onClick={() => setIsManageModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageStudentCourses;
