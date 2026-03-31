import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  FaGoogle,
  FaApple,
  FaAndroid,
  FaPlay
} from "react-icons/fa";

function CoursesPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Default courses for first-time setup
  const defaultCourses = [
    {
      id: 1,
      title: "Python (Basic)",
      icon: FaPython,
      level: "Beginner",
      duration: "3 hrs",
      progress: 60,
      locked: false,
      topics: [
        "Python Basics",
        "Variables and Data Types",
        "Loops",
        "Functions",
        "Lists and Tuples",
        "Dictionaries",
        "File Handling",
        "Exception Handling"
      ]
    },
    {
      id: 2,
      title: "JavaScript (Basic)",
      icon: FaJs,
      level: "Beginner",
      duration: "2.5 hrs",
      progress: 40,
      locked: false,
      topics: [
        "JS Basics",
        "ES6",
        "DOM Manipulation",
        "React Basics",
        "Arrays and Objects",
        "Async Programming",
        "Event Handling",
        "Error Handling"
      ]
    },
    {
      id: 3,
      title: "Java (Intermediate)",
      icon: FaJava,
      level: "Intermediate",
      duration: "4 hrs",
      progress: 20,
      locked: false,
      topics: [
        "Introduction to Java",
        "Java Operators",
        "Data Types",
        "Control Flow",
        "Methods",
        "Classes and Objects",
        "Inheritance",
        "Polymorphism"
      ]
    },
    {
      id: 4,
      title: "SQL (Basic)",
      icon: FaDatabase,
      level: "Beginner",
      duration: "2 hrs",
      progress: 80,
      locked: false,
      topics: [
        "SQL Basics",
        "SELECT Queries",
        "Joins",
        "Aggregate Functions",
        "Subqueries",
        "Indexes",
        "Transactions",
        "Database Normalization"
      ]
    },
    {
      id: 5,
      title: ".NET (Intermediate)",
      icon: FaMicrosoft,
      level: "Intermediate",
      duration: "5 hrs",
      progress: 0,
      locked: false,
      topics: [
        ".NET Introduction",
        "C# Basics",
        "ASP.NET Core",
        "MVC Pattern",
        "Entity Framework",
        "Dependency Injection",
        "Authentication",
        "Web API Development"
      ]
    },
    {
      id: 6,
      title: "React (Basic)",
      icon: FaReact,
      level: "Beginner",
      duration: "3 hrs",
      progress: 30,
      locked: false,
      topics: [
        "React Intro",
        "Components",
        "State Management",
        "Hooks",
        "Props and PropTypes",
        "Conditional Rendering",
        "Forms in React",
        "React Router"
      ]
    }
  ];

  const [courses, setCourses] = useState([]);
  const isFirstRender = useRef(true);

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

  // Load courses from localStorage on component mount
  useEffect(() => {
    const savedCourses = localStorage.getItem('courses');
    if (savedCourses) {
      try {
        const parsedCourses = JSON.parse(savedCourses);
        const coursesWithIcons = parsedCourses.map(course => ({
          ...course,
          icon: getIconForCourse(course.title)
        }));
        setCourses(coursesWithIcons);
      } catch (error) {
        console.error('Error loading courses from localStorage:', error);
        setCourses(defaultCourses);
      }
    } else {
      setCourses(defaultCourses);
      localStorage.setItem('courses', JSON.stringify(defaultCourses));
    }
  }, []);

  // Save courses to localStorage whenever they change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem('courses', JSON.stringify(courses));
  }, [courses]);

  // Sync courses from faculty - Check for new courses added by faculty
  useEffect(() => {
    const checkForFacultyUpdates = () => {
      const facultyCourses = localStorage.getItem('facultyCourses');
      if (facultyCourses) {
        try {
          const parsedFacultyCourses = JSON.parse(facultyCourses);
          const studentCourses = localStorage.getItem('courses');
          
          if (studentCourses) {
            const parsedStudentCourses = JSON.parse(studentCourses);
            
            // Check if faculty courses are different from student courses
            const facultyUpdated = JSON.stringify(parsedFacultyCourses) !== JSON.stringify(parsedStudentCourses);
            
            if (facultyUpdated) {
              // Update student courses with faculty changes
              const updatedStudentCourses = parsedFacultyCourses.map(course => ({
                ...course,
                icon: getIconForCourse(course.title)
              }));
              localStorage.setItem('courses', JSON.stringify(updatedStudentCourses));
              setCourses(updatedStudentCourses);
            }
          } else {
            // If no student courses, use faculty courses
            const coursesWithIcons = parsedFacultyCourses.map(course => ({
              ...course,
              icon: getIconForCourse(course.title)
            }));
            localStorage.setItem('courses', JSON.stringify(coursesWithIcons));
            setCourses(coursesWithIcons);
          }
        } catch (error) {
          console.error('Error syncing courses from faculty:', error);
        }
      }
    };

    // Check for faculty updates every 2 seconds
    const interval = setInterval(checkForFacultyUpdates, 2000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
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
            {selectedCourse.title} Topics
          </h2>

          <button
            onClick={handleBackToTopics}
            className="text-blue-600 hover:underline"
          >
            ← Back 
          </button>
        </div>

        {/* Topics */}
        <div className="space-y-4">
          {selectedCourse.topics.map((topic, index) => (
            <div key={index} className="flex justify-between items-center">
              <p className="text-lg font-medium text-gray-800">{topic}</p>
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
      </div>
    );
  }

  // =========================
  // COURSE LIST VIEW
  // =========================
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-gray-900 text-2xl font-bold">
          Courses
        </h2>
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
      </div>
    </div>
  );
}

export default CoursesPage;
