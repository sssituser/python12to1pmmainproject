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
  FaPlay,
  FaTrash,
  FaEdit,
  FaCheckCircle
} from "react-icons/fa";

import { defaultCourses, getIconForCourse, generateTopicsForCourse } from '../components/CourseData';

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
  const [generatedTopics, setGeneratedTopics] = useState([]);
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
  
  // Load courses from localStorage on component mount
  useEffect(() => {
    const savedCourses = localStorage.getItem('courses');
    
    if (savedCourses) {
      try {
        const parsedCourses = JSON.parse(savedCourses);
        
        if (!parsedCourses || parsedCourses.length === 0) {
           setCourses(defaultCourses);
           localStorage.setItem('courses', JSON.stringify(defaultCourses));
           return;
        }

        const coursesWithIcons = parsedCourses.map(course => ({
          ...course,
          icon: getIconForCourse(course.title)
        }));
        setCourses(coursesWithIcons);
      } catch (error) {
        setCourses(defaultCourses);
        localStorage.setItem('courses', JSON.stringify(defaultCourses));
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

  const addNewCourse = () => {
    if (!newCourseName.trim() || manualTopicsList.length === 0) {
      return;
    }
    
    const topicsToUse = [...manualTopicsList];
    
    const newCourse = {
      id: courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1,
      title: newCourseName,
      icon: getIconForCourse(newCourseName),
      level: "Beginner",
      duration: "3 hrs",
      progress: 0,
      locked: false,
      topics: topicsToUse,
      customVideos: topicsToUse.reduce((acc, topic) => {
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
    
    // Add the new course to the courses array
    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    
    // Save to localStorage immediately
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    localStorage.setItem('facultyCourses', JSON.stringify(updatedCourses));
    
    // Clear form and reset state
    setNewCourseName("");
    setGeneratedTopics([]);
    setShowTopicPreview(false);
    setShowVideoOptions(false);
    setManualTopicsList([]);
    setManualTopicEntry("");
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
    setGeneratedTopics([]);
    setManualTopicsList([]);
    setManualTopicEntry("");
    setShowTopicPreview(false);
    setShowVideoOptions(false);
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

  const performRemoval = (idsToRemove) => {
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
                       if(e.target.files[0]) setNewTopicVidFile(URL.createObjectURL(e.target.files[0]));
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

        {/* Topics */}
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
                           if(e.target.files[0]) setEditTopicVidFile(URL.createObjectURL(e.target.files[0]));
                        }} />
                        <button onClick={() => saveChangeVideoOption(topic)} disabled={!editTopicVidFile} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-purple-700 hover:-translate-y-0.5 transition-all w-fit">Submit</button>
                      </div>
                    )}

                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-purple-100 rounded-lg transition">
                      <input type="radio" checked={editTopicVidOpt === 'link'} onChange={() => setEditTopicVidOpt('link')} name={`editVideoSource_${index}`} className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-800 font-medium">(ii) Paste your link here</span>
                    </label>
                    {editTopicVidOpt === 'link' && (
                      <div className="ml-8 mt-2 flex flex-col items-start gap-4 animate-fadeIn w-full">
                        <input type="url" placeholder="Paste video link here..." className="p-3 w-3/4 border border-purple-300 rounded bg-white shadow-sm" value={editTopicVidLink} onChange={(e) => setEditTopicVidLink(e.target.value)} />
                        <button onClick={() => saveChangeVideoOption(topic)} disabled={!editTopicVidLink.trim()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all w-fit">Submit</button>
                      </div>
                    )}


                  </div>
                </div>
              )}
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

              {/* Manual Topic Entry */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Topics Manually</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualTopicEntry}
                    onChange={(e) => setManualTopicEntry(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddManualTopic()}
                    placeholder="Enter topic name..."
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  <button
                    onClick={handleAddManualTopic}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
                  >
                    Add Topic
                  </button>
                </div>
              </div>

              {/* Topics List Display */}
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 min-h-[240px]">
                <h4 className="text-xl font-bold mb-4 text-gray-900">Course Content:</h4>
                {manualTopicsList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                    <p className="italic">Your topics will appear here...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {manualTopicsList.map((topic, index) => (
                      <div key={index} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-blue-600 text-white text-xs flex items-center justify-center rounded-full">
                              {index + 1}
                            </span>
                            <span className="text-gray-900 font-medium">{topic}</span>
                            {topicVideos[topic] && (
                              <span className="text-green-600 text-sm font-semibold">✓ Video Added</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setExpandedVideoTopic(expandedVideoTopic === topic ? null : topic)}
                              className="bg-purple-100 text-purple-600 hover:bg-purple-200 px-3 py-1 rounded text-sm font-semibold transition"
                              title="Add Video"
                            >
                              🎬 Add Video
                            </button>
                            <button 
                              onClick={() => removeManualTopic(index)}
                              className="text-red-500 hover:text-red-700 p-2 transition-colors"
                              title="Remove Topic"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>

                        {/* Video Addition Panel for Each Topic */}
                        {expandedVideoTopic === topic && (
                          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mt-3">
                            <h5 className="text-sm font-bold text-purple-900 mb-3">Add Video for "{topic}":</h5>
                            <div className="space-y-3">
                              {/* Upload Option */}
                              <div className="border-2 border-purple-300 rounded-lg p-3 hover:bg-purple-100/50 cursor-pointer transition">
                                <label className="flex items-center gap-3 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name={`videoOption_${index}`}
                                    checked={videoAddMode === `upload_${index}`}
                                    onChange={() => setVideoAddMode(`upload_${index}`)}
                                    className="w-4 h-4"
                                  />
                                  <span className="font-semibold text-gray-800">📤 Upload from PC</span>
                                </label>
                                {videoAddMode === `upload_${index}` && (
                                  <div className="mt-3 ml-7 flex flex-col gap-2">
                                    <input 
                                      type="file" 
                                      accept="video/*"
                                      onChange={(e) => {
                                        if(e.target.files[0]) {
                                          setVideoUploadFile(prev => ({
                                            ...prev,
                                            [topic]: URL.createObjectURL(e.target.files[0])
                                          }));
                                        }
                                      }}
                                      className="p-2 border border-purple-300 rounded bg-white text-sm"
                                    />
                                    <button 
                                      onClick={() => {
                                        if(videoUploadFile[topic]) {
                                          setTopicVideos(prev => ({
                                            ...prev,
                                            [topic]: { type: 'upload', url: videoUploadFile[topic] }
                                          }));
                                          setVideoAddMode(null);
                                          setVideoUploadFile(prev => ({ ...prev, [topic]: '' }));
                                        }
                                      }}
                                      disabled={!videoUploadFile[topic]}
                                      className="bg-purple-600 text-white px-3 py-2 rounded font-semibold text-sm hover:bg-purple-700 disabled:bg-gray-300 transition"
                                    >
                                      Add Upload
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Link Option */}
                              <div className="border-2 border-purple-300 rounded-lg p-3 hover:bg-purple-100/50 cursor-pointer transition">
                                <label className="flex items-center gap-3 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name={`videoOption_${index}`}
                                    checked={videoAddMode === `link_${index}`}
                                    onChange={() => setVideoAddMode(`link_${index}`)}
                                    className="w-4 h-4"
                                  />
                                  <span className="font-semibold text-gray-800">🔗 Paste Link</span>
                                </label>
                                {videoAddMode === `link_${index}` && (
                                  <div className="mt-3 ml-7 flex flex-col gap-2">
                                    <input 
                                      type="url"
                                      placeholder="Paste video link here..."
                                      value={videoUploadLink[topic] || ''}
                                      onChange={(e) => {
                                        setVideoUploadLink(prev => ({
                                          ...prev,
                                          [topic]: e.target.value
                                        }));
                                      }}
                                      className="p-2 border border-purple-300 rounded bg-white text-sm"
                                    />
                                    <button 
                                      onClick={() => {
                                        if(videoUploadLink[topic]) {
                                          setTopicVideos(prev => ({
                                            ...prev,
                                            [topic]: { type: 'link', url: videoUploadLink[topic] }
                                          }));
                                          setVideoAddMode(null);
                                          setVideoUploadLink(prev => ({ ...prev, [topic]: '' }));
                                        }
                                      }}
                                      disabled={!videoUploadLink[topic]?.trim()}
                                      className="bg-purple-600 text-white px-3 py-2 rounded font-semibold text-sm hover:bg-purple-700 disabled:bg-gray-300 transition"
                                    >
                                      Add Link
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
                disabled={!newCourseName.trim() || manualTopicsList.length === 0}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold shadow-lg transform hover:scale-105 transition-all text-lg"
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
              className="bg-white text-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 hover:scale-105 transition duration-300 relative overflow-hidden flex flex-col h-80"
            >
              {/* Selection overlay & Border */}
              {isSelectionMode && (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCourseSelection(course.id);
                  }}
                  className={`absolute inset-0 z-50 cursor-pointer transition-all duration-300 ${selectedForDeletion.includes(course.id) ? 'ring-4 ring-red-500 ring-inset rounded-xl bg-red-500/5' : 'hover:bg-black/5'}`}
                >
                  {selectedForDeletion.includes(course.id) ? (
                    <div className="absolute top-3 right-3 bg-red-600 text-white rounded-full p-1 shadow-lg animate-bounce z-[60]">
                      <FaCheckCircle className="text-xl" />
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 bg-red-50 text-red-300 rounded-full p-1 border border-red-100 z-[60]">
                      <FaCheckCircle className="text-xl" />
                    </div>
                  )}
                </div>
              )}

              {/* Background faded icon border */}
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
