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
  FaAndroid,
  FaPlay,
  FaTrash,
  FaEdit
} from "react-icons/fa";

import { defaultCourses, getIconForCourse, generateTopicsForCourse } from '../components/CourseData';

function CoursesPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
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

  // Form states specifically for dynamic video configurations
  const [newCourseTopicsConfig, setNewCourseTopicsConfig] = useState({});
  const handleUpdateTopicConfig = (topic, type, value) => {
    setNewCourseTopicsConfig(prev => ({ ...prev, [topic]: { type, value } }));
  };

  const [newTopicVidOpt, setNewTopicVidOpt] = useState('generate');
  const [newTopicVidFile, setNewTopicVidFile] = useState('');
  const [newTopicVidLink, setNewTopicVidLink] = useState('');

  const [editTopicVidOpt, setEditTopicVidOpt] = useState('generate');
  const [editTopicVidFile, setEditTopicVidFile] = useState('');
  const [editTopicVidLink, setEditTopicVidLink] = useState('');
  
  // Load courses from localStorage on component mount
  useEffect(() => {
    console.log('=== LOADING COURSES FROM LOCALSTORAGE ===');
    const savedCourses = localStorage.getItem('courses');
    console.log('Saved courses from localStorage:', savedCourses);
    
    if (savedCourses) {
      try {
        const parsedCourses = JSON.parse(savedCourses);
        console.log('Parsed courses:', parsedCourses);
        
        // Load parsed courses precisely as they were saved to preserve custom-added topics
        const updatedCourses = parsedCourses;
        
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
    setShowVideoOptions(false);
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
      topics: generatedTopics,
      customVideos: generatedTopics.reduce((acc, topic) => {
        const config = newCourseTopicsConfig[topic] || { type: 'generate', value: '' };
        if (config.type !== 'generate') {
          acc[topic] = {
            type: config.type,
            url: config.value
          };
        }
        return acc;
      }, {})
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
    setShowVideoOptions(false);
    setNewCourseTopicsConfig({});
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
    setShowVideoOptions(false);
    setNewCourseVidOpt('generate');
    setNewCourseVidFile('');
    setNewCourseVidLink('');
  };

  // Handle explicit saving of custom changed videos per topic dynamically
  const saveChangeVideoOption = (topic) => {
    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    if (courseIndex !== -1) {
      const updatedCourses = [...courses];
      if (!updatedCourses[courseIndex].customVideos) updatedCourses[courseIndex].customVideos = {};
      
      if (editTopicVidOpt !== 'generate') {
        updatedCourses[courseIndex].customVideos[topic] = {
          type: editTopicVidOpt,
          url: editTopicVidOpt === 'upload' ? editTopicVidFile : editTopicVidLink
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
    setEditTopicVidOpt('generate');
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
      if (newTopicVidOpt !== 'generate') {
         updatedCourses[courseIndex].customVideos[newTopic] = {
            type: newTopicVidOpt,
            url: newTopicVidOpt === 'upload' ? newTopicVidFile : newTopicVidLink
         };
      }
      
      setCourses(updatedCourses);
      setSelectedCourse({...updatedCourses[courseIndex]});
      
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      localStorage.setItem('facultyCourses', JSON.stringify(updatedCourses));
    }

    setNewTopic("");
    setShowTopicVideoOptions(false);
    setNewTopicVidOpt('generate');
    setNewTopicVidFile('');
    setNewTopicVidLink('');
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

          <button
            onClick={handleBackToTopics}
            className="text-blue-600 hover:underline"
          >
            ← Back 
          </button>
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

                <div className="p-3 border-2 border-green-500 bg-green-50 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">RECOMMENDED</div>
                  <label className="flex items-center gap-3 cursor-pointer p-1">
                    <input type="radio" checked={newTopicVidOpt === 'generate'} onChange={() => setNewTopicVidOpt('generate')} name="topicVideoSource" className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-bold text-lg">(iii) generate videos</span>
                  </label>
                  {newTopicVidOpt === 'generate' && (
                    <div className="ml-8 mt-2 animate-fadeIn">
                      <button onClick={addTopic} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-green-700 hover:-translate-y-0.5 transition-all w-fit">Submit</button>
                    </div>
                  )}

                </div>
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

                    <div className="p-3 border-2 border-green-500 bg-green-50 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">RECOMMENDED</div>
                      <label className="flex items-center gap-3 cursor-pointer p-1">
                        <input type="radio" checked={editTopicVidOpt === 'generate'} onChange={() => setEditTopicVidOpt('generate')} name={`editVideoSource_${index}`} className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-bold text-lg">(iii) generate videos</span>
                      </label>
                      {editTopicVidOpt === 'generate' && (
                        <div className="ml-8 mt-2 animate-fadeIn">
                          <button onClick={() => saveChangeVideoOption(topic)} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-green-700 hover:-translate-y-0.5 transition-all w-fit">Submit</button>
                        </div>
                      )}
                    </div>
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
                    setShowVideoOptions(false);
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
                    These topics will be added to your course. Click "Add videos" to configure playback.
                  </p>
                </div>
              )}

              {/* Video Source Configuration Panel Per Topic */}
              {showTopicPreview && generatedTopics.length > 0 && showVideoOptions && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-5 mt-4 transition-all animate-fadeIn space-y-6 max-h-96 overflow-y-auto shadow-inner">

                  {generatedTopics.map((topic, index) => {
                    const currentConfig = newCourseTopicsConfig[topic] || { type: 'generate', value: '' };

                    return (
                      <div key={index} className="bg-white p-5 rounded-xl shadow-md border border-purple-100 flex flex-col gap-4">
                        <p className="font-bold text-gray-900 border-b pb-2 text-lg">{index + 1}. {topic}</p>
                        
                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-purple-100 rounded-lg transition">
                          <input type="radio" checked={currentConfig.type === 'upload'} onChange={() => handleUpdateTopicConfig(topic, 'upload', '')} name={`videoSource_${index}`} className="w-5 h-5 text-purple-600" />
                          <span className="text-gray-800 font-medium">(i) Upload video from PC</span>
                        </label>
                        {currentConfig.type === 'upload' && (
                          <div className="ml-8 mt-2 flex flex-col items-start gap-4 animate-fadeIn">
                            <input type="file" accept="video/*" className="p-2 border border-purple-300 rounded bg-white shadow-sm" onChange={(e) => {
                               if(e.target.files[0]) handleUpdateTopicConfig(topic, 'upload', URL.createObjectURL(e.target.files[0]));
                            }} />
                            <button onClick={() => alert(`Configured option (i) properly for "${topic}"! Please submit the entire course when finished.`)} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-purple-700 hover:-translate-y-0.5 transition-all w-fit">Submit</button>
                          </div>
                        )}

                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-purple-100 rounded-lg transition">
                          <input type="radio" checked={currentConfig.type === 'link'} onChange={() => handleUpdateTopicConfig(topic, 'link', '')} name={`videoSource_${index}`} className="w-5 h-5 text-purple-600" />
                          <span className="text-gray-800 font-medium">(ii) Paste your link here</span>
                        </label>
                        {currentConfig.type === 'link' && (
                          <div className="ml-8 mt-2 flex flex-col items-start gap-4 animate-fadeIn w-full">
                            <input type="url" placeholder="Paste video link here..." className="p-3 w-3/4 border border-purple-300 rounded bg-white shadow-sm" value={currentConfig.value} onChange={(e) => handleUpdateTopicConfig(topic, 'link', e.target.value)} />
                            <button onClick={() => alert(`Configured option (ii) properly for "${topic}"! Please submit the entire course when finished.`)} disabled={!currentConfig.value.trim()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all w-fit">Submit</button>
                          </div>
                        )}

                        <div className="p-3 border-2 border-green-500 bg-green-50 rounded-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">RECOMMENDED</div>
                          <label className="flex items-center gap-3 cursor-pointer p-1">
                            <input type="radio" checked={currentConfig.type === 'generate'} onChange={() => handleUpdateTopicConfig(topic, 'generate', '')} name={`videoSource_${index}`} className="w-5 h-5 text-green-600" />
                            <span className="text-green-800 font-bold text-lg">(iii) generate videos</span>
                          </label>
                          {currentConfig.type === 'generate' && (
                            <div className="ml-8 mt-2 animate-fadeIn">
                              <button onClick={() => alert(`Configured option (iii) properly for "${topic}"! Please submit the entire course when finished.`)} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-green-700 hover:-translate-y-0.5 transition-all w-fit">Submit</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-6 border-t pt-5">
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
                  className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow"
                >
                  Generate Topics
                </button>
                <button
                  onClick={() => setShowVideoOptions(true)}
                  disabled={generatedTopics.length === 0}
                  className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow transition-all duration-300"
                >
                  Add videos
                </button>
                <button
                  onClick={addNewCourse}
                  disabled={generatedTopics.length === 0}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-lg text-lg transform hover:scale-105 transition-all"
                >
                  Create Complete Course
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
