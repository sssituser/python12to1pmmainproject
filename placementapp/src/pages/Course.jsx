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
  FaPlay
} from "react-icons/fa";

function CoursesPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [studentCourse, setStudentCourse] = useState("");
  const [isValidating, setIsValidating] = useState(true);
  const [courses, setCourses] = useState(() => {
    // Initial fetch from localStorage to ensure permanent data availability on this laptop
    const facultySaved = localStorage.getItem('facultyCourses');
    const genericSaved = localStorage.getItem('courses');
    const saved = facultySaved || genericSaved;
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(course => ({
            ...course,
            icon: getIconForCourse(typeof course === 'string' ? course : course.title)
          }));
        }
      } catch (e) {
        console.error("Error parsing local courses:", e);
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(false); // Start as false because we load from disk first
  const isFirstRender = useRef(true);

  // Helper function to get auth token
  const getStoredToken = (key) => {
    const raw = localStorage.getItem(key);
    return raw ? raw.replace(/^"|"$/g, "") : null;
  };

  // Icon mapping for automatic logo generation
  const getIconForCourse = (courseName) => {
    const lowerName = courseName.toLowerCase();
    
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

  // Sync courses with backend on mount to ensure all devices see the same curriculum
  useEffect(() => {
    const fetchCourses = async () => {
      const token = getStoredToken("access");
      if (!token) return;

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/courses/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Handle DRF ViewSet variations: paginated (.results), wrapped (.data.success), or raw array
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
            icon: getIconForCourse(course.title)
          }));
          setCourses(coursesWithIcons);
          // Permanently save to this laptop
          localStorage.setItem('courses', JSON.stringify(coursesWithIcons));
          localStorage.setItem('facultyCourses', JSON.stringify(coursesWithIcons));
        }
      } catch (error) {
        console.error('Error fetching courses from API, staying with local data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Removed old loose filtering useEffect to ensure student sees exactly what faculty added.
  // The database is now the sole source of truth.
  
  useEffect(() => {
    const fetchStudentInfo = async () => {
      const token = getStoredToken("access");
      if (!token) {
        setIsValidating(false);
        return;
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.course_title) {
          setStudentCourse(response.data.course_title);
        } else if (response.data && response.data.course) {
          setStudentCourse(response.data.course);
        }
      } catch (error) {
        console.error('Critical: Failed to validate student registration:', error);
      } finally {
        setIsValidating(false);
      }
    };

    fetchStudentInfo();
  }, []);

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
    
    if (selectedCourse?.customVideos && selectedCourse.customVideos[topicTitle]) {
      localStorage.setItem('currentCustomVideo', JSON.stringify(selectedCourse.customVideos[topicTitle]));
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
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-lg"
          >
            <span className="text-xl">←</span> Back
          </button>
        </div>

        {/* Subjects View (Module List - Line by Line) */}
        {!selectedSubject && (
          <div className="space-y-4 max-w-5xl mx-auto">
            {selectedCourse.modules && selectedCourse.modules.length > 0 ? (
              selectedCourse.modules.map((module, idx) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-xl border border-gray-100 shadow-md p-5 flex items-center justify-between hover:border-blue-300 transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <span className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="text-2xl font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {module.title}
                      </h3>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedSubject(module.title)}
                    className="flex items-center gap-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    GO TO TOPICS
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className="group bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-350 transform hover:-translate-y-1 cursor-pointer"
                      onClick={() => handleWatchClick(selectedCourse.title, topic)}
                    >
                      <div className="flex items-center gap-8">
                        {/* Status/Index Circle */}
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-xl shadow-indigo-200 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {idx + 1}
                          </div>
                          {/* Success tick or icon could go here later */}
                        </div>

                        <div>
                          <h4 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {topicTitle}
                          </h4>
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-500 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            Ready to Watch
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right mr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs font-black text-gray-400 uppercase">Interactive Session</p>
                          <p className="text-sm font-bold text-blue-600">Click to Play</p>
                        </div>
                        
                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-lg">
                          <FaPlay className="text-xl ml-1 group-hover:animate-pulse" />
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
          <h2 className="text-gray-900 text-2xl font-bold">
            Courses
          </h2>

        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {courses
          .filter((course) => {
            // Strictly enforce individual course access
            if (!studentCourse) return false;
            
            const registrationIdentifier = String(studentCourse).toUpperCase().trim();
            const courseTitle = String(course.title || "").toUpperCase().trim();
            const courseIdString = String(course.id || "").toUpperCase().trim();
            
            // Match against either Title or ID for absolute reliability across all laptops
            return courseTitle === registrationIdentifier || courseIdString === registrationIdentifier;
          })
          .map((course, index) => {
            const Icon = course.icon || FaCode;

          return (
            <div
              key={index}
              className="bg-white text-gray-900 rounded-xl p-6 shadow-lg border border-gray-100 duration-300 relative overflow-hidden flex flex-col h-[400px] w-full"
            >
              {/* Background faded icon - precisely centered */}
              <div className="absolute inset-0 flex items-center justify-center text-[10rem] opacity-[0.02] pointer-events-none">
                <Icon />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                {/* Top Row: Icon + Lock */}
                <div className="flex justify-between items-start mb-2 h-10">
                  <div className="text-4xl text-blue-600">
                    <Icon />
                  </div>
                  {course.locked && (
                    <FaLock className="text-gray-400 mt-1" />
                  )}
                </div>

                {/* Title Area: Optimized for symmetry and zero gap */}
                <div className="mb-2" style={{ minHeight: '95px' }}>
                  <h3 className="text-xl font-bold uppercase tracking-tight leading-tight text-gray-900">
                    {course.title?.toUpperCase()}
                  </h3>
                </div>

                {/* Progress Bar Area: Balanced spacing */}
                <div className="w-full h-14 flex flex-col justify-center">
                  {!course.locked && (
                    <div className="w-full">
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-green-500 h-full rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</span>
                        <span className="text-[10px] font-black text-blue-600 uppercase">{course.progress}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Spacer to keep card bottom-heavy and symmetric */}
                <div className="flex-grow"></div>

                {/* Action Button: High contrast and high impact */}
                <div className="mt-2">
                  {course.locked ? (
                    <button className="w-full bg-gray-50 text-gray-300 py-3 rounded-xl font-bold cursor-not-allowed text-xs uppercase tracking-widest border border-gray-100">
                      Locked
                    </button>
                  ) : (
                    <button
                      onClick={() => handleViewDetails(course)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black transition-all text-sm uppercase tracking-widest shadow-md hover:shadow-blue-200 outline-none active:scale-[0.98]"
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
