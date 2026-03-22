import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  FaAndroid
} from "react-icons/fa";

function CoursesPage() {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newTopic, setNewTopic] = useState("");
  const [progressNotification, setProgressNotification] = useState(null);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  
  // ✅ Default courses for first-time setup
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

  // ✅ Icon mapping for automatic logo generation
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

  // ✅ Load courses from localStorage on component mount
  useEffect(() => {
    const savedCourses = localStorage.getItem('courses');
    if (savedCourses) {
      try {
        // Parse the saved courses and convert icon strings back to components
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
      // First time visit - save default courses
      setCourses(defaultCourses);
      localStorage.setItem('courses', JSON.stringify(defaultCourses));
    }
  }, []);

  // ✅ Save courses to localStorage whenever they change
  useEffect(() => {
    if (courses.length > 0) {
      localStorage.setItem('courses', JSON.stringify(courses));
    }
  }, [courses]);

  // ✅ Generate dynamic topics for new courses
  const generateTopicsForCourse = (courseName) => {
    const lowerName = courseName.toLowerCase();
    
    if (lowerName.includes('ai') || lowerName.includes('artificial') || lowerName.includes('agentic')) {
      return [
        "Introduction to AI",
        "Machine Learning Basics",
        "Neural Networks",
        "Deep Learning",
        "Natural Language Processing",
        "Computer Vision",
        "AI Ethics",
        "Reinforcement Learning"
      ];
    }
    
    if (lowerName.includes('python')) {
      return [
        "Python Basics",
        "Variables and Data Types",
        "Loops",
        "Functions",
        "Lists and Tuples",
        "Dictionaries",
        "File Handling",
        "Exception Handling"
      ];
    }
    
    if (lowerName.includes('javascript') || lowerName.includes('js')) {
      return [
        "JS Basics",
        "ES6",
        "DOM Manipulation",
        "React Basics",
        "Arrays and Objects",
        "Async Programming",
        "Event Handling",
        "Error Handling"
      ];
    }
    
    if (lowerName.includes('java')) {
      return [
        "Introduction to Java",
        "Java Operators",
        "Data Types",
        "Control Flow",
        "Methods",
        "Classes and Objects",
        "Inheritance",
        "Polymorphism"
      ];
    }
    
    if (lowerName.includes('sql') || lowerName.includes('database')) {
      return [
        "SQL Basics",
        "SELECT Queries",
        "Joins",
        "Aggregate Functions",
        "Subqueries",
        "Indexes",
        "Transactions",
        "Database Normalization"
      ];
    }
    
    if (lowerName.includes('react')) {
      return [
        "React Intro",
        "Components",
        "State Management",
        "Hooks",
        "Props and PropTypes",
        "Conditional Rendering",
        "Forms in React",
        "React Router"
      ];
    }
    
    // Default topics for any course
    return [
      "Introduction",
      "Basic Concepts",
      "Advanced Features",
      "Best Practices",
      "Real-world Applications",
      "Troubleshooting",
      "Performance Optimization",
      "Future Trends"
    ];
  };

  // ✅ Add New Course
  const addNewCourse = () => {
    if (!newCourseName.trim()) return;
    
    const newCourse = {
      id: Math.max(...courses.map(c => c.id)) + 1,
      title: newCourseName,
      icon: getIconForCourse(newCourseName),
      level: "Beginner",
      duration: "3 hrs",
      progress: 0,
      locked: false,
      topics: generateTopicsForCourse(newCourseName)
    };
    
    setCourses([...courses, newCourse]);
    setNewCourseName("");
    setShowAddCourse(false);
  };

  // ✅ Add Topic
  const addTopic = () => {
    if (!newTopic.trim()) return;

    // Find the course and add topic
    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    if (courseIndex !== -1) {
      const updatedCourses = [...courses];
      updatedCourses[courseIndex].topics.push(newTopic);
      setCourses(updatedCourses);
      setSelectedCourse({...updatedCourses[courseIndex]});
    }

    setNewTopic("");
  };

  // ✅ Handle Watch Click
  const handleWatchClick = (courseTitle, topic) => {
    // Update progress when watching a video
    updateCourseProgress(courseTitle, topic);
    
    // Navigate to video player with course and topic
    navigate(`/video/${encodeURIComponent(courseTitle)}/${encodeURIComponent(topic)}`);
  };

  // ✅ Update Course Progress
  const updateCourseProgress = (courseTitle, topic) => {
    // Find the course
    const courseIndex = courses.findIndex(c => c.title === courseTitle);
    if (courseIndex !== -1) {
      // Calculate new progress (increment by 10% for each video watched, max 100%)
      const currentProgress = courses[courseIndex].progress;
      const newProgress = Math.min(currentProgress + 10, 100);
      
      // Update the course progress
      const updatedCourses = [...courses];
      updatedCourses[courseIndex].progress = newProgress;
      setCourses(updatedCourses);
      
      // Update selected course if it's currently displayed
      if (selectedCourse && selectedCourse.title === courseTitle) {
        setSelectedCourse({...updatedCourses[courseIndex]});
      }
      
      // Show progress update notification
      setProgressNotification({
        course: courseTitle,
        oldProgress: currentProgress,
        newProgress: newProgress
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setProgressNotification(null);
      }, 3000);
    }
  };

  // ✅ Handle View Details Click
  const handleViewDetails = (course) => {
    setSelectedCourse(course);
  };

  // ✅ Handle Back to Courses
  const handleBackToCourses = () => {
    setSelectedCourse(null);
  };

  // =========================
  // 👉 SINGLE COURSE VIEW
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
            onClick={handleBackToCourses}
            className="text-blue-600 hover:underline"
          >
            ← Back
          </button>
        </div>

        {/* Add Topic */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Enter new topic..."
            className="flex-1 p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={addTopic}
            className="bg-blue-600 text-white px-5 rounded-lg hover:bg-blue-700"
          >
            Add Topic
          </button>
        </div>

        {/* Topics */}
        <div className="space-y-4">
          {selectedCourse.topics.map((topic, index) => (
            <div key={index} className="flex justify-between items-center">
              <p className="text-lg font-medium">{topic}</p>
              <button
                onClick={() => handleWatchClick(selectedCourse.title, topic)}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
              >
                Watch
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

      {/* Progress Notification */}
      {progressNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          <div className="font-semibold">
            Progress Updated! 🎉
          </div>
          <div className="text-sm">
            {progressNotification.course}: {progressNotification.oldProgress}% → {progressNotification.newProgress}%
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Add New Course</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="Enter course name (e.g., Agentic AI)"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddCourse(false);
                  setNewCourseName("");
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={addNewCourse}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-gray-900 text-2xl font-bold">
          Courses
        </h2>
        <button
          onClick={() => setShowAddCourse(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
        >
          + Add Course
        </button>
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