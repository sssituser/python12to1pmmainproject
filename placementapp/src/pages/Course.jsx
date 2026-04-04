import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studentCourse, setStudentCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
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

  // Load courses from API on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      const token = getStoredToken("access");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Use student endpoint to get courses with progress
        const response = await axios.get("http://127.0.0.1:8000/api/courses/student/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          const coursesWithIcons = response.data.data.map(course => ({
            ...course,
            icon: getIconForCourse(course.title)
          }));
          setCourses(coursesWithIcons);
        } else {
          console.error('Failed to fetch courses:', response.data);
          loadDefaultCourses();
        }
      } catch (error) {
        console.error('Error fetching courses from API:', error);
        loadDefaultCourses();
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Helper function to load default courses
  const loadDefaultCourses = () => {
    // Import default courses from CourseData
    import('../components/CourseData.jsx').then(module => {
      const coursesWithIcons = module.defaultCourses.map(course => ({
        ...course,
        icon: module.getIconForCourse(course.title)
      }));
      setCourses(coursesWithIcons);
    }).catch(error => {
      console.error('Error loading default courses:', error);
    });
  };

  // Filter courses when studentCourse changes (only after courses are loaded)
  useEffect(() => {
    if (studentCourse && courses.length > 0 && !loading) {
      // Filter courses based on student's course
      const filteredCourses = courses.filter(course => {
        const courseTitle = course.title.toLowerCase();
        const studentCourseLower = studentCourse.toLowerCase();
        
        // Check if student's course is mentioned in the course title
        return courseTitle.includes(studentCourseLower) || 
               studentCourseLower.includes(courseTitle) ||
               courseTitle.includes('basic') || 
               courseTitle.includes('introduction') ||
               courseTitle.includes('fundamentals') ||
               courseTitle.includes('development') ||
               courseTitle.includes('programming') ||
               courseTitle.includes('full stack') ||
               courseTitle.includes('stack') ||
               courseTitle.includes('web') ||
               courseTitle.includes('software');
      });
      
      // Only update if filtered courses are different
      if (JSON.stringify(filteredCourses) !== JSON.stringify(courses)) {
        setCourses(filteredCourses);
      }
    }
  }, [studentCourse]); // Remove courses from dependencies, add loading check

  // Handle URL parameter for specific course
  useEffect(() => {
    if (courseId && courses.length > 0) {
      const course = courses.find(c => {
        const courseName = c.title.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
        return courseName === courseId;
      });
      
      if (course) {
        setSelectedCourse(course);
      } else {
        navigate('/dashboard/course');
      }
    }
  }, [courseId, courses, navigate]);

  // Handle View Details Click
  const handleViewDetails = (course) => {
    const courseName = course.title.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
    navigate(`/dashboard/course/${courseName}`);
    setSelectedCourse(course);
  };

  // Handle Back to Topics
  const handleBackToTopics = () => {
    setSelectedCourse(null);
    navigate('/dashboard/course');
  };

  // Handle Watch Click intercepting specific customized config properties dynamically identically bridging faculty configurations safely over!
  const handleWatchClick = (courseTitle, topic) => {
    if (selectedCourse?.customVideos && selectedCourse.customVideos[topic]) {
      localStorage.setItem('currentCustomVideo', JSON.stringify(selectedCourse.customVideos[topic]));
    } else {
      localStorage.removeItem('currentCustomVideo');
    }
    navigate(`/video/${encodeURIComponent(courseTitle)}/${encodeURIComponent(topic)}`);
  };

  // =========================
  // SINGLE COURSE VIEW
  // =========================
  if (selectedCourse) {
    return (
      <div className="p-6 bg-white min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {selectedCourse.title} Course Content
          </h2>

          <button
            onClick={handleBackToTopics}
            className="text-blue-600 hover:underline"
          >
            ← Back 
          </button>
        </div>

        {/* Modules with Topics */}
        <div className="space-y-6">
          {selectedCourse.modules ? (
            selectedCourse.modules.map((module, moduleIndex) => (
              <div key={moduleIndex} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                {/* Module Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-xl">
                  <h3 className="text-lg font-bold flex items-center gap-3">
                    <span className="bg-white/20 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-sm">
                      {moduleIndex + 1}
                    </span>
                    {module.title}
                  </h3>
                  <p className="text-sm text-white/80 mt-1">
                    {module.topics.length} topics
                  </p>
                </div>

                {/* Topics List */}
                <div className="p-4">
                  <div className="space-y-3">
                    {module.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                            {topicIndex + 1}
                          </span>
                          <p className="text-gray-800 font-medium">{topic}</p>
                        </div>
                        <button
                          onClick={() => handleWatchClick(selectedCourse.title, topic)}
                          className="text-blue-600 hover:text-blue-800 p-2 flex items-center justify-center transform hover:scale-125 transition-all duration-300"
                          title="Watch Video"
                        >
                          <FaPlay className="text-lg" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Fallback to flat topics list if no modules */
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Course Topics</h3>
              {selectedCourse.topics.map((topic, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    <p className="text-lg font-medium text-gray-800">{topic}</p>
                  </div>
                  <button
                    onClick={() => handleWatchClick(selectedCourse.title, topic)}
                    className="text-blue-600 hover:text-blue-800 p-2 flex items-center justify-center transform hover:scale-125 transition-all duration-300"
                    title="Watch Video"
                  >
                    <FaPlay className="text-xl" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================
  // COURSE LIST VIEW
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
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
          {studentCourse && (
            <p className="text-sm text-gray-600 mt-1">
              Showing courses for: <span className="font-semibold text-blue-600">{studentCourse}</span>
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {courses.map((course, index) => {
          const Icon = course.icon;

          return (
            <div
              key={index}
              className="bg-white text-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 hover:scale-105 transition duration-300 relative overflow-hidden flex flex-col h-80"
            >
              {/* Background faded icon */}
              <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-10">
                <Icon />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                {/* Top Row */}
                <div className="flex justify-between items-center mb-4">
                  <div className="text-4xl">
                    <Icon />
                  </div>

                  {course.locked && (
                    <FaLock className="text-gray-400" />
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold mb-1">
                  {course.title}
                </h3>

                {/* Level + Duration */}
                <p className="text-sm text-gray-600 mb-3">
                  {course.level} • {course.duration}
                </p>

                {/* Progress Bar */}
                {!course.locked && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 h-2 rounded">
                      <div
                        className="bg-green-500 h-2 rounded"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {course.progress}% completed
                    </p>
                  </div>
                )}

                {/* Spacer to push button to bottom */}
                <div className="flex-grow"></div>

                {/* Button */}
                {course.locked ? (
                  <button className="w-full bg-gray-200 text-gray-600 py-2 rounded">
                    Locked
                  </button>
                ) : (
                  <button 
                    onClick={() => handleViewDetails(course)}
                    className="w-full border border-gray-900 py-2 rounded hover:bg-gray-900 hover:text-white transition"
                  >
                    View Details
                  </button>
                )}
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
