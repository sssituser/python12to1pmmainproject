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
  FaArrowRight,
  FaGraduationCap,
  FaCheckCircle,
  FaBookOpen,
  FaVideo,
  FaClipboardList,
  FaFileAlt,
  FaCalendarCheck,
  FaTrophy,
  FaArrowLeft
} from "react-icons/fa";

import { defaultCourses } from "../components/CourseData.jsx";

// Dynamic Icon mapping for automatic logo generation
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
  
  return FaCode;
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

  // Dynamic SEO setup
  useSEO({
    title: selectedCourse 
      ? `${selectedCourse.title} - Curriculum & Modules | SSSIT Placement Portal`
      : "My Enrolled Courses & Learning Hub | SSSIT Placement Portal",
    description: selectedCourse
      ? `Access video lessons, study resources, assignments, exams, and attendance for ${selectedCourse.title}.`
      : "Manage all your enrolled courses, subjects, assignments, attendance logs, and learning progress on SSSIT.",
    keywords: ["SSSIT", "Enrolled Courses", "Curriculum", "Placement Portal", "Learning Hub", "Student Dashboard"]
  });

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
  }, [selectedCourse]);

  // Dynamic current Batch ID resolution
  const currentEnrollment = selectedCourse ? enrollments.find(e => 
    (selectedCourse.id && (e.course_id === selectedCourse.id || String(e.course_id) === String(selectedCourse.id))) || 
    (selectedCourse.title && e.title && e.title.toLowerCase() === selectedCourse.title.toLowerCase())
  ) : null;
  const currentBatchId = currentEnrollment?.batch_id;

  // Load dynamic batch metrics
  useEffect(() => {
    if (!currentBatchId) {
      setBatchResources([]);
      setAssignments([]);
      setAttendanceRecords([]);
      setAttendanceRate(0);
      setLeaderboard([]);
      setExamsList([]);
      return;
    }

    const token = getStoredToken("access");
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Fetch batch resources
    axios.get(`http://${window.location.hostname}:8000/api/batches/${currentBatchId}/resources/`, { headers })
    .then(res => {
      if (res.data && res.data.data) setBatchResources(res.data.data);
    })
    .catch(() => setBatchResources([]));

    // 2. Fetch assignments
    axios.get(`http://${window.location.hostname}:8000/api/assignments/?batch_id=${currentBatchId}`, { headers })
    .then(res => {
      if (res.data && res.data.success) setAssignments(res.data.data || []);
    })
    .catch(() => setAssignments([]));

    // 3. Fetch attendance rate
    axios.get(`http://${window.location.hostname}:8000/api/attendance/${currentBatchId}/`, { headers })
    .then(res => {
      if (res.data && res.data.success) {
        setAttendanceRecords(res.data.data || []);
        setAttendanceRate(res.data.attendance_percentage || 0);
      }
    })
    .catch(() => {
      setAttendanceRecords([]);
      setAttendanceRate(0);
    });

    // 4. Fetch leaderboard / batch report
    axios.get(`http://${window.location.hostname}:8000/api/batches/${currentBatchId}/report/`, { headers })
    .then(res => {
      if (res.data && res.data.success) {
        setLeaderboard(res.data.data.top_students || []);
      }
    })
    .catch(() => setLeaderboard([]));

    // 5. Fetch exams
    axios.get(`http://${window.location.hostname}:8000/api/exams/list/`, { headers })
    .then(res => {
      if (res.data) setExamsList(res.data.exams || res.data.data || res.data || []);
    })
    .catch(() => setExamsList([]));

  }, [currentBatchId]);

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
        if (currentBatchId) {
          axios.get(`http://${window.location.hostname}:8000/api/assignments/?batch_id=${currentBatchId}`, {
            headers: { Authorization: `Bearer ${getStoredToken("access")}` }
          })
          .then(r => setAssignments(r.data.data || []))
          .catch(() => {});
        }
        setSubmitAssignmentId("");
        setSubmitFileUrl("");
      }
    })
    .catch(err => console.error("Error submitting assignment:", err));
  };

  // Dynamic Course State Initialization
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

  // Helper function to get auth token
  const getStoredToken = (key) => {
    const raw = localStorage.getItem(key);
    return raw ? raw.replace(/^"|"$/g, "") : null;
  };

  // Dynamic Course Fetcher & Event Listener Sync
  useEffect(() => {
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
              studyMaterials: course.studyMaterials || course.study_materials || {},
              icon: getIconForCourse(course.title)
            }))
            .filter(c => c.title && c.title.trim() !== '');

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

    const handleCourseSync = () => {
      fetchCourses();
    };
    window.addEventListener("courseDataUpdated", handleCourseSync);
    const handleStorageChange = (e) => {
      if (e.key === "courseDataUpdated") handleCourseSync();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener('examDataUpdated', handleCourseSync);
    window.addEventListener('coursesUpdated', handleCourseSync);
    window.addEventListener('facultyCoursesUpdated', handleCourseSync);

    return () => {
       window.removeEventListener('examDataUpdated', handleCourseSync);
       window.removeEventListener('coursesUpdated', handleCourseSync);
       window.removeEventListener('facultyCoursesUpdated', handleCourseSync);
    };
  }, []);

  // Fetch Enrolled Student Courses
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
        
        try {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const userObj = JSON.parse(userStr);
            userObj.enrolledCourses = enrollList;
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

  // Sync selectedCourse from URL params
  useEffect(() => {
    if (courseId && courses.length > 0) {
      const course = courses.find(c => {
        const courseName = c.title.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
        return courseName === courseId;
      });
      
      if (course) {
        setSelectedCourse(course);
        
        const searchParams = new URLSearchParams(location.search);
        const subjectParam = searchParams.get('subject');
        if (subjectParam) {
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

  // Handle Back Button
  const handleBackToTopics = () => {
    if (selectedSubject) {
      setSelectedSubject(null);
    } else {
      setSelectedCourse(null);
      navigate('/dashboard/course');
    }
  };

  // Fully Dynamic Video Resolution & Navigation Intercept
  const handleWatchClick = (courseTitle, topic) => {
    const topicTitle = typeof topic === 'string' ? topic : (topic.title || String(topic));
    const cVideos = selectedCourse?.customVideos || selectedCourse?.custom_videos || {};
    
    let customVideoData = cVideos[topicTitle] || cVideos[selectedSubject];
    if (!customVideoData) {
      if (Array.isArray(cVideos)) {
        customVideoData = cVideos.find(v => {
          const vt = typeof v === 'string' ? v : (v?.title || v?.topic || '');
          return vt.toLowerCase() === topicTitle.toLowerCase() || vt.toLowerCase().includes(topicTitle.toLowerCase());
        });
      } else if (typeof cVideos === 'object') {
        const matchedKey = Object.keys(cVideos).find(k => 
          k.toLowerCase() === topicTitle.toLowerCase() || 
          topicTitle.toLowerCase().includes(k.toLowerCase()) || 
          k.toLowerCase().includes(topicTitle.toLowerCase())
        );
        if (matchedKey) customVideoData = cVideos[matchedKey];
      }
    }
    
    if (customVideoData) {
      localStorage.setItem('currentCustomVideo', JSON.stringify(customVideoData));
    } else {
      localStorage.removeItem('currentCustomVideo');
    }
    
    const subjectQuery = selectedSubject ? `?subject=${encodeURIComponent(selectedSubject)}` : '';
    navigate(`/video/${encodeURIComponent(courseTitle)}/${encodeURIComponent(topicTitle)}${subjectQuery}`);
  };

  // Merge Enrolled Courses dynamically
  const displayCourses = [...courses];
  if (Array.isArray(enrollments)) {
    enrollments.forEach(en => {
      const enTitle = en.title || en.course_name;
      if (enTitle) {
        const exists = displayCourses.some(c => (c.title || "").toUpperCase().trim() === enTitle.toUpperCase().trim());
        if (!exists) {
          displayCourses.push({
            id: en.course_id || en.id || `en-${Date.now()}`,
            title: enTitle,
            modules: en.modules || [],
            topics: en.topics || [],
            customVideos: en.custom_videos || en.customVideos || {},
            progress: en.progress || 0,
            icon: getIconForCourse(enTitle)
          });
        }
      }
    });
  }

  // Filter student courses dynamically
  const filteredCourses = displayCourses.filter((course) => {
    if (!studentCourse || (Array.isArray(studentCourse) && studentCourse.length === 0)) return false;
    
    const registrationIdentifiers = Array.isArray(studentCourse) 
      ? studentCourse.map(sc => String(sc).toUpperCase().trim())
      : [String(studentCourse).toUpperCase().trim()];

    const courseTitle = String(course.title || "").toUpperCase().trim();
    const courseIdString = String(course.id || "").toUpperCase().trim();
    
    return registrationIdentifiers.some(id => 
      id === courseTitle || 
      id === courseIdString || 
      courseTitle.includes(id) || 
      id.includes(courseTitle)
    );
  });

  // Calculate dynamic stats
  const totalCoursesCount = filteredCourses.length;
  const avgProgress = totalCoursesCount > 0 
    ? Math.round(filteredCourses.reduce((acc, c) => acc + (c.progress || 0), 0) / totalCoursesCount) 
    : 0;

  // =========================
  // SINGLE COURSE VIEW
  // =========================
  if (selectedCourse) {
    return (
      <main id="single-course-view-container" className="p-4 sm:p-8 bg-slate-50/50 min-h-screen">
        {/* Navigation & Header Breadcrumb */}
        <nav aria-label="Course Navigation" className="flex items-center justify-between mb-6 max-w-7xl mx-auto">
          <button
            id="course-back-btn"
            onClick={handleBackToTopics}
            className="group flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-400 hover:shadow-md text-slate-700 font-extrabold text-xs uppercase tracking-wider transition-all duration-300 active:scale-95"
          >
            <FaArrowLeft className="text-indigo-600 group-hover:-translate-x-1 transition-transform" />
            <span>{selectedSubject ? "Back to Subjects" : "Back to Courses"}</span>
          </button>

          <span className="hidden sm:inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-200/50 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Enrolled Student Session
          </span>
        </nav>

        {/* Dynamic Hero Banner for Selected Course */}
        <header className="max-w-7xl mx-auto mb-8 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mb-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-3xl sm:text-4xl shadow-xl shadow-indigo-500/20 shrink-0 border border-white/10">
                {selectedCourse.icon && React.createElement(selectedCourse.icon)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border border-indigo-500/30">
                    Active Course
                  </span>
                  {selectedSubject && (
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      {selectedSubject}
                    </span>
                  )}
                </div>
                <h1 id="selected-course-title" className="text-2xl sm:text-4xl font-black tracking-tight uppercase text-white">
                  {selectedCourse.title}
                </h1>
              </div>
            </div>

            {/* Course Progress Summary Card */}
            <div className="w-full md:w-72 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-inner shrink-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Total Completion</span>
                <span className="text-sm font-black text-emerald-400">{selectedCourse.progress || 0}%</span>
              </div>
              <div className="w-full bg-slate-900/60 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full transition-all duration-1000 shadow-sm"
                  style={{ width: `${selectedCourse.progress || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs (Glassmorphic Bar) */}
        {!selectedSubject && (
          <nav aria-label="Course Sections" className="max-w-7xl mx-auto mb-8 bg-white/80 backdrop-blur-lg p-2 rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {[
                { id: "curriculum", label: "Curriculum", icon: FaBookOpen },
                { id: "batch-resources", label: "Recordings & Notes", icon: FaVideo },
                { id: "assignments", label: "Assignments", icon: FaFileAlt },
                { id: "exams", label: "Exams Hub", icon: FaClipboardList },
                { id: "attendance", label: "Attendance", icon: FaCalendarCheck },
                { id: "leaderboard", label: "Leaderboard", icon: FaTrophy }
              ].map(t => {
                const IconComp = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    id={`tab-btn-${t.id}`}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    }`}
                  >
                    <IconComp className={`text-sm ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        {/* 1. CURRICULUM SUBJECTS VIEW */}
        {!selectedSubject && activeTab === "curriculum" && (
          <section aria-labelledby="selected-course-title" className="space-y-4 max-w-7xl mx-auto animate-fadeIn">
            {(() => {
              const modulesList = selectedCourse.modules || [];
              const topicsList = selectedCourse.topics || [];
              
              const seenTitles = new Set();
              let displaySubjects = [];

              modulesList.forEach(m => {
                const title = typeof m === 'string' ? m : (m.title || '');
                if (title && !seenTitles.has(title.toUpperCase())) {
                  seenTitles.add(title.toUpperCase());
                  displaySubjects.push(typeof m === 'string' ? { title: m, topics: [] } : m);
                }
              });

              topicsList.forEach(t => {
                const title = typeof t === 'string' ? t : (t.title || '');
                if (title && !seenTitles.has(title.toUpperCase())) {
                  seenTitles.add(title.toUpperCase());
                  displaySubjects.push(typeof t === 'string' ? { title: t, topics: [] } : t);
                }
              });
              
              if (displaySubjects.length > 0) {
                return displaySubjects.map((module, idx) => {
                  const subjectTitle = module.title || module;
                  return (
                    <article 
                      key={idx} 
                      className="group bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-300 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-5">
                        <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-indigo-200 group-hover:scale-110 transition-transform">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] block mb-0.5">Subject Module</span>
                          <h2 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                            {subjectTitle}
                          </h2>
                        </div>
                      </div>
                      
                      <button
                        id={`go-to-topics-btn-${idx}`}
                        onClick={() => setSelectedSubject(subjectTitle)}
                        className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-md shadow-slate-900/10 hover:shadow-indigo-500/25 active:scale-95 shrink-0"
                      >
                        <span>GO TO TOPICS</span>
                        <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                      </button>
                    </article>
                  );
                });
              } else {
                return (
                  <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 shadow-sm">
                    <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                      📚
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Curriculum Preparation In Progress</h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">Your instructor is currently preparing the structured modules and subjects for this course.</p>
                  </div>
                );
              }
            })()}
          </section>
        )}

        {/* 2. BATCH RESOURCES VIEW */}
        {!selectedSubject && activeTab === "batch-resources" && (
          <section aria-label="Batch Resources" className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
            {batchResources.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8 shadow-sm">
                <FaVideo className="text-4xl text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-black text-slate-700 uppercase">No Batch Recordings Available</h3>
                <p className="text-slate-400 text-xs mt-1">Class recordings and study slide decks will appear here once uploaded by your instructor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 🎥 Video Lectures Column */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2.5 uppercase tracking-wide">
                    <FaVideo className="text-indigo-600" />
                    <span>Video Lectures &amp; Recordings</span>
                  </h3>
                  <div className="space-y-3">
                    {batchResources.filter(r => r.resource_type === 'video').length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center italic">No video lectures recorded for this batch yet.</p>
                    ) : (
                      batchResources.filter(r => r.resource_type === 'video').map((res) => (
                        <article key={res.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between hover:bg-white hover:border-indigo-200 transition-all">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{res.title}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Uploaded {new Date(res.uploaded_at).toLocaleDateString()}</p>
                          </div>
                          <a
                            href={res.video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm"
                          >
                            Play Video
                          </a>
                        </article>
                      ))
                    )}
                  </div>
                </div>

                {/* 📂 Handouts & Materials Column */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2.5 uppercase tracking-wide">
                    <FaFileAlt className="text-indigo-600" />
                    <span>Handouts, Notes &amp; Slides</span>
                  </h3>
                  <div className="space-y-3">
                    {batchResources.filter(r => r.resource_type !== 'video').length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center italic">No study materials uploaded for this batch yet.</p>
                    ) : (
                      batchResources.filter(r => r.resource_type !== 'video').map((res) => (
                        <article key={res.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between hover:bg-white hover:border-indigo-200 transition-all">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{res.title}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Uploaded {new Date(res.uploaded_at).toLocaleDateString()}</p>
                          </div>
                          <a
                            href={res.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-slate-900 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm"
                          >
                            Open File
                          </a>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 3. ASSIGNMENTS VIEW */}
        {!selectedSubject && activeTab === "assignments" && (
          <section aria-label="Course Assignments" className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2.5 uppercase tracking-wide">
                <FaFileAlt className="text-indigo-600" />
                <span>Course Assignments</span>
              </h3>
              {assignments.length === 0 ? (
                <div className="py-16 text-center">
                  <FaClipboardList className="text-4xl text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-500 uppercase">No assignments published for your batch yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map(asg => {
                    const mySub = asg.submissions && asg.submissions.find(s => s.student_name === JSON.parse(localStorage.getItem("user") || "{}").username);
                    return (
                      <article key={asg.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white hover:border-indigo-200 transition-all">
                        <div className="space-y-1 flex-1">
                          <h4 className="font-extrabold text-slate-900 text-base">{asg.title}</h4>
                          <p className="text-xs text-slate-500">{asg.description}</p>
                          <p className="text-[10px] text-rose-600 font-black uppercase tracking-wider mt-2">Due Date: {new Date(asg.due_date).toLocaleString()}</p>
                          {asg.file_url && (
                            <a href={asg.file_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline mt-1 inline-block">📁 Download Reference File</a>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {mySub ? (
                            <div className="text-right">
                              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">Submitted</span>
                              {mySub.grade ? (
                                <div className="mt-2 text-xs">
                                  <span className="font-extrabold text-slate-800">Grade: {mySub.grade}</span>
                                  {mySub.feedback && <p className="text-[10px] text-slate-500 italic mt-0.5">"{mySub.feedback}"</p>}
                                </div>
                              ) : (
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Pending evaluation</p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {submitAssignmentId === asg.id ? (
                                <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-lg">
                                  <input
                                    type="text"
                                    placeholder="Paste Solution URL"
                                    value={submitFileUrl}
                                    onChange={e => setSubmitFileUrl(e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 w-52"
                                  />
                                  <button
                                    onClick={() => handleSubmission(asg.id)}
                                    disabled={!submitFileUrl.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition"
                                  >
                                    Submit
                                  </button>
                                  <button
                                    onClick={() => setSubmitAssignmentId("")}
                                    className="text-xs text-slate-400 hover:underline font-bold px-2"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setSubmitAssignmentId(asg.id)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md shadow-indigo-500/20"
                                >
                                  Submit Assignment
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 4. EXAMS HUB VIEW */}
        {!selectedSubject && activeTab === "exams" && (
          <section aria-label="Batch Exams" className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2.5 uppercase tracking-wide">
                <FaClipboardList className="text-indigo-600" />
                <span>Batch Exams &amp; Assessments</span>
              </h3>
              {examsList.length === 0 ? (
                <p className="text-xs text-slate-400 py-12 text-center uppercase font-bold">No exams scheduled for your batch.</p>
              ) : (
                <div className="space-y-4">
                  {examsList.map(ex => (
                    <article key={ex.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex justify-between items-center hover:bg-white hover:border-indigo-200 transition-all">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm uppercase">{ex.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">Duration: {ex.duration_minutes || ex.duration} mins • Questions: {ex.total_questions || (ex.questions ? ex.questions.length : 0)}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/exam/${ex.id}`)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md shadow-indigo-500/20"
                      >
                        Start Exam
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5. ATTENDANCE VIEW */}
        {!selectedSubject && activeTab === "attendance" && (
          <section aria-label="Attendance Records" className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between h-full">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance Percentage</span>
                  <h3 className="text-5xl font-black text-indigo-600 mt-3">{attendanceRate}%</h3>
                </div>
                <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold">Average daily attendance rate in current batch</p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm md:col-span-2 space-y-4">
                <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wide">Recent Attendance Sheet</h3>
                {attendanceRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">No attendance logged yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-2">
                    {attendanceRecords.map((r, idx) => (
                      <div key={idx} className="py-3 flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-800">{r.date}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider ${
                            r.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {r.status}
                          </span>
                          {r.remarks && <span className="text-slate-400 italic">({r.remarks})</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 6. LEADERBOARD VIEW */}
        {!selectedSubject && activeTab === "leaderboard" && (
          <section aria-label="Leaderboard" className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2.5 uppercase tracking-wide">
                <FaTrophy className="text-amber-500" />
                <span>Batch Leaderboard</span>
              </h3>
              {leaderboard.length === 0 ? (
                <p className="text-xs text-slate-400 py-12 text-center uppercase font-bold">No scores calculated for this batch yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 max-w-4xl">
                  {leaderboard.map((st, idx) => (
                    <article key={st.id} className="p-4 bg-slate-50/60 hover:bg-white border border-slate-100 hover:border-indigo-200 rounded-2xl flex items-center justify-between shadow-sm transition-all">
                      <div className="flex items-center gap-4">
                        <span className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm ${
                          idx === 0 ? 'bg-amber-400 text-white shadow-md shadow-amber-200' :
                          idx === 1 ? 'bg-slate-400 text-white shadow-md' :
                          idx === 2 ? 'bg-amber-700 text-white shadow-md' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm uppercase">{st.username}</h4>
                          <p className="text-[10px] text-slate-400">{st.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-indigo-600 font-black text-base">{st.total_score} Pts</span>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Total Score</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 7. TOPICS VIEW (UNDER SELECTED SUBJECT) */}
        {selectedSubject && (
          <section aria-label="Subject Topics" className="w-full animate-fadeIn max-w-7xl mx-auto">
            {(() => {
              const modObj = (selectedCourse.modules || []).find(m => m.title === selectedSubject);
              let displayTopics = modObj?.topics || [];

              if (!displayTopics || displayTopics.length === 0) {
                const rawTopics = selectedCourse.topics || [];
                const matchingTopics = rawTopics.filter(t => {
                  const tName = typeof t === 'string' ? t : (t.title || '');
                  return tName.toLowerCase() === (selectedSubject || '').toLowerCase() || 
                         (selectedSubject || '').toLowerCase().includes(tName.toLowerCase()) || 
                         tName.toLowerCase().includes((selectedSubject || '').toLowerCase());
                });

                if (matchingTopics.length > 0) {
                  displayTopics = matchingTopics;
                } else if (rawTopics.length > 0) {
                  displayTopics = rawTopics;
                }
              }

              const cVideos = selectedCourse.custom_videos || selectedCourse.customVideos || {};
              if ((!displayTopics || displayTopics.length === 0) && Object.keys(cVideos).length > 0) {
                displayTopics = Object.keys(cVideos).map(k => ({ title: typeof cVideos[k] === 'object' && cVideos[k].title ? cVideos[k].title : k, url: typeof cVideos[k] === 'object' ? cVideos[k].url : cVideos[k] }));
              }

              return (
                <div className="relative">
                  {displayTopics.length > 1 && (
                    <div className="absolute left-7 top-10 bottom-10 w-0.5 border-l-2 border-dashed border-indigo-200 z-0"></div>
                  )}

                  <div className="space-y-6 relative z-10">
                    {displayTopics.map((topic, idx) => {
                      const topicTitle = typeof topic === 'string' ? topic : (topic.title || String(topic));
                      const watched = JSON.parse(localStorage.getItem('watchedTopics') || '{}');
                      const watchedKey = `${selectedCourse.id}_${topicTitle}`;
                      const isCompleted = !!watched[watchedKey];

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
                        if (list.length === 0 && course.topics) {
                          course.topics.forEach(t => {
                            const title = typeof t === 'string' ? t : t.title;
                            if (title) list.push(title);
                          });
                        }
                        return list;
                      };

                      return (
                        <article 
                          key={idx} 
                          className="group bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                          onClick={() => handleWatchClick(selectedCourse.title, topic)}
                        >
                          <div className="flex items-center gap-5">
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
                                  
                                  const allCourseTopics = getAllTopics(selectedCourse);
                                  let completedCount = 0;
                                  allCourseTopics.forEach(t => {
                                    if (updatedWatched[`${selectedCourse.id}_${t}`]) {
                                      completedCount++;
                                    }
                                  });
                                  
                                  const newProgress = allCourseTopics.length > 0 ? Math.round((completedCount / allCourseTopics.length) * 100) : 0;
                                  
                                  setSelectedCourse({
                                    ...selectedCourse,
                                    progress: newProgress
                                  });
                                  
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
                                  } catch (err) {}
                                }}
                                className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer transition-all"
                              />
                            </div>

                            <div className="relative">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-md group-hover:scale-105 transition-transform duration-300 ${
                                isCompleted 
                                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                                  : 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white'
                              }`}>
                                {idx + 1}
                              </div>
                            </div>

                            <div>
                              <h3 className={`text-base sm:text-lg font-black uppercase tracking-tight transition-colors ${
                                isCompleted ? 'text-slate-400 line-through' : 'text-slate-900 group-hover:text-indigo-600'
                              }`}>
                                {topicTitle}
                              </h3>
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                                {isCompleted ? 'Completed' : 'Ready to Watch'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-inner group-hover:shadow-lg ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                                : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                            }`}>
                              <FaPlay className="text-sm ml-0.5 group-hover:animate-pulse" />
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {displayTopics.length === 0 && (
                    <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 shadow-sm">
                      <span className="text-6xl mb-4 block">🏗️</span>
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Course Video Lessons Incoming</h3>
                      <p className="text-slate-500 text-sm mt-2">Your instructor is preparing high-definition video lessons for this subject.</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </section>
        )}
      </main>
    );
  }

  // =========================
  // COURSE CATALOG / LIST VIEW
  // =========================
  if (loading || isValidating) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-3xl border border-slate-200/80 shadow-xl max-w-sm w-full">
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-800 font-black uppercase text-xs tracking-widest animate-pulse">Loading Enrolled Courses...</p>
        </div>
      </div>
    );
  }

  return (
    <main id="courses-catalog-container" className="min-h-screen bg-slate-50/50 p-4 sm:p-8">
      {/* Modern Catalog Hero Banner */}
      <section aria-labelledby="catalog-hero-title" className="max-w-7xl mx-auto mb-10 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl -mb-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full border border-indigo-500/30 mb-4">
              <FaGraduationCap className="text-sm" />
              <span>SSSIT Academy • Student Learning Portal</span>
            </div>
            <h1 id="catalog-hero-title" className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase leading-tight mb-3">
              My Enrolled Courses
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              Access your enrolled curriculum, active video lectures, batch study materials, assignments, assessments, and attendance status.
            </p>
          </div>

          {/* Quick Analytics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full lg:w-auto shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Enrolled</span>
              <span className="text-2xl font-black text-white">{totalCoursesCount}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Avg Progress</span>
              <span className="text-2xl font-black text-emerald-400">{avgProgress}%</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Status</span>
              <span className="text-xs font-black text-cyan-400 uppercase tracking-wider block mt-1">Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Course Cards Responsive Grid */}
      <section aria-label="Enrolled Courses List" className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredCourses.map((course, index) => {
            return (
              <article
                key={index}
                id={`course-card-${index}`}
                className="group bg-white rounded-3xl p-7 shadow-xl shadow-slate-200/50 border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 relative overflow-hidden flex flex-col h-[460px] w-full cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                {/* Decorative background accent */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-slate-50 rounded-bl-[4rem] group-hover:bg-indigo-50/50 transition-colors duration-500 -mr-10 -mt-10 pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon Area */}
                  <div className="flex justify-between items-start mb-6 shrink-0 h-14">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                      {course.icon && React.createElement(course.icon)}
                    </div>
                    {course.locked ? (
                      <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                        <FaLock className="text-slate-400 text-sm" />
                      </div>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-200">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Course Title Area */}
                  <div className="mb-4 min-h-[88px] flex items-start">
                    <h2 className="text-xl font-black text-slate-900 leading-tight tracking-tight uppercase group-hover:text-indigo-600 transition-colors line-clamp-3">
                      {course.title?.toUpperCase()}
                    </h2>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mb-6 shrink-0 h-20 flex flex-col justify-end">
                    {!course.locked && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Learning Flow</span>
                           <span className="text-xs font-black text-slate-900">{course.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden p-0.5">
                          <div
                            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-full rounded-full transition-all duration-1000 shadow-sm"
                            style={{ width: `${course.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto shrink-0">
                    {course.locked ? (
                      <button 
                        disabled 
                        className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] cursor-not-allowed border border-slate-200"
                      >
                        Locked Course
                      </button>
                    ) : (
                      <button
                        id={`view-details-btn-${index}`}
                        onClick={() => handleViewDetails(course)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/25 hover:shadow-indigo-500/35 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3"
                      >
                        <span>VIEW DETAILS</span>
                        <FaArrowRight className="text-xs" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {filteredCourses.length === 0 && studentCourse && (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 shadow-sm">
              <div className="text-slate-300 text-6xl mb-4">📚</div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">No Enrolled Courses Assigned</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                No active course enrollment found matching "{Array.isArray(studentCourse) ? studentCourse.join(", ") : studentCourse}". Contact your academy administrator for access.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default CoursesPage;
