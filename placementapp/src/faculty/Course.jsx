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
  FaGoogle,
  FaApple,
  FaAndroid,
  FaPlay,
  FaTrash,
  FaEdit,
  FaCheckCircle
} from "react-icons/fa";
// import VideoPlayer from '../components/VideoPlayer'; // Temporarily disabled

import { defaultCourses, getIconForCourse, generateTopicsForCourse, generateModulesForCourse } from '../components/CourseData.jsx';

function CoursesPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  // Suppress all alerts on this page
  const originalAlert = window.alert;
  window.alert = function() { return; };
  
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newTopic, setNewTopic] = useState("");
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  // Generate modules preview when course name changes
  useEffect(() => {
    if (newCourseName.trim()) {
      const modules = generateModulesForCourse(newCourseName);
      setGeneratedModules(modules);
    } else {
      setGeneratedModules([]);
    }
  }, [newCourseName]);

  const [generatedModules, setGeneratedModules] = useState([]);
  const [showTopicPreview, setShowTopicPreview] = useState(false);
  const [showVideoOptions, setShowVideoOptions] = useState(false);
  const [showTopicVideoOptions, setShowTopicVideoOptions] = useState(false);
  const [editingVideoForTopic, setEditingVideoForTopic] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState([]);
  const isFirstRender = useRef(true);
  
  // State for manual topic management in new course
  const [manualTopicEntry, setManualTopicEntry] = useState("");
  const [manualTopicsList, setManualTopicsList] = useState([]);
  const [showAddVideosMenu, setShowAddVideosMenu] = useState(false);
  const [videoAddMode, setVideoAddMode] = useState(null);
  const [expandedVideoTopic, setExpandedVideoTopic] = useState(null);
  const [topicVideos, setTopicVideos] = useState({});
  const [videoUploadFile, setVideoUploadFile] = useState({});
  const [videoUploadLink, setVideoUploadLink] = useState({});

  // Form states specifically for dynamic video configurations
  const [newCourseTopicsConfig, setNewCourseTopicsConfig] = useState({});
  const handleUpdateTopicConfig = (topic, type, value) => {
    setNewCourseTopicsConfig(prev => ({ ...prev, [topic]: { type, value } }));
  };

  const [newTopicVidOpt, setNewTopicVidOpt] = useState('upload');
  const [newTopicVidFile, setNewTopicVidFile] = useState('');
  const [newTopicVidLink, setNewTopicVidLink] = useState('');

  const [editTopicVidOpt, setEditTopicVidOpt] = useState('upload');
  const [editTopicVidFile, setEditTopicVidFile] = useState('');
  const [editTopicVidLink, setEditTopicVidLink] = useState('');
  
  // Load courses from API dynamically on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('access');
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        
        // For all users with token, try to fetch from API first
        if (token) {
          const response = await fetch('http://127.0.0.1:8000/api/courses/', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const apiCourses = await response.json();
            
            // Transform API data to match frontend structure
            const coursesWithIcons = apiCourses.map(course => ({
              ...course,
              icon: getIconForCourse(course.title),
              // Ensure required fields exist
              level: course.level || "Beginner",
              duration: course.duration || "Self-paced",
              progress: course.progress || 0,
              locked: course.locked || false,
              topics: course.topics || [],
              modules: course.modules || null,
              customVideos: course.custom_videos || {}
            }));
            
            setCourses(coursesWithIcons);
            localStorage.setItem('courses', JSON.stringify(coursesWithIcons));
            localStorage.setItem('facultyCourses', JSON.stringify(coursesWithIcons));
            return;
          } else if (response.status === 401) {
            console.log("Unauthorized - falling back to localStorage");
          }
        }
      } catch (error) {
        console.log("API fetch failed, falling back to localStorage:", error);
      }

      // Fallback to localStorage (used for faculty users and when API fails)
      const savedCourses = localStorage.getItem('courses');
      
      if (savedCourses) {
        try {
          const parsedCourses = JSON.parse(savedCourses);
          
          if (!parsedCourses || parsedCourses.length === 0) {
             setCourses(defaultCourses);
             localStorage.setItem('courses', JSON.stringify(defaultCourses));
             localStorage.setItem('facultyCourses', JSON.stringify(defaultCourses));
             return;
          }

          const coursesWithIcons = parsedCourses.map(course => ({
            ...course,
            icon: getIconForCourse(course.title)
          }));
          setCourses(coursesWithIcons);
          localStorage.setItem('facultyCourses', JSON.stringify(coursesWithIcons));
        } catch (error) {
          setCourses(defaultCourses);
          localStorage.setItem('courses', JSON.stringify(defaultCourses));
          localStorage.setItem('facultyCourses', JSON.stringify(defaultCourses));
        }
      } else {
        setCourses(defaultCourses);
        localStorage.setItem('courses', JSON.stringify(defaultCourses));
        localStorage.setItem('facultyCourses', JSON.stringify(defaultCourses));
      }
    };

    fetchCourses();
  }, []);

  // Save courses to localStorage whenever they change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem('courses', JSON.stringify(courses));
    localStorage.setItem('facultyCourses', JSON.stringify(courses)); // Sync with student view
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

  // Add New Course
  const handleAddManualTopic = () => {
    if (manualTopicEntry.trim()) {
      setManualTopicsList([...manualTopicsList, manualTopicEntry.trim()]);
      setManualTopicEntry("");
    }
  };

  const removeManualTopic = (index) => {
    setManualTopicsList(manualTopicsList.filter((_, i) => i !== index));
  };

  const addNewCourse = async () => {
    if (!newCourseName.trim()) {
      return;
    }
    
    // Generate modules with topics for the course
    let modules = [];
    if (manualTopicsList.length > 0) {
      // If manual topics were provided, put them in a single module
      modules = [{
        title: "Selected Topics",
        topics: manualTopicsList
      }];
    } else {
      // Otherwise use auto-generation
      modules = generateModulesForCourse(newCourseName);
    }
    
    // Flatten all topics from all modules for backward compatibility
    const allTopics = modules.reduce((topics, module) => {
      return topics.concat(module.topics);
    }, []);
    
    const newCourse = {
      title: newCourseName,
      icon: getIconForCourse(newCourseName),
      level: "Beginner",
      duration: "Self-paced",
      progress: 0,
      locked: false,
      topics: allTopics, // Keep for backward compatibility
      modules: modules, // New structured modules
      custom_videos: allTopics.reduce((acc, topic) => {
        if (topicVideos[topic]) {
          acc[topic] = topicVideos[topic];
        } else {
          const config = newCourseTopicsConfig[topic];
          if (config && config.value) {
            acc[topic] = {
              type: config.type,
              url: config.value
            };
          }
        }
        return acc;
      }, {})
    };
    
    try {
      // Try to save to backend API first (skip for faculty users)
      const token = localStorage.getItem('access');
      if (token) {
        // Try API for all users
        const response = await fetch('http://127.0.0.1:8000/api/courses/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newCourse)
        });

        if (response.ok) {
          const savedCourse = await response.json();
          // Use the ID from the backend response
          newCourse.id = savedCourse.id;
          console.log("Course saved to backend successfully");
        } else if (response.status === 401) {
          console.log("Unauthorized - falling back to localStorage only");
        } else {
          console.log("Backend save failed, falling back to localStorage");
        }
      }
    } catch (error) {
      console.log("API save failed, using localStorage only:", error);
    }
    
    // Add the new course to the courses array (with backend ID or local ID)
    const localId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1;
    newCourse.id = newCourse.id || localId;
    
    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    
    // Save to localStorage immediately
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    localStorage.setItem('facultyCourses', JSON.stringify(updatedCourses));
    
    // Clear form and reset state
    setNewCourseName("");
    setGeneratedModules([]);
    setShowAddCourse(false);
    setExpandedVideoTopic(null);
    setTopicVideos({});
    setVideoUploadFile({});
    setVideoUploadLink({});
    setVideoAddMode(null);
    
    // Navigate to the newly created course topics page after a short delay
    setTimeout(() => {
      const courseName = newCourse.title.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
      navigate(`/faculty/Course/${courseName}`);
      setSelectedCourse(newCourse);
    }, 100);
  };

  // Reset Course Creation Form
  const resetCourseForm = () => {
    setNewCourseName("");
    setGeneratedModules([]);
    setShowAddCourse(false);
    setExpandedVideoTopic(null);
    setTopicVideos({});
    setVideoUploadFile({});
    setVideoUploadLink({});
    setVideoAddMode(null);
  };

  // Handle explicit saving of custom changed videos per topic dynamically
  const saveChangeVideoOption = (topic) => {
    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    if (courseIndex !== -1) {
      const updatedCourses = [...courses];
      if (!updatedCourses[courseIndex].customVideos) updatedCourses[courseIndex].customVideos = {};
      
      const videoUrl = editTopicVidOpt === 'upload' ? editTopicVidFile : editTopicVidLink;
      if (videoUrl) {
        updatedCourses[courseIndex].customVideos[topic] = {
          type: editTopicVidOpt,
          url: videoUrl
        };
      } else {
        delete updatedCourses[courseIndex].customVideos[topic];
      }
      
      setCourses(updatedCourses);
      setSelectedCourse({...updatedCourses[courseIndex]});
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      localStorage.setItem('facultyCourses', JSON.stringify(updatedCourses));
    }
    setEditingVideoForTopic(null);
    setEditTopicVidOpt('upload');
    setEditTopicVidFile('');
    setEditTopicVidLink('');
  };

  // Add Topic
  const addTopic = () => {
    if (!newTopic.trim()) return;

    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    if (courseIndex !== -1) {
      const updatedCourses = [...courses];
      updatedCourses[courseIndex].topics.push(newTopic);
      
      // Save configuration if not 'generate'
      if (!updatedCourses[courseIndex].customVideos) {
        updatedCourses[courseIndex].customVideos = {};
      }
      const videoUrl = newTopicVidOpt === 'upload' ? newTopicVidFile : newTopicVidLink;
      if (videoUrl) {
         updatedCourses[courseIndex].customVideos[newTopic] = {
            type: newTopicVidOpt,
            url: videoUrl
         };
      }
      
      setCourses(updatedCourses);
      setSelectedCourse({...updatedCourses[courseIndex]});
      
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      localStorage.setItem('facultyCourses', JSON.stringify(updatedCourses));
    }

    setNewTopic("");
    setShowTopicVideoOptions(false);
    setNewTopicVidOpt('upload');
    setNewTopicVidFile('');
    setNewTopicVidLink('');
  };

  // Remove Course
  const removeCourse = (id) => {
    performRemoval([id]);
  };

  const removeSelectedCourses = () => {
    if (selectedForDeletion.length === 0) return;
    performRemoval(selectedForDeletion);
  };

  const performRemoval = async (idsToRemove) => {
    // Try to delete from backend API
    try {
      const token = localStorage.getItem('access');
      
      if (token) {
        // Try API for all users
        const deletePromises = idsToRemove.map(id => 
          fetch(`http://127.0.0.1:8000/api/courses/${id}/`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        );

        const results = await Promise.allSettled(deletePromises);
        const successfulDeletes = results.filter(result => result.status === 'fulfilled');
        const failedDeletes = results.filter(result => result.status === 'rejected');
        
        if (successfulDeletes.length > 0) {
          console.log(`Successfully deleted ${successfulDeletes.length} courses from backend`);
        }
        
        if (failedDeletes.length > 0) {
          console.log(`Failed to delete ${failedDeletes.length} courses from backend, removing from local storage only`);
        }
      }
    } catch (error) {
      console.log("Backend deletion failed, removing from localStorage only:", error);
    }
    
    // Always remove from local state and localStorage
    const updatedCourses = courses.filter(c => !idsToRemove.includes(c.id));
    setCourses(updatedCourses);
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    localStorage.setItem('facultyCourses', JSON.stringify(updatedCourses));
    
    if (selectedCourse && idsToRemove.includes(selectedCourse.id)) {
      setSelectedCourse(null);
      navigate('/faculty/Course');
    }
    setIsSelectionMode(false);
    setSelectedForDeletion([]);
  };

  const toggleCourseSelection = (id) => {
    setSelectedForDeletion(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      localStorage.setItem('facultyCourses', JSON.stringify(updatedCourses));
    }
  };

  // Remove All Topics
  const removeAllTopics = () => {
    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    if (courseIndex !== -1) {
      const updatedCourses = [...courses];
      updatedCourses[courseIndex].topics = [];
      updatedCourses[courseIndex].customVideos = {};
      setCourses(updatedCourses);
      setSelectedCourse({...updatedCourses[courseIndex]});
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      localStorage.setItem('facultyCourses', JSON.stringify(updatedCourses));
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
    navigate('/faculty/Course');
  };

  // Handle Watch Click
  const handleWatchClick = (courseTitle, topic) => {
    // Navigate to video player with course and topic
    const course = courses.find(c => c.title === courseTitle);
    if (course && course.customVideos && course.customVideos[topic]) {
      localStorage.setItem('currentCustomVideo', JSON.stringify(course.customVideos[topic]));
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

          <div className="flex gap-4">
            <button
              onClick={removeAllTopics}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-bold transition flex items-center gap-2 shadow-md hover:-translate-y-0.5"
            >
              <FaTrash /> Remove All Topics
            </button>
            <button
              onClick={handleBackToTopics}
              className="text-blue-600 hover:underline font-semibold"
            >
              ← Back 
            </button>
          </div>
        </div>

        {/* Add Topic Area with Video Source Options */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => {
                setNewTopic(e.target.value);
                setShowTopicVideoOptions(false);
              }}
              placeholder="Enter new topic..."
              className="flex-1 p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={() => setShowTopicVideoOptions(!showTopicVideoOptions)}
              disabled={!newTopic.trim()}
              className="bg-purple-600 text-white px-5 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-semibold transition-all duration-300 shadow"
            >
              Add video
            </button>
          </div>

          {/* Video Source Configuration Panel for the New Topic */}
          {showTopicVideoOptions && newTopic.trim() && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-5 mt-2 transition-all animate-fadeIn">
              <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <span>🎬</span> Set Video Source for "{newTopic}"
              </h4>
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-purple-100 rounded-lg transition">
                  <input type="radio" checked={newTopicVidOpt === 'upload'} onChange={() => setNewTopicVidOpt('upload')} name="topicVideoSource" className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-800 font-medium">(i) Upload video from PC</span>
                </label>
                {newTopicVidOpt === 'upload' && (
                  <div className="ml-8 mt-2 flex flex-col items-start gap-4 animate-fadeIn">
                    <input type="file" accept="video/*" className="p-2 border border-purple-300 rounded bg-white shadow-sm" onChange={(e) => {
                       if(e.target.files[0]) {
                         // Check if running in browser environment
                         if (typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
                           setNewTopicVidFile(URL.createObjectURL(e.target.files[0]));
                         } else {
                           // Fallback for non-browser environments
                           console.log('File selected:', e.target.files[0].name);
                           setNewTopicVidFile(e.target.files[0].name);
                         }
                       }
                    }} />
                    <button onClick={addTopic} disabled={!newTopicVidFile} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-purple-700 hover:-translate-y-0.5 transition-all w-fit">Submit</button>
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-purple-100 rounded-lg transition">
                  <input type="radio" checked={newTopicVidOpt === 'link'} onChange={() => setNewTopicVidOpt('link')} name="topicVideoSource" className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-800 font-medium">(ii) Paste your link here</span>
                </label>
                {newTopicVidOpt === 'link' && (
                  <div className="ml-8 mt-2 flex flex-col items-start gap-4 animate-fadeIn w-full">
                    <input type="url" placeholder="Paste video link here..." className="p-3 w-3/4 border border-purple-300 rounded bg-white shadow-sm" value={newTopicVidLink} onChange={(e) => setNewTopicVidLink(e.target.value)} />
                    <button onClick={addTopic} disabled={!newTopicVidLink.trim()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all w-fit">Submit</button>
                  </div>
                )}


              </div>

            </div>
          )}
        </div>

        {/* Modules and Topics */}
        <div className="space-y-6">
          {selectedCourse.modules ? (
            // Display structured modules
            selectedCourse.modules.map((module, moduleIndex) => (
              <div key={moduleIndex} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                    {moduleIndex + 1}
                  </span>
                  {module.title}
                </h4>
                <div className="space-y-3">
                  {module.topics.map((topic, topicIndex) => (
                    <div key={topicIndex} className="flex flex-col bg-white rounded-lg p-4 border border-gray-100">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                            {topicIndex + 1}
                          </span>
                          <p className="text-lg font-medium text-gray-800">{topic}</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleWatchClick(selectedCourse.title, topic)}
                            className="text-blue-600 hover:text-blue-800 p-2 flex items-center justify-center transform hover:scale-125 transition-all duration-300"
                            title="Watch Video"
                          >
                            <FaPlay className="text-lg" />
                          </button>
                          <button
                            onClick={() => setEditingVideoForTopic(editingVideoForTopic === topic ? null : topic)}
                            className="text-purple-600 hover:text-purple-800 p-2 flex items-center justify-center transform hover:scale-125 transition-all duration-300"
                            title="Change video option"
                          >
                            <FaEdit className="text-lg" />
                          </button>
                          <button
                            onClick={() => removeTopic(topic)}
                            className="text-red-500 hover:text-red-700 p-2 flex items-center justify-center transform hover:scale-125 transition-all duration-300"
                            title="Remove Topic"
                          >
                            <FaTrash className="text-lg" />
                          </button>
                        </div>
                      </div>

                      {/* Change Video Options Panel */}
                      {editingVideoForTopic === topic && (
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-5 mt-3 transition-all animate-fadeIn shadow-sm">
                          <h5 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                            <span>🎬</span> Change Video Source for "{topic}"
                          </h5>
                          <div className="flex flex-col gap-4">
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-purple-100 rounded-lg transition">
                              <input type="radio" checked={editTopicVidOpt === 'upload'} onChange={() => setEditTopicVidOpt('upload')} name={`editVideoSource_${topicIndex}`} className="w-5 h-5 text-purple-600" />
                              <span className="text-gray-800 font-medium">(i) Upload video from PC</span>
                            </label>
                            {editTopicVidOpt === 'upload' && (
                              <div className="ml-8 mt-2 flex flex-col items-start gap-4 animate-fadeIn">
                                <input type="file" accept="video/*" className="p-2 border border-purple-300 rounded bg-white shadow-sm" onChange={(e) => {
                                   if(e.target.files[0]) {
                                     // Check if running in browser environment
                                     if (typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
                                       setEditTopicVidFile(URL.createObjectURL(e.target.files[0]));
                                     } else {
                                       // Fallback for non-browser environments
                                       console.log('File selected:', e.target.files[0].name);
                                       setEditTopicVidFile(e.target.files[0].name);
                                     }
                                   }
                                }} />
                                <button onClick={() => saveChangeVideoOption(topic)} disabled={!editTopicVidFile} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-purple-700 hover:-translate-y-0.5 transition-all w-fit">Submit</button>
                              </div>
                            )}

                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-purple-100 rounded-lg transition">
                              <input type="radio" checked={editTopicVidOpt === 'link'} onChange={() => setEditTopicVidOpt('link')} name={`editVideoSource_${topicIndex}`} className="w-5 h-5 text-purple-600" />
                              <span className="text-gray-800 font-medium">(ii) Paste your link here</span>
                            </label>
                            {editTopicVidOpt === 'link' && (
                              <div className="ml-8 mt-2 flex flex-col items-start gap-4 w-full animate-fadeIn">
                                <input type="url" placeholder="Paste video link here..." className="p-3 w-3/4 border border-purple-300 rounded bg-white shadow-sm" value={editTopicVidLink} onChange={(e) => setEditTopicVidLink(e.target.value)} />
                                <button onClick={() => saveChangeVideoOption(topic)} disabled={!editTopicVidLink.trim()} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-purple-700 hover:-translate-y-0.5 transition-all w-fit">Submit</button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Fallback to flat topics list for backward compatibility
            <div className="space-y-4">
              {selectedCourse.topics.map((topic, index) => (
                <div key={index} className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-lg font-medium">{topic}</p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleWatchClick(selectedCourse.title, topic)}
                        className="text-blue-600 hover:text-blue-800 p-2 flex items-center justify-center transform hover:scale-125 transition-all duration-300"
                        title="Watch Video"
                      >
                        <FaPlay className="text-xl" />
                      </button>
                      <button
                        onClick={() => setEditingVideoForTopic(editingVideoForTopic === topic ? null : topic)}
                        className="text-purple-600 hover:text-purple-800 p-2 flex items-center justify-center transform hover:scale-125 transition-all duration-300"
                        title="Change video option"
                      >
                        <FaEdit className="text-xl" />
                      </button>
                      <button
                        onClick={() => removeTopic(topic)}
                        className="text-red-500 hover:text-red-700 p-2 flex items-center justify-center transform hover:scale-125 transition-all duration-300"
                        title="Remove Topic"
                      >
                        <FaTrash className="text-xl" />
                      </button>
                    </div>
                  </div>

                  {/* Change Video Options Panel */}
                  {editingVideoForTopic === topic && (
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-5 mt-2 transition-all animate-fadeIn shadow-sm">
                      <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                        <span>🎬</span> Change Video Source for "{topic}"
                      </h4>
                      <div className="flex flex-col gap-4">
                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-purple-100 rounded-lg transition">
                          <input type="radio" checked={editTopicVidOpt === 'upload'} onChange={() => setEditTopicVidOpt('upload')} name={`editVideoSource_${index}`} className="w-5 h-5 text-purple-600" />
                          <span className="text-gray-800 font-medium">(i) Upload video from PC</span>
                        </label>
                        {editTopicVidOpt === 'upload' && (
                          <div className="ml-8 mt-2 flex flex-col items-start gap-4 animate-fadeIn">
                            <input type="file" accept="video/*" className="p-2 border border-purple-300 rounded bg-white shadow-sm" onChange={(e) => {
                               if(e.target.files[0]) {
                                 // Check if running in browser environment
                                 if (typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
                                   setEditTopicVidFile(URL.createObjectURL(e.target.files[0]));
                                 } else {
                                   // Fallback for non-browser environments
                                   console.log('File selected:', e.target.files[0].name);
                                   setEditTopicVidFile(e.target.files[0].name);
                                 }
                               }
                            }} />
                            <button onClick={() => saveChangeVideoOption(topic)} disabled={!editTopicVidFile} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-purple-700 hover:-translate-y-0.5 transition-all w-fit">Submit</button>
                          </div>
                        )}

                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-purple-100 rounded-lg transition">
                          <input type="radio" checked={editTopicVidOpt === 'link'} onChange={() => setEditTopicVidOpt('link')} name={`editVideoSource_${index}`} className="w-5 h-5 text-purple-600" />
                          <span className="text-gray-800 font-medium">(ii) Paste your link here</span>
                        </label>
                        {editTopicVidOpt === 'link' && (
                          <div className="ml-8 mt-2 flex flex-col items-start gap-4 w-full animate-fadeIn">
                            <input type="url" placeholder="Paste video link here..." className="p-3 w-3/4 border border-purple-300 rounded bg-white shadow-sm" value={editTopicVidLink} onChange={(e) => setEditTopicVidLink(e.target.value)} />
                            <button onClick={() => saveChangeVideoOption(topic)} disabled={!editTopicVidLink.trim()} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-purple-700 hover:-translate-y-0.5 transition-all w-fit">Submit</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
  return (
    <div className="min-h-screen bg-white p-6">
      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New Course</h3>
              <button
                onClick={() => {
                  resetCourseForm();
                  setShowAddCourse(false);
                }}
                className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
              >
                ← Back
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Course Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="e.g., Python Automation Testing"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              {/* Auto-Generated Modules Preview */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Generated Course Content</label>
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 min-h-[240px] max-h-[400px] overflow-y-auto">
                  {generatedModules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                      <p className="italic">Enter a course name to see generated modules...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {generatedModules.map((module, moduleIndex) => (
                        <div key={moduleIndex} className="bg-white rounded-xl border border-blue-100 shadow-sm">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-t-xl">
                            <h5 className="font-bold flex items-center gap-2">
                              <span className="bg-white/20 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center text-sm">
                                {moduleIndex + 1}
                              </span>
                              {module.title}
                            </h5>
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {module.topics.map((topic, topicIndex) => (
                                <div key={topicIndex} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
                                  <span className="bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                    {topicIndex + 1}
                                  </span>
                                  <span className="truncate">{topic}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              {module.topics.length} topics
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center mt-8 border-t pt-5">
              <button
                onClick={() => {
                  resetCourseForm();
                  setShowAddCourse(false);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
              >
                Cancel
              </button>
              
              <button
                 onClick={addNewCourse}
                 disabled={!newCourseName.trim()}
                 className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed font-bold shadow-lg transform hover:scale-105 transition-all text-lg"
               >
                 Create Complete Course
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-gray-900 text-2xl font-bold">
          Courses
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (isSelectionMode && selectedForDeletion.length > 0) {
                removeSelectedCourses();
              } else {
                setIsSelectionMode(!isSelectionMode);
                setSelectedForDeletion([]);
              }
            }}
            className={`${isSelectionMode ? (selectedForDeletion.length > 0 ? 'bg-red-600 text-white' : 'bg-gray-800 text-white hover:bg-gray-900') : 'bg-red-600 text-white hover:bg-red-700'} px-6 py-3 rounded-lg transition-all font-bold shadow-lg flex items-center gap-2`}
          >
            {isSelectionMode ? (selectedForDeletion.length > 0 ? <FaTrash /> : <FaCheckCircle />) : <FaTrash />} 
            {isSelectionMode ? (selectedForDeletion.length > 0 ? `Remove (${selectedForDeletion.length})` : 'Exit Selection') : 'Remove'}
          </button>
          <button
            onClick={() => setShowAddCourse(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
          >
            + Add Course
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {courses.map((course, index) => {
          const Icon = course.icon;

          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
              onClick={() => handleViewDetails(course)}
            >
              {/* Course Header with Icon */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, white 0%, transparent 50%), 
                                     radial-gradient(circle at 80% 50%, white 0%, transparent 50%)`,
                    backgroundSize: '20px 20px'
                  }}></div>
                </div>
                
                {/* Course Icon */}
                <div className="relative z-10 flex justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                    <Icon className="text-white text-4xl" />
                  </div>
                </div>
                
                {/* Selection Overlay */}
                {isSelectionMode && (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCourseSelection(course.id);
                    }}
                    className="absolute top-3 right-3 z-20"
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedForDeletion.includes(course.id) 
                        ? 'bg-red-500 border-red-500' 
                        : 'bg-white/30 border-white'
                    }`}>
                      {selectedForDeletion.includes(course.id) && (
                        <FaCheckCircle className="text-white text-xs" />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Course Content */}
              <div className="p-6">
                {/* Course Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>

                {/* Course Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {course.level}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    {course.duration}
                  </span>
                </div>

                {/* Topics Count */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{course.topics?.length || 0}</span> topics
                  </p>
                </div>

                {/* Progress Bar */}
                {!course.locked && course.progress !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(course);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-sm font-semibold"
                  >
                    View Details
                  </button>
                  
                  {!isSelectionMode && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCourseSelection(course.id);
                      }}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FaTrash className="text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CoursesPage;
