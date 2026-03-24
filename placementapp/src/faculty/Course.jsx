import React, { useState, useEffect } from "react";
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
  FaAndroid
} from "react-icons/fa";

function CoursesPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newTopic, setNewTopic] = useState("");
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [generatedTopics, setGeneratedTopics] = useState([]);
  const [showTopicPreview, setShowTopicPreview] = useState(false);

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

  // Generate dynamic topics for new courses
  const generateTopicsForCourse = (courseName) => {
    const lowerName = courseName.toLowerCase();
    console.log('Generating topics for:', courseName, 'Lowercase:', lowerName);
    
    // Debug specific conditions
    console.log('Checking conditions:');
    console.log('  - includes("python testing"):', lowerName.includes('python testing'));
    console.log('  - includes("automation testing"):', lowerName.includes('automation testing'));
    console.log('  - includes("test automation"):', lowerName.includes('test automation'));
    console.log('  - includes("testing"):', lowerName.includes('testing'));
    console.log('  - includes("python"):', lowerName.includes('python'));
    
    // Power BI / Business Intelligence
    if (lowerName.includes('power bi') || lowerName.includes('powerbi') || lowerName.includes('business intelligence') || lowerName.includes('bi')) {
      console.log('Matched Power BI/BI topics');
      return [
        "Introduction to Power BI",
        "Data Modeling in Power BI",
        "DAX Functions",
        "Power Query and Data Transformation",
        "Creating Visualizations",
        "Power BI Service",
        "Dashboard Design",
        "Advanced Analytics"
      ];
    }
    
    // AI/Agentic AI
    if (lowerName.includes('ai') || lowerName.includes('artificial') || lowerName.includes('agentic')) {
      console.log('Matched AI/Agentic topics');
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
    
    // Python Testing / Automation Testing (more specific check first)
    if (lowerName.includes('python testing') || lowerName.includes('automation testing') || lowerName.includes('test automation')) {
      console.log('Matched Python Testing/Automation topics');
      return [
        "Introduction to Python Testing",
        "Unit Testing with PyTest",
        "Test Driven Development",
        "Automation Testing Frameworks",
        "Selenium with Python",
        "API Testing with Python",
        "Test Data Management",
        "Continuous Integration Testing"
      ];
    }
    
    // General Testing (fallback for any testing-related courses)
    if (lowerName.includes('testing')) {
      console.log('Matched General Testing topics');
      return [
        "Introduction to Software Testing",
        "Manual Testing Basics",
        "Test Planning and Design",
        "Test Execution and Reporting",
        "Quality Assurance",
        "Test Management Tools",
        "Bug Tracking and Reporting",
        "Testing Best Practices"
      ];
    }
    
    // Python (general - checked after specific variants)
    if (lowerName.includes('python') && !lowerName.includes('testing') && !lowerName.includes('automation')) {
      console.log('Matched Python topics');
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
    
    // JavaScript
    if (lowerName.includes('javascript') || lowerName.includes('js')) {
      console.log('Matched JavaScript topics');
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
    
    // Java
    if (lowerName.includes('java')) {
      console.log('Matched Java topics');
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
    
    // SQL/Database
    if (lowerName.includes('sql') || lowerName.includes('database')) {
      console.log('Matched SQL/Database topics');
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
    
    // React
    if (lowerName.includes('react')) {
      console.log('Matched React topics');
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
    
    // DevOps
    if (lowerName.includes('devops') || lowerName.includes('tools')) {
      console.log('Matched DevOps topics');
      return [
        "Introduction to DevOps",
        "Version Control with Git",
        "CI/CD Pipelines",
        "Container Orchestration",
        "Infrastructure as Code",
        "Monitoring and Logging",
        "Cloud Platforms",
        "DevOps Best Practices"
      ];
    }
    
    // Cyber Security
    if (lowerName.includes('security') || lowerName.includes('cyber')) {
      console.log('Matched Cyber Security topics');
      return [
        "Introduction to Cyber Security",
        "Network Security Fundamentals",
        "Cryptography and Encryption",
        "Web Application Security",
        "Ethical Hacking Basics",
        "Security Auditing",
        "Incident Response",
        "Security Compliance"
      ];
    }
    
    // Data Science
    if (lowerName.includes('data science') || lowerName.includes('datascience') || lowerName.includes('analytics')) {
      console.log('Matched Data Science topics');
      return [
        "Data Science Introduction",
        "Statistics for Data Science",
        "Data Collection and Cleaning",
        "Exploratory Data Analysis",
        "Machine Learning Fundamentals",
        "Data Visualization",
        "Big Data Technologies",
        "Data Science Projects"
      ];
    }
    
    // Cloud Computing
    if (lowerName.includes('cloud') || lowerName.includes('aws') || lowerName.includes('azure') || lowerName.includes('gcp')) {
      console.log('Matched Cloud Computing topics');
      return [
        "Cloud Computing Basics",
        "AWS Fundamentals",
        "Azure Services",
        "Google Cloud Platform",
        "Cloud Architecture",
        "Cloud Security",
        "DevOps in Cloud",
        "Cloud Cost Management"
      ];
    }
    
    // Mobile Development
    if (lowerName.includes('mobile') || lowerName.includes('android') || lowerName.includes('ios')) {
      console.log('Matched Mobile Development topics');
      return [
        "Mobile App Development",
        "Android Studio Setup",
        "iOS Development Basics",
        "React Native",
        "Flutter Basics",
        "Mobile UI/UX",
        "App Deployment",
        "Mobile Testing"
      ];
    }
    
    // Web Development
    if (lowerName.includes('web') || lowerName.includes('html') || lowerName.includes('css') || lowerName.includes('frontend')) {
      console.log('Matched Web Development topics');
      return [
        "HTML Fundamentals",
        "CSS Styling",
        "JavaScript for Web",
        "Responsive Design",
        "Web Frameworks",
        "Backend Basics",
        "Web APIs",
        "Web Performance"
      ];
    }
    
    console.log('Using default topics');
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

  // Load courses from localStorage on component mount
  useEffect(() => {
    console.log('=== LOADING COURSES FROM LOCALSTORAGE ===');
    const savedCourses = localStorage.getItem('courses');
    console.log('Saved courses from localStorage:', savedCourses);
    
    if (savedCourses) {
      try {
        const parsedCourses = JSON.parse(savedCourses);
        console.log('Parsed courses:', parsedCourses);
        
        // Check if any courses have generic topics and regenerate them
        const updatedCourses = parsedCourses.map(course => {
          const hasGenericTopics = course.topics && (
            course.topics.includes("Introduction") ||
            course.topics.includes("Basic Concepts") ||
            course.topics.includes("Advanced Features") ||
            course.topics.includes("Best Practices") ||
            course.topics.includes("Real-world Applications") ||
            course.topics.includes("Troubleshooting") ||
            course.topics.includes("Performance Optimization") ||
            course.topics.includes("Future Trends")
          );
          
          if (hasGenericTopics) {
            console.log(`Course "${course.title}" has generic topics, regenerating...`);
            const newTopics = generateTopicsForCourse(course.title);
            console.log(`New topics for "${course.title}":`, newTopics);
            return {
              ...course,
              topics: newTopics
            };
          }
          
          return course;
        });
        
        // Check if any courses were updated
        const coursesWereUpdated = JSON.stringify(updatedCourses) !== JSON.stringify(parsedCourses);
        
        if (coursesWereUpdated) {
          console.log('Courses were updated with new topics, saving to localStorage...');
          localStorage.setItem('courses', JSON.stringify(updatedCourses));
          localStorage.setItem('facultyCourses', JSON.stringify(updatedCourses));
        }
        
        // Debug each course's topics
        updatedCourses.forEach((course, index) => {
          console.log(`Course ${index + 1}: "${course.title}"`);
          console.log(`  Topics:`, course.topics);
          console.log(`  Topic count:`, course.topics?.length || 0);
        });
        
        const coursesWithIcons = updatedCourses.map(course => ({
          ...course,
          icon: getIconForCourse(course.title)
        }));
        setCourses(coursesWithIcons);
        console.log('Courses set with icons:', coursesWithIcons);
      } catch (error) {
        console.error('Error loading courses from localStorage:', error);
        setCourses(defaultCourses);
      }
    } else {
      console.log('No saved courses found, using default courses');
      setCourses(defaultCourses);
      localStorage.setItem('courses', JSON.stringify(defaultCourses));
    }
    console.log('=== COURSE LOADING COMPLETE ===');
  }, []);

  // Save courses to localStorage whenever they change
  useEffect(() => {
    if (courses.length > 0) {
      localStorage.setItem('courses', JSON.stringify(courses));
      localStorage.setItem('facultyCourses', JSON.stringify(courses)); // Sync with student view
    }
  }, [courses]);

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
        navigate('/faculty/Course');
      }
    }
  }, [courseId, courses, navigate]);

  // Generate Topics for Preview
  const generateTopicsForPreview = () => {
    if (!newCourseName.trim()) {
      alert('Please enter a course name first');
      return;
    }
    
    console.log('Generating topics for preview:', newCourseName);
    const topics = generateTopicsForCourse(newCourseName);
    console.log('Generated topics:', topics);
    setGeneratedTopics(topics);
    setShowTopicPreview(true);
  };

  // Add New Course
  const addNewCourse = () => {
    if (!newCourseName.trim()) return;
    
    if (generatedTopics.length === 0) {
      alert('Please generate topics first by clicking "Generate Topics" button');
      return;
    }
    
    console.log('Adding new course:', newCourseName);
    
    const newCourse = {
      id: Math.max(...courses.map(c => c.id)) + 1,
      title: newCourseName,
      icon: getIconForCourse(newCourseName),
      level: "Beginner",
      duration: "3 hrs",
      progress: 0,
      locked: false,
      topics: generatedTopics
    };
    
    console.log('Generated course with topics:', newCourse);
    
    // Add the new course to the courses array
    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    
    // Save to localStorage immediately
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    localStorage.setItem('facultyCourses', JSON.stringify(updatedCourses));
    console.log('Saved to localStorage');
    
    // Clear form and reset state
    setNewCourseName("");
    setGeneratedTopics([]);
    setShowTopicPreview(false);
    setShowAddCourse(false);
    
    // Navigate to the newly created course topics page after a short delay
    setTimeout(() => {
      const courseName = newCourse.title.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
      console.log('Navigating to:', `/faculty/Course/${courseName}`);
      navigate(`/faculty/Course/${courseName}`);
      setSelectedCourse(newCourse);
    }, 100);
  };

  // Reset Course Creation Form
  const resetCourseForm = () => {
    setNewCourseName("");
    setGeneratedTopics([]);
    setShowTopicPreview(false);
  };

  // Add Topic
  const addTopic = () => {
    if (!newTopic.trim()) return;

    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    if (courseIndex !== -1) {
      const updatedCourses = [...courses];
      updatedCourses[courseIndex].topics.push(newTopic);
      setCourses(updatedCourses);
      setSelectedCourse({...updatedCourses[courseIndex]});
    }

    setNewTopic("");
  };

  // Remove Topic
  const removeTopic = (topicToRemove) => {
    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    if (courseIndex !== -1) {
      const updatedCourses = [...courses];
      updatedCourses[courseIndex].topics = updatedCourses[courseIndex].topics.filter(
        topic => topic !== topicToRemove
      );
      setCourses(updatedCourses);
      setSelectedCourse({...updatedCourses[courseIndex]});
    }
  };

  // Handle View Details Click
  const handleViewDetails = (course) => {
    const courseName = course.title.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
    navigate(`/faculty/Course/${courseName}`);
    setSelectedCourse(course);
  };

  // Handle Back to Topics
  const handleBackToTopics = () => {
    setSelectedCourse(null);
  };

  // Handle Watch Click
  const handleWatchClick = (courseTitle, topic) => {
    // Navigate to video player with course and topic
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
              <div className="flex gap-2">
                <button
                  onClick={() => handleWatchClick(selectedCourse.title, topic)}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                >
                  Watch
                </button>
                <button
                  onClick={() => removeTopic(topic)}
                  className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
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
      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Add New Course</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => {
                    setNewCourseName(e.target.value);
                    setShowTopicPreview(false);
                    setGeneratedTopics([]);
                  }}
                  placeholder="Enter course name (e.g., Python Automation Testing)"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Topic Preview Section */}
              {showTopicPreview && generatedTopics.length > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-blue-900 mb-3">
                    Generated Topics for "{newCourseName}":
                  </h4>
                  <ul className="space-y-2">
                    {generatedTopics.map((topic, index) => (
                      <li key={index} className="flex items-center text-blue-800">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">
                          {index + 1}
                        </span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-blue-600 mt-3">
                    These topics will be added to your course. Click "Submit" to create the course.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => {
                  resetCourseForm();
                  setShowAddCourse(false);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={generateTopicsForPreview}
                  disabled={!newCourseName.trim()}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  Generate Topics
                </button>
                <button
                  onClick={addNewCourse}
                  disabled={generatedTopics.length === 0}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  Submit
                </button>
              </div>
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
