import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { useSEO } from "../utils/useSEO";
import {
  FaPython,
  FaJs,
  FaJava,
  FaDatabase,
  FaMicrosoft,
  FaReact,
  FaLock,
  FaCode,
  FaBrain,
  FaRobot,
  FaCloud,
  FaShieldAlt,
  FaChartLine,
  FaMobile,
  FaGamepad,
  FaServer,
  FaCogs,
  FaLaptopCode,
  FaGitAlt,
  FaDocker,
  FaAws,
  FaLink,
  FaGoogle,
  FaApple,
  FaAndroid,
  FaPlay,
  FaArrowRight
} from "react-icons/fa";

import { defaultCourses } from "../components/CourseData.jsx";

// Icon mapping for automatic logo generation
const getIconForCourse = (courseName) => {
  const lowerName = String(courseName || "").toLowerCase();
  
  if (lowerName.includes('python')) return FaPython;
  if (lowerName.includes('javascript') || lowerName.includes('js')) return FaJs;
  if (lowerName.includes('java')) return FaJava;
  if (lowerName.includes('sql') || lowerName.includes('database')) return FaDatabase;
  if (lowerName.includes('.net') || lowerName.includes('dotnet')) return FaMicrosoft;
  if (lowerName.includes('react')) return FaReact;
  if (lowerName.includes('ai') || lowerName.includes('artificial')) return FaBrain;
  if (lowerName.includes('agentic') || lowerName.includes('agent')) return FaRobot;
  if (lowerName.includes('cloud')) return FaCloud;
  if (lowerName.includes('security') || lowerName.includes('cyber')) return FaShieldAlt;
  if (lowerName.includes('data') || lowerName.includes('analytics')) return FaChartLine;
  if (lowerName.includes('mobile') || lowerName.includes('app')) return FaMobile;
  if (lowerName.includes('game') || lowerName.includes('gaming')) return FaGamepad;
  if (lowerName.includes('blockchain') || lowerName.includes('crypto')) return FaLink;
  if (lowerName.includes('server') || lowerName.includes('backend')) return FaServer;
  if (lowerName.includes('devops') || lowerName.includes('tools')) return FaCogs;
  if (lowerName.includes('web') || lowerName.includes('frontend')) return FaLaptopCode;
  if (lowerName.includes('git') || lowerName.includes('version')) return FaGitAlt;
  if (lowerName.includes('docker') || lowerName.includes('container')) return FaDocker;
  if (lowerName.includes('aws') || lowerName.includes('amazon')) return FaAws;
  if (lowerName.includes('google') || lowerName.includes('gcp')) return FaGoogle;
  if (lowerName.includes('apple') || lowerName.includes('ios')) return FaApple;
  if (lowerName.includes('android')) return FaAndroid;
  
  return FaCode; // Default icon
};

function CoursesPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [studentCourse, setStudentCourse] = useState("");
  const [isValidating, setIsValidating] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [batchResources, setBatchResources] = useState([]);
  const [activeTab, setActiveTab] = useState("curriculum");

  // Student specific dashboard states
  const [assignments, setAssignments] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [examsList, setExamsList] = useState([]);
  const [submitAssignmentId, setSubmitAssignmentId] = useState("");
  const [submitFileUrl, setSubmitFileUrl] = useState("");

  useEffect(() => {
    document.title = selectedCourse 
      ? `${selectedCourse.title} - Curriculum | SSSIT Placement Portal`
      : "My Enrolled Courses | SSSIT Placement Portal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      if (selectedCourse) {
        metaDesc.setAttribute("content", `Access the curriculum modules, subjects, and video learning resources for the ${selectedCourse.title} course.`);
      } else {
        metaDesc.setAttribute("content", "View all your enrolled courses, subjects, lessons, and learning progress on the SSSIT Placement Portal.");
      }
    }
  }, [selectedCourse]);

  // Load batch resources when course is selected
  useEffect(() => {
    if (!selectedCourse) {
      setBatchResources([]);
      setAssignments([]);
      setAttendanceRecords([]);
      setAttendanceRate(0);
      setLeaderboard([]);
      setExamsList([]);
      return;
    }
    const enrollment = enrollments.find(e => e.course_id === selectedCourse.id);
    if (enrollment && enrollment.batch_id) {
      const token = getStoredToken("access");
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch resources
      axios.get(`http://${window.location.hostname}:8000/api/batches/${enrollment.batch_id}/resources/`, { headers })
      .then(res => {
        if (res.data && res.data.data) setBatchResources(res.data.data);
      })
      .catch(err => console.error("Error fetching batch resources:", err));

      // 2. Fetch assignments
      axios.get(`http://${window.location.hostname}:8000/api/assignments/?batch_id=${enrollment.batch_id}`, { headers })
      .then(res => {
        if (res.data && res.data.success) setAssignments(res.data.data);
      })
      .catch(err => console.error("Error fetching assignments:", err));

      // 3. Fetch attendance rate
      axios.get(`http://${window.location.hostname}:8000/api/attendance/logs/?batch_id=${enrollment.batch_id}`, { headers })
      .then(res => {
        if (res.data && res.data.success) {
          setAttendanceRecords(res.data.data);
          setAttendanceRate(res.data.attendance_percentage || 0);
        }
      })
      .catch(err => console.error("Error fetching attendance rate:", err));

      // 4. Fetch leaderboard / batch report
      axios.get(`http://${window.location.hostname}:8000/api/batches/${enrollment.batch_id}/report/`, { headers })
      .then(res => {
        if (res.data && res.data.success) {
          setLeaderboard(res.data.data.top_students || []);
        }
      })
      .catch(err => console.error("Error loading batch report:", err));

      // 5. Fetch exams
      axios.get(`http://${window.location.hostname}:8000/api/exams/placement/?batch_id=${enrollment.batch_id}`, { headers })
      .then(res => {
        if (res.data) setExamsList(res.data.exams || res.data.data || res.data);
      })
      .catch(err => console.error("Error loading exams:", err));
    }
  }, [selectedCourse, enrollments]);

  const handleSubmission = (assignmentId) => {
    if (!submitFileUrl.trim()) return;
    const token = getStoredToken("access");
    axios.post(`http://${window.location.hostname}:8000/api/assignments/submit/`, {
      assignment: assignmentId,
      submitted_file_url: submitFileUrl
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.data && res.data.success) {
        // Refresh assignments list
        const enrollment = enrollments.find(e => e.course_id === selectedCourse?.id);
        if (enrollment && enrollment.batch_id) {
          axios.get(`http://${window.location.hostname}:8000/api/assignments/?batch_id=${enrollment.batch_id}`, {
            headers: { Authorization: `Bearer ${getStoredToken("access")}` }
          })
          .then(r => setAssignments(r.data.data))
          .catch(e => console.error(e));
        }
        setSubmitAssignmentId("");
        setSubmitFileUrl("");
      }
    })
    .catch(err => console.error("Error submitting assignment:", err));
  };

  // Icon and course state initialization (with deduplication)
  const [courses, setCourses] = useState(() => {
    const facultySaved = localStorage.getItem('facultyCourses');
    const genericSaved = localStorage.getItem('courses');
    const saved = facultySaved || genericSaved;
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const withIcons = parsed.map(course => ({
            ...course,
            icon: getIconForCourse(typeof course === 'string' ? course : (course.title || "Course"))
          })).filter(c => c.title && c.title.trim() !== '');
          // Deduplicate by title
          const seen = new Map();
          return withIcons.filter(c => {
            const key = c.title.trim().toUpperCase();
            if (seen.has(key)) return false;
            seen.set(key, true);
            return true;
          });
        }
      } catch (e) {
        console.error("Error parsing local courses:", e);
      }
    }
    return defaultCourses;
  });
  
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);

  // Helper function to get auth token
  const getStoredToken = (key) => {
    const raw = localStorage.getItem(key);
    return raw ? raw.replace(/^"|"$/g, "") : null;
  };

  // Sync courses with backend on mount to ensure all devices see the same curriculum
  useEffect(() => {
    // 🧹 One-time purge of stale localStorage to force fresh deduped data
    if (!sessionStorage.getItem('student_cache_cleared')) {
      localStorage.removeItem('courses');
      localStorage.removeItem('facultyCourses');
      sessionStorage.setItem('student_cache_cleared', '1');
    }

    const fetchCourses = async () => {
      const token = getStoredToken("access");
      if (!token) return;

      try {
        const response = await axios.get(`http://${window.location.hostname}:8000/api/courses/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        let courseData = [];
        if (response.data.results && Array.isArray(response.data.results)) {
          courseData = response.data.results;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          courseData = response.data.data;
        } else if (Array.isArray(response.data)) {
          courseData = response.data;
        }

        if (courseData.length > 0) {
          const mapped = courseData
            .map(course => ({
              ...course,
              customVideos: course.customVideos || course.custom_videos || {},
              icon: getIconForCourse(course.title)
            }))
            .filter(c => c.title && c.title.trim() !== '');

          // ✅ Deduplicate by title (case-insensitive)
          const seen = new Map();
          const coursesWithIcons = [];
          for (const course of mapped) {
            const key = course.title.trim().toUpperCase();
            if (!seen.has(key)) {
              seen.set(key, true);
              coursesWithIcons.push(course);
            }
          }

          setCourses(coursesWithIcons);
          localStorage.setItem('courses', JSON.stringify(coursesWithIcons));
          localStorage.setItem('facultyCourses', JSON.stringify(coursesWithIcons));
        }
      } catch (error) {
        console.error('Error fetching courses from API:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();

    // Add automatic update listener for assessment results
    const handleExamDataUpdate = (event) => {
       console.log("🔄 Course - Exam updated, refreshing data...");
       fetchCourses();
    };

    window.addEventListener('examDataUpdated', handleExamDataUpdate);

    return () => {
       window.removeEventListener('examDataUpdated', handleExamDataUpdate);
    };
  }, []);

  // Removed old loose filtering useEffect to ensure student sees exactly what faculty added.
  // The database is now the sole source of truth.
  
  useEffect(() => {
    const fetchStudentInfo = async () => {
      const storedToken = localStorage.getItem("access");
      const token = storedToken ? storedToken.replace(/^"|"$/g, "") : null;
      
      if (!token) {
        setIsValidating(false);
        return;
      }

      try {
        const response = await axios.get(`http://${window.location.hostname}:8000/api/student/my-courses/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        let enrollList = [];
        let titles = [];
        if (response.data && response.data.data) {
          enrollList = response.data.data;
          titles = response.data.data.map(e => e.title);
        }
        
        setEnrollments(enrollList);
        setStudentCourse(titles);
        
        // GLOBAL SYNC: Ensuring the main user object matches the API
        try {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const userObj = JSON.parse(userStr);
            userObj.enrolledCourses = enrollments;
            localStorage.setItem("user", JSON.stringify(userObj));
          }
        } catch (e) {}

      } catch (error) {
        console.error("Dashboard profile sync error:", error);
      } finally {
        setIsValidating(false);
      }
    };

    fetchStudentInfo();
  }, [navigate]);

  // Handle URL parameter for specific course
  useEffect(() => {
    if (courseId && courses.length > 0) {
      const course = courses.find(c => {
        const courseName = c.title.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
        return courseName === courseId;
      });
      
      if (course) {
        setSelectedCourse(course);
        
        // Restore selected subject from URL if present
        const searchParams = new URLSearchParams(location.search);
        const subjectParam = searchParams.get('subject');
        if (subjectParam && course.modules?.some(m => m.title === subjectParam)) {
          setSelectedSubject(subjectParam);
        }
      } else {
        navigate('/dashboard/course');
      }
    }
  }, [courseId, courses, navigate, location.search]);

  // Handle View Details Click
  const handleViewDetails = (course) => {
    const courseName = course.title.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
    navigate(`/dashboard/course/${courseName}`);
    setSelectedCourse(course);
  };

  // Handle Back to Topics
  const handleBackToTopics = () => {
    if (selectedSubject) {
      setSelectedSubject(null);
    } else {
      setSelectedCourse(null);
      navigate('/dashboard/course');
    }
  };

  // Handle Watch Click intercepting specific customized config properties dynamically identically bridging faculty configurations safely over!
  const handleWatchClick = (courseTitle, topic) => {
    const topicTitle = typeof topic === 'string' ? topic : topic.title;
    const customVideoData = (selectedCourse?.customVideos && selectedCourse.customVideos[topicTitle]) || 
                         (selectedCourse?.custom_videos && selectedCourse.custom_videos[topicTitle]);
    
    if (customVideoData) {
      localStorage.setItem('currentCustomVideo', JSON.stringify(customVideoData));
    } else {
      localStorage.removeItem('currentCustomVideo');
    }
    
    // Pass the current subject in the URL so we can return to it
    const subjectQuery = selectedSubject ? `?subject=${encodeURIComponent(selectedSubject)}` : '';
    navigate(`/video/${encodeURIComponent(courseTitle)}/${encodeURIComponent(topicTitle)}${subjectQuery}`);
  };

  // =========================
  // SINGLE COURSE VIEW
  // =========================
  if (selectedCourse) {
    return (
      <div className="p-6 bg-white min-h-screen">
        {/* Minimal Navigation Header */}
        <div className="flex justify-start items-center mb-6">
          <button
            onClick={handleBackToTopics}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold text-sm tracking-tight transition-all"
          >
            <span className="text-sm">←</span> Back
          </button>
        </div>

        {/* Tab switcher - only show if not viewing a specific subject */}
        {!selectedSubject && (
          <div className="flex flex-wrap border-b border-gray-200 mb-8 max-w-5xl mx-auto gap-2">
            {[
              { id: "curriculum", label: "📖 Curriculum" },
              { id: "batch-resources", label: "🎥 Recordings & Notes" },
              { id: "assignments", label: "📝 Assignments" },
              { id: "exams", label: "📋 Exams Hub" },
              { id: "attendance", label: "📅 Attendance" },
              { id: "leaderboard", label: "🏆 Leaderboard" }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`py-3 px-6 font-bold text-sm uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === t.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Subjects View (Module List - Line by Line) */}
        {!selectedSubject && activeTab === "curriculum" && (
          <div className="space-y-4 max-w-5xl mx-auto">
            {selectedCourse.modules && selectedCourse.modules.length > 0 ? (
              selectedCourse.modules.map((module, idx) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <span className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                        {module.title}
                      </h3>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedSubject(module.title)}
                    className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    GO TO TOPICS
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-gray-400 bg-gray-50 rounded-3xl border-4 border-dashed border-gray-100">
                <p className="text-2xl font-bold">Your instructor hasn't added any subjects to this course yet.</p>
              </div>
            )}
            

          </div>
        )}

        {/* Batch Resources View */}
        {!selectedSubject && activeTab === "batch-resources" && (
          <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
            {batchResources.length === 0 ? (
              <div className="py-20 text-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-xl font-bold">No batch recordings or handouts uploaded for your batch yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 🎥 Video Lectures Column */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-lg font-black text-slate-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                    🎥 Video Lectures &amp; Recordings
                  </h3>
                  <div className="space-y-3">
                    {batchResources.filter(r => r.resource_type === 'video').length === 0 ? (
                      <p className="text-sm text-gray-400 py-4">No video lectures recorded for this batch yet.</p>
                    ) : (
                      batchResources.filter(r => r.resource_type === 'video').map((res, idx) => (
                        <div key={res.id} className="p-4 rounded-2xl border border-gray-50 bg-gray-50/50 flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{res.title}</h4>
                            <p className="text-xs text-gray-400 mt-0.5">Uploaded {new Date(res.uploaded_at).toLocaleDateString()}</p>
                          </div>
                          <a
                            href={res.video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm"
                          >
                            Play Video
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 📂 Handouts & Materials Column */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-lg font-black text-slate-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                    📂 Handouts, Notes &amp; Slides
                  </h3>
                  <div className="space-y-3">
                    {batchResources.filter(r => r.resource_type !== 'video').length === 0 ? (
                      <p className="text-sm text-gray-400 py-4">No study materials uploaded for this batch yet.</p>
                    ) : (
                      batchResources.filter(r => r.resource_type !== 'video').map((res, idx) => (
                        <div key={res.id} className="p-4 rounded-2xl border border-gray-50 bg-gray-50/50 flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{res.title}</h4>
                            <p className="text-xs text-gray-400 mt-0.5">Uploaded {new Date(res.uploaded_at).toLocaleDateString()}</p>
                          </div>
                          <a
                            href={res.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition border border-slate-200"
                          >
                            Open File
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Assignments View */}
        {!selectedSubject && activeTab === "assignments" && (
          <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                📝 Course Assignments
              </h3>
              {assignments.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">No assignments published for your batch yet.</p>
              ) : (
                <div className="space-y-4">
                  {assignments.map(asg => {
                    const mySub = asg.submissions && asg.submissions.find(s => s.student_name === JSON.parse(localStorage.getItem("user") || "{}").username);
                    return (
                      <div key={asg.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1 flex-1">
                          <h4 className="font-bold text-gray-900 text-sm">{asg.title}</h4>
                          <p className="text-xs text-gray-500">{asg.description}</p>
                          <p className="text-[10px] text-red-500 font-bold">Due: {new Date(asg.due_date).toLocaleString()}</p>
                          {asg.file_url && (
                            <a href={asg.file_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-1 inline-block">📁 Download Reference File</a>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {mySub ? (
                            <div className="text-right">
                              <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold uppercase">Submitted</span>
                              {mySub.grade ? (
                                <div className="mt-1.5 text-xs">
                                  <span className="font-bold text-slate-700">Grade: {mySub.grade}</span>
                                  {mySub.feedback && <p className="text-[10px] text-gray-500 italic mt-0.5">"{mySub.feedback}"</p>}
                                </div>
                              ) : (
                                <p className="text-[10px] text-gray-400 mt-1">Pending evaluation</p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {submitAssignmentId === asg.id ? (
                                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200">
                                  <input
                                    type="text"
                                    placeholder="Paste Solution URL"
                                    value={submitFileUrl}
                                    onChange={e => setSubmitFileUrl(e.target.value)}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 w-48"
                                  />
                                  <button
                                    onClick={() => handleSubmission(asg.id)}
                                    disabled={!submitFileUrl.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                                  >
                                    Submit
                                  </button>
                                  <button
                                    onClick={() => setSubmitAssignmentId("")}
                                    className="text-xs text-gray-400 hover:underline"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setSubmitAssignmentId(asg.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                                >
                                  Submit Assignment
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Exams View */}
        {!selectedSubject && activeTab === "exams" && (
          <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                📋 Batch Exams
              </h3>
              {examsList.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">No exams scheduled for your batch.</p>
              ) : (
                <div className="space-y-4">
                  {examsList.map(ex => (
                    <div key={ex.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{ex.title}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Duration: {ex.duration_minutes || ex.duration} mins • Questions: {ex.total_questions || (ex.questions ? ex.questions.length : 0)}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/exam/${ex.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        Start Exam
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attendance View */}
        {!selectedSubject && activeTab === "attendance" && (
          <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Attendance Stat Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-fit">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attendance Percentage</span>
                <h3 className="text-4xl font-black text-blue-600 mt-2">{attendanceRate}%</h3>
                <p className="text-[10px] text-gray-400 mt-1">Average daily attendance rate in current batch</p>
              </div>

              {/* Attendance Log Table */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm md:col-span-2 space-y-4">
                <h3 className="text-base font-extrabold text-slate-800 border-b border-gray-100 pb-2">Recent Attendance Sheet</h3>
                {attendanceRecords.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">No attendance logged yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-2">
                    {attendanceRecords.map((r, idx) => (
                      <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-700">{r.date}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            r.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {r.status}
                          </span>
                          {r.remarks && <span className="text-gray-400 italic">({r.remarks})</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard View */}
        {!selectedSubject && activeTab === "leaderboard" && (
          <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                🏆 Batch Leaderboard
              </h3>
              {leaderboard.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">No scores calculated for this batch yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 max-w-3xl">
                  {leaderboard.map((st, idx) => (
                    <div key={st.id} className="p-4 bg-gray-50/50 hover:bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm transition">
                      <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          idx === 0 ? 'bg-yellow-400 text-white shadow' :
                          idx === 1 ? 'bg-slate-300 text-white shadow' :
                          idx === 2 ? 'bg-amber-600 text-white shadow' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">{st.username}</h4>
                          <p className="text-[10px] text-gray-400">{st.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-blue-600 font-extrabold text-sm">{st.total_score} Pts</span>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Total Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Topics View (Premium Sequential Design) */}
        {selectedSubject && (
          <div className="w-full animate-fadeIn max-w-6xl mx-auto">
            <div className="relative">
              {selectedCourse.modules.find(m => m.title === selectedSubject)?.topics.length > 1 && (
                <div className="absolute left-7 top-10 bottom-10 w-0.5 border-l-2 border-dashed border-blue-100 z-0"></div>
              )}

              <div className="space-y-6 relative z-10">
                {selectedCourse.modules.find(m => m.title === selectedSubject)?.topics.map((topic, idx) => {
                  const topicTitle = typeof topic === 'string' ? topic : topic.title;
                  const watched = JSON.parse(localStorage.getItem('watchedTopics') || '{}');
                  const watchedKey = `${selectedCourse.id}_${topicTitle}`;
                  const isCompleted = !!watched[watchedKey];

                  // Get all topics count for course
                  const getAllTopics = (course) => {
                    let list = [];
                    if (course && course.modules) {
                      course.modules.forEach(m => {
                        if (m.topics) {
                          m.topics.forEach(t => {
                            const title = typeof t === 'string' ? t : t.title;
                            if (title) list.push(title);
                          });
                        }
                      });
                    }
                    return list;
                  };

                  return (
                    <div 
                      key={idx} 
                      className="group bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                      onClick={() => handleWatchClick(selectedCourse.title, topic)}
                    >
                      <div className="flex items-center gap-6">
                        {/* Completion Checkbox */}
                        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            title="Mark as completed"
                            onChange={async (e) => {
                              const isChecked = e.target.checked;
                              const updatedWatched = JSON.parse(localStorage.getItem('watchedTopics') || '{}');
                              if (isChecked) {
                                updatedWatched[watchedKey] = true;
                              } else {
                                delete updatedWatched[watchedKey];
                              }
                              localStorage.setItem('watchedTopics', JSON.stringify(updatedWatched));
                              
                              // Re-calculate progress dynamically
                              const allCourseTopics = getAllTopics(selectedCourse);
                              let completedCount = 0;
                              allCourseTopics.forEach(t => {
                                if (updatedWatched[`${selectedCourse.id}_${t}`]) {
                                  completedCount++;
                                }
                              });
                              
                              const newProgress = allCourseTopics.length > 0 ? Math.round((completedCount / allCourseTopics.length) * 100) : 0;
                              
                              // Update course state to reflect in real-time
                              setSelectedCourse({
                                ...selectedCourse,
                                progress: newProgress
                              });
                              
                              // Call backend API to sync progress
                              try {
                                const token = localStorage.getItem("access")?.replace(/^"|"$/g, "");
                                await fetch(`http://${window.location.hostname}:8000/api/student/courses/update-progress/`, {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`
                                  },
                                  body: JSON.stringify({
                                    course_id: selectedCourse.id,
                                    progress: newProgress
                                  })
                                });
                              } catch (err) {
                                console.error("Failed to sync progress to database", err);
                              }
                            }}
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer transition-all"
                          />
                        </div>

                        {/* Status/Index Circle */}
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform duration-300 ${
                            isCompleted 
                              ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-green-100'
                              : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-100'
                          }`}>
                            {idx + 1}
                          </div>
                        </div>

                        <div>
                          <h4 className={`text-lg font-bold uppercase tracking-tight transition-colors ${
                            isCompleted ? 'text-slate-400 line-through' : 'text-slate-800 group-hover:text-blue-600'
                          }`}>
                            {topicTitle}
                          </h4>
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                            {isCompleted ? 'Completed' : 'Ready to Watch'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-inner group-hover:shadow-lg ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                            : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                        }`}>
                          <FaPlay className="text-sm ml-0.5 group-hover:animate-pulse" />
                        </div>
                      </div>
                    </div>
                })}
              </div>

                {selectedCourse.modules.find(m => m.title === selectedSubject)?.topics.length === 0 && (
                  <div className="py-24 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <span className="text-6xl mb-6 block grayscale group-hover:grayscale-0 transition-all">🏗️</span>
                    <h3 className="text-2xl font-bold text-gray-700">Course materials incoming</h3>
                    <p className="text-gray-500 mt-2">Your faculty is currently preparing the high-quality video content for this subject.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================
  // COURSE LIST VIEW
  // =========================
  if (loading || isValidating) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium animate-pulse">Verifying Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black text-amber-900 tracking-tight">
            Courses
          </h2>

        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {courses
          .filter((course) => {
            // Strictly enforce individual course access (Support multiple courses)
            if (!studentCourse || (Array.isArray(studentCourse) && studentCourse.length === 0)) return false;
            
            const registrationIdentifiers = Array.isArray(studentCourse) 
              ? studentCourse.map(sc => String(sc).toUpperCase().trim())
              : [String(studentCourse).toUpperCase().trim()];

            const courseTitle = String(course.title || "").toUpperCase().trim();
            const courseIdString = String(course.id || "").toUpperCase().trim();
            
            // Match against either Title or ID for absolute reliability across all laptops
            return registrationIdentifiers.some(id => id === courseTitle || id === courseIdString);
          })
          .map((course, index) => {

          return (
            <div
              key={index}
              className="group bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200 border border-white hover:border-slate-200 transition-all duration-300 relative overflow-hidden flex flex-col h-[440px] w-full cursor-pointer hover:-translate-y-1.5"
            >
              {/* Subtle accent gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[3rem] group-hover:bg-blue-50 transition-colors duration-500 -mr-10 -mt-10" />

              <div className="relative z-10 flex flex-col h-full">
                {/* Top Row: Standardized Icon Area */}
                <div className="flex justify-between items-start mb-6 shrink-0 h-12">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-md transition-all">
                    {course.icon && React.createElement(course.icon, { className: "text-xl" })}
                  </div>
                  {course.locked && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <FaLock className="text-slate-300 text-sm" />
                    </div>
                  )}
                </div>

                {/* Title Area: Fixed Height for Symmetry */}
                <div className="mb-4 min-h-[92px] flex items-center">
                  <h3 className="text-xl font-black text-slate-900 leading-tight tracking-tight uppercase group-hover:text-amber-900 transition-colors line-clamp-3">
                    {course.title?.toUpperCase()}
                  </h3>
                </div>

                {/* Progress Indicators: Pinned Position */}
                <div className="mb-6 shrink-0 h-24 flex flex-col justify-end">
                  {!course.locked && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 shadow-inner">
                      <div className="flex justify-between items-end mb-2">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Progress Flow</span>
                         <span className="text-xs font-black text-slate-800">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden p-0.5">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-1000 shadow-sm"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button: Bottom Pinned */}
                <div className="mt-auto shrink-0">
                  {course.locked ? (
                    <button className="w-full bg-slate-50 text-slate-300 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] cursor-not-allowed border border-slate-100 transition-colors">
                      Locked
                    </button>
                  ) : (
                    <button
                      onClick={() => handleViewDetails(course)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black transition-all text-sm uppercase tracking-[0.2em] shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-95"
                    >
                      VIEW DETAILS
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {courses.length === 0 && studentCourse && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              📚
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No courses found for your course
            </h3>
            <p className="text-gray-600">
              We don't have any specific courses for "{studentCourse}" yet. 
              Check back later or contact your instructor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoursesPage;
