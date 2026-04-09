import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
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
  
  // Icon and course state initialization
  const [courses, setCourses] = useState(() => {
    const facultySaved = localStorage.getItem('facultyCourses');
    const genericSaved = localStorage.getItem('courses');
    const saved = facultySaved || genericSaved;
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(course => ({
            ...course,
            icon: getIconForCourse(typeof course === 'string' ? course : (course.title || "Course"))
          }));
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
          const coursesWithIcons = courseData.map(course => ({
            ...course,
            customVideos: course.customVideos || course.custom_videos || {},
            icon: getIconForCourse(course.title)
          }));
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
        const response = await axios.get(`http://${window.location.hostname}:8000/api/profile/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        let enrollments = [];
        if (response.data && response.data.enrolled_courses) {
          enrollments = response.data.enrolled_courses;
        } else if (response.data && response.data.course_title) {
          enrollments = [response.data.course_title];
        }
        
        setStudentCourse(enrollments);
        
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

        {/* Subjects View (Module List - Line by Line) */}
        {!selectedSubject && (
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

        {/* Topics View (Premium Sequential Design) */}
        {selectedSubject && (
          <div className="w-full animate-fadeIn max-w-6xl mx-auto">
            <div className="relative">
              {/* Vertical Timeline Guide - hidden if only 1 topic */}
              {selectedCourse.modules.find(m => m.title === selectedSubject)?.topics.length > 1 && (
                <div className="absolute left-7 top-10 bottom-10 w-0.5 border-l-2 border-dashed border-blue-100 z-0"></div>
              )}

              <div className="space-y-6 relative z-10">
                {selectedCourse.modules.find(m => m.title === selectedSubject)?.topics.map((topic, idx) => {
                  const topicTitle = typeof topic === 'string' ? topic : topic.title;
                  return (
                    <div 
                      key={idx} 
                      className="group bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                      onClick={() => handleWatchClick(selectedCourse.title, topic)}
                    >
                      <div className="flex items-center gap-6">
                        {/* Status/Index Circle */}
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-blue-100 shadow-md group-hover:scale-105 transition-transform duration-300">
                            {idx + 1}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                            {topicTitle}
                          </h4>
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                            Ready to Watch
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-lg">
                          <FaPlay className="text-sm ml-0.5 group-hover:animate-pulse" />
                        </div>
                      </div>
                    </div>
                  );
                })}

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
