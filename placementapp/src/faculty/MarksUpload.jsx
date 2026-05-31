import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ClipboardCheck, Edit, Check, AlertCircle, Save, Plus } from "lucide-react";

function MarksUpload() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [customExamTitle, setCustomExamTitle] = useState("");
  const [isCustomExam, setIsCustomExam] = useState(false);
  const [defaultTotalMarks, setDefaultTotalMarks] = useState(100);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  const welcomeBackFont = {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    fontWeight: '700',
  };

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch exams when course changes
  useEffect(() => {
    if (selectedCourse) {
      fetchCourseExams(selectedCourse);
      setStudents([]);
      setSelectedExam("");
      setCustomExamTitle("");
      setIsCustomExam(false);
    }
  }, [selectedCourse]);

  // Fetch students when course or exam changes
  useEffect(() => {
    if (selectedCourse && (selectedExam || (isCustomExam && customExamTitle))) {
      const title = isCustomExam ? customExamTitle : exams.find(e => e.id.toString() === selectedExam.toString())?.title || "";
      if (title) {
        fetchStudentsAndMarks(selectedCourse, title);
      }
    }
  }, [selectedCourse, selectedExam, customExamTitle, isCustomExam]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/faculty/courses/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.data || data || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchCourseExams = async (courseId) => {
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/faculty/courses/${courseId}/exams/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setExams(data.exams || []);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const fetchStudentsAndMarks = async (courseId, examTitle) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(
        `http://${window.location.hostname}:8000/api/faculty/exam-marks/?course_id=${courseId}&exam_title=${encodeURIComponent(examTitle)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error("Error fetching student marks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId, field, value) => {
    setStudents(prev =>
      prev.map(student => {
        if (student.student_id === studentId) {
          return { ...student, [field]: value };
        }
        return student;
      })
    );
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    setMessage(null);
    const examTitle = isCustomExam ? customExamTitle : exams.find(e => e.id.toString() === selectedExam.toString())?.title || "";
    
    if (!examTitle) {
      setMessage({ type: "error", text: "Please enter/select a valid Exam Title." });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/faculty/exam-marks/upload/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: selectedCourse,
          exam_title: examTitle,
          marks: students.map(s => ({
            student_id: s.student_id,
            marks_obtained: s.marks_obtained,
            total_marks: s.total_marks || defaultTotalMarks,
            status: s.status || "completed"
          }))
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Marks saved and updated successfully!" });
        // Refresh marks display AND the exam dropdown (new exam titles appear dynamically)
        fetchStudentsAndMarks(selectedCourse, examTitle);
        fetchCourseExams(selectedCourse);
      } else {
        setMessage({ type: "error", text: "Failed to save marks. Please check your inputs." });
      }
    } catch (error) {
      console.error("Error saving marks:", error);
      setMessage({ type: "error", text: "An error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2" style={welcomeBackFont}>
              <ClipboardCheck className="text-blue-600 w-7 h-7" />
              Upload Examination Marks
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage exam records and upload manually graded scores.</p>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Course Select */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select Course</label>
              <select
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">-- Choose Course --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>

            {/* Exam Selector */}
            {selectedCourse && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Examination</label>
                <div className="flex gap-2">
                  {!isCustomExam ? (
                    <select
                      className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={selectedExam}
                      onChange={(e) => {
                        if (e.target.value === "custom") {
                          setIsCustomExam(true);
                          setSelectedExam("");
                        } else {
                          setSelectedExam(e.target.value);
                          // Auto-populate total marks from selected exam
                          const exam = exams.find(ex => ex.id.toString() === e.target.value);
                          if (exam && exam.total_marks) {
                            setDefaultTotalMarks(exam.total_marks);
                          }
                        }
                      }}
                    >
                      <option value="">-- Choose Exam --</option>
                      {exams.map(exam => (
                        <option key={exam.id} value={exam.id}>{exam.title}</option>
                      ))}
                      <option value="custom" className="text-blue-600 font-semibold">+ Add Custom Assessment</option>
                    </select>
                  ) : (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Exam Title (e.g., Midterm 1)"
                        className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={customExamTitle}
                        onChange={(e) => setCustomExamTitle(e.target.value)}
                      />
                      <button
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 rounded-lg text-xs font-semibold"
                        onClick={() => {
                          setIsCustomExam(false);
                          setCustomExamTitle("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Default Total Marks Config */}
            {selectedCourse && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Max/Total Marks</label>
                <input
                  type="number"
                  className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={defaultTotalMarks}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 100;
                    setDefaultTotalMarks(val);
                    setStudents(prev => prev.map(s => ({ ...s, total_marks: val })));
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 border ${
            message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Spreadsheet Editor Table */}
        {selectedCourse && (selectedExam || (isCustomExam && customExamTitle)) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm">Fetching student enrollment list...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-sm font-semibold">No students currently enrolled in this course.</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-slate-800 text-slate-100 uppercase text-xs tracking-wider">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold">Student Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Email</th>
                        <th className="text-left py-3 px-4 font-semibold">Username</th>
                        <th className="text-left py-3 px-4 font-semibold w-32">Marks Obtained</th>
                        <th className="text-left py-3 px-4 font-semibold w-32">Max Marks</th>
                        <th className="text-left py-3 px-4 font-semibold w-40">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.student_id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-700">{student.student_name}</td>
                          <td className="py-3 px-4 text-gray-500">{student.email}</td>
                          <td className="py-3 px-4 text-gray-400">{student.username}</td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min="0"
                              max={student.total_marks || defaultTotalMarks}
                              className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none"
                              value={student.marks_obtained}
                              onChange={(e) => handleMarkChange(student.student_id, "marks_obtained", e.target.value)}
                              placeholder="N/A"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min="1"
                              className="w-full bg-slate-50 border border-gray-300 rounded-lg p-2 text-sm text-center text-gray-500 outline-none"
                              value={student.total_marks || defaultTotalMarks}
                              onChange={(e) => handleMarkChange(student.student_id, "total_marks", parseInt(e.target.value) || 100)}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <select
                              className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              value={student.status || "completed"}
                              onChange={(e) => handleMarkChange(student.student_id, "status", e.target.value)}
                            >
                              <option value="completed">Completed</option>
                              <option value="absent">Absent</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Save Action */}
                <div className="bg-slate-50 border-t border-gray-200 p-4 flex justify-end gap-3">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70"
                    onClick={handleSaveMarks}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving Marks..." : "Save Examination Grades"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MarksUpload;
