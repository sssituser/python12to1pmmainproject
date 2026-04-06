import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  FaCheckCircle,
  FaPlus,
  FaLink,
  FaRegEdit
} from "react-icons/fa";
// import VideoPlayer from '../components/VideoPlayer'; // Temporarily disabled

import { defaultCourses, getIconForCourse, generateTopicsForCourse, generateModulesForCourse } from '../components/CourseData.jsx';

function CoursesPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  
  // Suppress all alerts on this page
  const originalAlert = window.alert;
  window.alert = function() { return; };
  
  const [selectedCourse, setSelectedCourse] = useState(() => {
    if (!courseId) return null;
    const facultySaved = localStorage.getItem('facultyCourses');
    const genericSaved = localStorage.getItem('courses');
    const saved = facultySaved || genericSaved;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.find(c => {
            const courseName = (typeof c === 'string' ? c : c.title).toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
            return courseName === courseId;
          });
        }
      } catch (e) { console.error(e); }
    }
    return null;
  });
  const [selectedSubject, setSelectedSubject] = useState(() => searchParams.get('subject'));
  const [newTopic, setNewTopic] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  // Disable auto-generation preview
  useEffect(() => {
    setGeneratedModules([]);
  }, [newCourseName]);

  useEffect(() => {
    setGeneratedModules([]);
  }, [newCourseName]);

  const [generatedModules, setGeneratedModules] = useState([]);
  const [showTopicPreview, setShowTopicPreview] = useState(false);
  const [showVideoOptions, setShowVideoOptions] = useState(false);
  const [showTopicVideoOptions, setShowTopicVideoOptions] = useState(false);
  const [editingVideoForTopic, setEditingVideoForTopic] = useState(null);
  // Initialize courses state from localStorage to prevent flickering on refresh
  const [courses, setCourses] = useState(() => {
    const facultySaved = localStorage.getItem('facultyCourses');
    const genericSaved = localStorage.getItem('courses');
    const saved = facultySaved || genericSaved;
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Initialize with icons AND calculate initial progress from disk
          return parsed.map(course => ({
            ...course,
            icon: getIconForCourse(typeof course === 'string' ? course : course.title)
          }));
        }
      } catch (e) {
        console.error("Error parsing initial courses:", e);
      }
    }
    return []; // Start empty only if no data at all
  });
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState([]);
  const isFirstRender = useRef(true);
  
  // State for manual topic management in new course
  const [manualTopicEntry, setManualTopicEntry] = useState("");
  const [manualTopicsList, setManualTopicsList] = useState([]);
  const [selectedModuleForTopics, setSelectedModuleForTopics] = useState("");
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
  const [showAddTopicForm, setShowAddTopicForm] = useState(false);

  // ---------------------------------------------------------
  // PROGRESS CALCULATION LOGIC
  // ---------------------------------------------------------
  const calculateCourseProgress = (allCourses) => {
    const watched = JSON.parse(localStorage.getItem('watchedTopics') || '{}');
    
    return allCourses.map(course => {
      let totalTopicsCount = 0;
      let watchedTopicsCount = 0;
      
      if (course.modules && Array.isArray(course.modules)) {
        course.modules.forEach(mod => {
          if (mod.topics && Array.isArray(mod.topics)) {
            mod.topics.forEach(topic => {
              totalTopicsCount++;
              const topicTitle = typeof topic === 'string' ? topic : topic.title;
              const key = `${course.title}-${topicTitle}`;
              if (watched[key]) watchedTopicsCount++;
            });
          }
        });
      } else if (course.topics && Array.isArray(course.topics)) {
        course.topics.forEach(topic => {
          totalTopicsCount++;
          const topicTitle = typeof topic === 'string' ? topic : topic.title;
          const key = `${course.title}-${topicTitle}`;
          if (watched[key]) watchedTopicsCount++;
        });
      }
      
      const progressValue = totalTopicsCount > 0 ? Math.round((watchedTopicsCount / totalTopicsCount) * 100) : 0;
      return { ...course, progress: progressValue };
    });
  };

  
  // Load courses from API dynamically on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('access');
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        
        // For faculty users, skip API call and use localStorage directly
        if (user.role === "faculty") {
          console.log("Faculty user detected - using localStorage only");
        } else if (token) {
          // For non-faculty users with token, try to fetch from API first
          const response = await fetch('http://127.0.0.1:8000/api/courses/', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const apiCourses = await response.json();
            
            // Transform API data to match frontend structure
            const coursesWithIcons = calculateCourseProgress(apiCourses).map(course => ({
              ...course,
              id: course.id,
              title: course.title,
              icon: getIconForCourse(course.title),
              level: course.level || 'Beginner',
              duration: course.duration || 'Self-paced',
              progress: course.progress || 0,
              locked: course.locked || false,
              topics: Array.isArray(course.topics) ? course.topics : [],
              modules: Array.isArray(course.modules) ? course.modules : [],
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

      // Fallback to local persistence: try facultyCourses first, then courses
      const facultySaved = localStorage.getItem('facultyCourses');
      const genericSaved = localStorage.getItem('courses');
      const savedCourses = facultySaved || genericSaved;
      
      if (savedCourses) {
        try {
          const parsedCourses = JSON.parse(savedCourses);
          
          if (!parsedCourses || parsedCourses.length === 0) {
             // If we have absolutely nothing, show defaults
             setCourses(defaultCourses);
             localStorage.setItem('facultyCourses', JSON.stringify(defaultCourses));
             return;
          }

          const coursesWithIcons = calculateCourseProgress(parsedCourses).map(course => ({
            ...course,
            icon: getIconForCourse(typeof course === 'string' ? course : course.title)
          }));
          setCourses(coursesWithIcons);
          // Sync facultyCourses to ensure it stays current
          localStorage.setItem('facultyCourses', JSON.stringify(coursesWithIcons));
        } catch (error) {
          console.error("LocalStorage fallback failed:", error);
          setCourses(defaultCourses);
        }
      } else {
        // First time visit - no cache at all
        setCourses(defaultCourses);
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
      const videoUrl = newTopicVidOpt === 'upload' ? newTopicVidFile : newTopicVidLink;
      
      const topicObj = {
        title: manualTopicEntry.trim(),
        video: videoUrl ? {
          type: newTopicVidOpt,
          url: videoUrl
        } : null
      };

      setManualTopicsList([...manualTopicsList, topicObj]);
      setManualTopicEntry("");
      // Reset video inputs for next topic
      setNewTopicVidFile("");
      setNewTopicVidLink("");
    }
  };

  const removeManualTopic = (index) => {
    setManualTopicsList(manualTopicsList.filter((_, i) => i !== index));
  };

  const addManualTopicsToCourse = () => {
    if (manualTopicsList.length === 0) return;
    
    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    if (courseIndex !== -1) {
      const updatedCourses = [...courses];
      
      // Add all manual topics to the course
      manualTopicsList.forEach(topicObj => {
        const topicTitle = typeof topicObj === 'string' ? topicObj : topicObj.title;
        const topicVideo = typeof topicObj === 'string' ? null : topicObj.video;

        if (!updatedCourses[courseIndex].topics.includes(topicTitle)) {
          updatedCourses[courseIndex].topics.push(topicTitle);
          
          if (topicVideo) {
            if (!updatedCourses[courseIndex].customVideos) {
              updatedCourses[courseIndex].customVideos = {};
            }
            updatedCourses[courseIndex].customVideos[topicTitle] = topicVideo;
          }
        }
      });
      
      // Update modules structure
      if (updatedCourses[courseIndex].modules && updatedCourses[courseIndex].modules.length > 0) {
        const targetModuleTitle = selectedModuleForTopics || updatedCourses[courseIndex].modules[0].title;
        const moduleIndex = updatedCourses[courseIndex].modules.findIndex(m => m.title === targetModuleTitle);
        
        if (moduleIndex !== -1) {
          manualTopicsList.forEach(topicObj => {
            const topicTitle = typeof topicObj === 'string' ? topicObj : topicObj.title;
            const topicVideo = typeof topicObj === 'string' ? null : topicObj.video;

            updatedCourses[courseIndex].modules[moduleIndex].topics.push({
              title: topicTitle,
              video: topicVideo ? topicVideo.url : null
            });
          });
        }
      }
      
      setCourses(updatedCourses);
      setSelectedCourse({...updatedCourses[courseIndex]});
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      localStorage.setItem('facultyCourses', JSON.stringify(updatedCourses));
      syncCourseToBackend(updatedCourses[courseIndex].id, updatedCourses);
      
      // Clear manual topics list and reset module selection
      setManualTopicsList([]);
      setManualTopicEntry("");
      setSelectedModuleForTopics("");
      
      console.log(`Added ${manualTopicsList.length} topics to course${selectedModuleForTopics ? ` in module: ${selectedModuleForTopics}` : ''}`);
    }
  };

  const addNewCourse = async () => {
    if (!newCourseName.trim()) {
      return;
    }
    
    // Generate modules with topics for the course
    const modules = generateModulesForCourse(newCourseName);
    
    // Flatten all topic titles for backward compatibility
    const allTopics = manualTopicsList.map(t => typeof t === 'string' ? t : t.title);

    // Build custom videos map
    const customVideos = {};
    manualTopicsList.forEach(t => {
      if (typeof t === 'object' && t.video) {
        customVideos[t.title] = t.video;
      }
    });
    
    const newCourse = {
      title: newCourseName,
      icon: getIconForCourse(newCourseName),
      level: "Beginner",
      duration: "Self-paced",
      progress: 0,
      locked: false,
      topics: allTopics, // Keep for backward compatibility
      modules: modules, // New structured modules
      custom_videos: customVideos
    };
    
    try {
      // Save to backend API
      const token = localStorage.getItem('access');
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (token && user.role !== "faculty") {
        // Only try API for non-faculty users
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
          // Use ID from backend response
          newCourse.id = savedCourse.id;
          console.log("Course saved to backend successfully");
        } else {
          const errorData = await response.json();
          console.error("Backend save failed:", errorData);
          // Still add to local state even if backend fails
        }
      } else {
        console.log("Faculty user - skipping backend API call");
      }
    } catch (error) {
      console.error("API save failed, using localStorage only:", error);
    }
    
    // Add to local state
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
    
    // Clear manual topic state
    setManualTopicsList([]);
    setManualTopicEntry("");
    setSelectedModuleForTopics("");
    
    // Navigate to newly created course topics page after a short delay
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
    
    // Clear manual topic state
    setManualTopicsList([]);
    setManualTopicEntry("");
    setSelectedModuleForTopics("");
    setSelectedSubject(null);
    setNewSubject("");
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
      syncCourseToBackend(updatedCourses[courseIndex].id, updatedCourses);
    }
    setEditingVideoForTopic(null);
    setEditTopicVidOpt('upload');
    setEditTopicVidFile('');
    setEditTopicVidLink('');
  };

  // Add Subject
  const addSubject = () => {
    if (!newSubject.trim()) return;
    
    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    if (courseIndex !== -1) {
      const updatedCourses = [...courses];
      if (!updatedCourses[courseIndex].modules) updatedCourses[courseIndex].modules = [];
      
      const subjectExists = updatedCourses[courseIndex].modules.some(m => m.title.toLowerCase() === newSubject.toLowerCase());
      if (!subjectExists) {
        updatedCourses[courseIndex].modules.push({
          title: newSubject.trim(),
          topics: []
        });
        
        setCourses(updatedCourses);
        setSelectedCourse({...updatedCourses[courseIndex]});
        localStorage.setItem('courses', JSON.stringify(updatedCourses));
        localStorage.setItem('facultyCourses', JSON.stringify(updatedCourses));
        syncCourseToBackend(updatedCourses[courseIndex].id, updatedCourses);
      }
    }
    setNewSubject("");
  };

  // Remove Subject
  const removeSubject = (subjectTitle) => {
    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    if (courseIndex !== -1) {
      const updatedCourses = [...courses];
      updatedCourses[courseIndex].modules = updatedCourses[courseIndex].modules.filter(m => m.title !== subjectTitle);
      
      setCourses(updatedCourses);
      setSelectedCourse({...updatedCourses[courseIndex]});
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      localStorage.setItem('facultyCourses', JSON.stringify(updatedCourses));
      syncCourseToBackend(updatedCourses[courseIndex].id, updatedCourses);
    }
  };

  // Add Topic
  const addTopic = () => {
    if (!newTopic.trim() || !selectedSubject) return;

    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    if (courseIndex !== -1) {
      const updatedCourses = [...courses];
      const moduleIndex = updatedCourses[courseIndex].modules.findIndex(m => m.title === selectedSubject);
      
      if (moduleIndex !== -1) {
        const topicObj = {
          title: newTopic,
          video: null
        };

        const videoUrl = newTopicVidOpt === 'upload' ? newTopicVidFile : newTopicVidLink;
        if (videoUrl) {
          topicObj.video = videoUrl;
          if (!updatedCourses[courseIndex].customVideos) updatedCourses[courseIndex].customVideos = {};
          updatedCourses[courseIndex].customVideos[newTopic] = {
            type: newTopicVidOpt,
            url: videoUrl
          };
        }

        updatedCourses[courseIndex].modules[moduleIndex].topics.push(topicObj);
        // Also update flat topics array for backward compatibility
        if (!updatedCourses[courseIndex].topics) updatedCourses[courseIndex].topics = [];
        updatedCourses[courseIndex].topics.push(newTopic);
        
        setCourses(updatedCourses);
        setSelectedCourse({...updatedCourses[courseIndex]});
        localStorage.setItem('courses', JSON.stringify(updatedCourses));
        localStorage.setItem('facultyCourses', JSON.stringify(updatedCourses));
        syncCourseToBackend(updatedCourses[courseIndex].id, updatedCourses);
      }
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
      
      if (token && user.role !== "faculty") {
        // Only try API for non-faculty users
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
      } else {
        console.log("Faculty user - skipping backend API deletion");
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
    if (!selectedSubject) return;
    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    if (courseIndex !== -1) {
      const updatedCourses = [...courses];
      
      // Update Module topics
      const moduleIndex = updatedCourses[courseIndex].modules.findIndex(m => m.title === selectedSubject);
      if (moduleIndex !== -1) {
        updatedCourses[courseIndex].modules[moduleIndex].topics = updatedCourses[courseIndex].modules[moduleIndex].topics.filter(
          t => (typeof t === 'string' ? t : t.title) !== topicToRemove
        );
      }

      // Update flat topics for backward compatibility
      if (updatedCourses[courseIndex].topics) {
        updatedCourses[courseIndex].topics = updatedCourses[courseIndex].topics.filter(
          topic => topic !== topicToRemove
        );
      }

      setCourses(updatedCourses);
      setSelectedCourse({...updatedCourses[courseIndex]});
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      localStorage.setItem('facultyCourses', JSON.stringify(updatedCourses));
      syncCourseToBackend(updatedCourses[courseIndex].id, updatedCourses);
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
      syncCourseToBackend(updatedCourses[courseIndex].id, updatedCourses);
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
    setSelectedSubject(null);
    navigate('/faculty/Course');
  };

  const syncCourseToBackend = async (courseId, updatedCourses) => {
    const courseToSync = updatedCourses.find(c => c.id === courseId);
    if (!courseToSync) return;

    try {
      const token = localStorage.getItem('access');
      if (token && courseToSync.id && typeof courseToSync.id === 'number') {
        const payload = {
          title: courseToSync.title,
          level: courseToSync.level,
          duration: courseToSync.duration,
          topics: courseToSync.topics,
          modules: courseToSync.modules,
          custom_videos: courseToSync.customVideos || {},
          progress: courseToSync.progress
        };

        const response = await fetch(`http://127.0.0.1:8000/api/courses/${courseToSync.id}/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          console.log(`Course ${courseToSync.title} synced with backend`);
        } else {
          console.error(`Sync failed: ${response.status}`);
        }
      }
    } catch (error) {
      console.error("Backend sync failed:", error);
    }
  };

  // Handle Watch Click
  const handleWatchClick = (courseTitle, topic) => {
    // 1. Mark as watched and update progress locally
    const watched = JSON.parse(localStorage.getItem('watchedTopics') || '{}');
    watched[`${courseTitle}-${topic}`] = true;
    localStorage.setItem('watchedTopics', JSON.stringify(watched));
    
    // Recalculate progress for UI immediately
    setCourses(prev => calculateCourseProgress(prev));
    if (selectedCourse && selectedCourse.title === courseTitle) {
      setSelectedCourse(prev => calculateCourseProgress([prev])[0]);
    }

    // 2. Original navigation logic
    const course = courses.find(c => c.title === courseTitle);
    if (course && course.customVideos && course.customVideos[topic]) {
      localStorage.setItem('currentCustomVideo', JSON.stringify(course.customVideos[topic]));
    } else {
      localStorage.removeItem('currentCustomVideo');
    }
    const subjectParam = selectedSubject ? `?subject=${encodeURIComponent(selectedSubject)}` : '';
    navigate(`/video/${encodeURIComponent(courseTitle)}/${encodeURIComponent(topic)}${subjectParam}`);
  };

  // =========================
  // SINGLE COURSE VIEW
  // =========================
  if (selectedCourse) {
    return (
      <div className="container-fluid bg-light min-vh-100 px-0 shadow-none">
        <div className="container-fluid px-0">
          {/* Header Row */}
          <div className="row align-items-center mb-0 border-bottom bg-white p-3 mx-0">
            <div className="col">
              {/* Empty space where title was */}
            </div>
            <div className="col-auto">
              <div className="d-flex gap-2">
                {selectedSubject ? (
                  <>
                    <button onClick={() => setShowAddTopicForm(!showAddTopicForm)} className="btn btn-success px-4 fw-bold shadow-sm">
                      + Add Topic
                    </button>
                    <button onClick={() => setSelectedSubject(null)} className="btn btn-outline-secondary px-4 fw-bold">
                      ← Back
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleBackToTopics()} className="btn btn-outline-secondary px-4 fw-bold">
                    ← Back
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* LEVEL 2: SUBJECTS LIST */}
          {!selectedSubject ? (
            <div className="row g-4">
              <div className="col-12 mb-4">
                <div className="card border-0 shadow-sm rounded-4 overlay-hidden" style={{background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)'}}>
                  <div className="card-body p-5 text-white">
                    <h3 className="fw-bold mb-4">Add New Subject</h3>
                    <div className="row g-3">
                      <div className="col-md-9">
                        <input
                          type="text"
                          className="form-control form-control-lg border-0 shadow-sm"
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                        />
                      </div>
                      <div className="col-md-3">
                        <button className="btn btn-white btn-lg w-100 fw-bold shadow" style={{backgroundColor: 'white', color: '#C850C0'}} onClick={addSubject} disabled={!newSubject.trim()}>
                          + Add Subject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              <div className="col-12">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                  <div className="list-group list-group-flush">
                    {selectedCourse.modules?.map((module, index) => (
                      <div key={index} className="list-group-item p-4 d-flex align-items-center justify-content-between hover-bg-light transition-all border-bottom border-light">
                        <div className="d-flex align-items-center gap-4">
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px', minWidth: '40px'}}>
                            {index + 1}
                          </div>
                          <div>
                            <h5 className="mb-0 fw-bold text-dark">{module.title}</h5>
                          </div>
                        </div>
                        <div className="d-flex gap-3 align-items-center">
                          <button onClick={() => setSelectedSubject(module.title)} className="btn btn-outline-primary rounded-pill px-4 fw-bold">
                            Go to Topics
                          </button>
                          <button onClick={() => removeSubject(module.title)} className="btn btn-outline-danger rounded-circle p-2" title="Delete Subject">
                            <FaTrash size={14}/>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {(!selectedCourse.modules || selectedCourse.modules.length === 0) && (
                <div className="col-12 py-5 text-center bg-white rounded-4 shadow-sm border border-dashed">
                  <span className="display-1 opacity-25">📂</span>
                  <p className="fw-bold text-secondary mt-3">No subjects defined for this course yet.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="row g-4">
              <div className="col-12">
                {showAddTopicForm && (
                  <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                    <div className="card-body p-4 bg-light">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="fw-bold text-dark mb-0">+ Create New Topic</h5>
                        <button className="btn-close" onClick={() => setShowAddTopicForm(false)}></button>
                      </div>
                      
                      <div className="row g-4">
                        <div className="col-12">
                          <label className="form-label fw-bold text-secondary text-uppercase small ls-1">Topic Name</label>
                          <input type="text" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="" className="form-control form-control-lg border-0 shadow-inner" />
                        </div>

                        {newTopic.trim().length > 0 && !showTopicVideoOptions && (
                          <div className="col-12 text-center py-3">
                            <button onClick={() => setShowTopicVideoOptions(true)} className="btn btn-outline-primary btn-lg rounded-pill px-5 fw-bold shadow-sm transition-all border-2">
                              🎥 Add Video Content
                            </button>
                            <div className="mt-3">
                               <button className="btn btn-link text-secondary fw-bold" onClick={addTopic}>Skip video and Save Topic</button>
                            </div>
                          </div>
                        )}

                        {(showTopicVideoOptions || !newTopic.trim()) && newTopic.trim().length > 0 && (
                          <div className="col-12 animate__animated animate__fadeIn">
                            <div className="bg-white rounded-4 p-4 shadow-sm border border-light">
                              <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                                <h6 className="fw-bold mb-0">Select Video Source</h6>
                                <button className="btn btn-sm btn-link text-danger p-0" onClick={() => setShowTopicVideoOptions(false)}>Cancel Video</button>
                              </div>
                              
                              <div className="row g-4">
                                <div className="col-md-5">
                                  <div className={`cursor-pointer p-4 rounded-4 border-2 text-center transition-all h-100 ${newTopicVidOpt === 'upload' ? 'border-primary bg-primary-subtle' : 'border-light bg-light'}`} onClick={() => setNewTopicVidOpt('upload')}>
                                    <div className="display-6 mb-2">💻</div>
                                    <h6 className="fw-bold mb-1">Upload from PC</h6>
                                    <p className="small text-muted mb-0">Choose a local MP4 file</p>
                                  </div>
                                </div>
                                <div className="col-md-2 d-flex align-items-center justify-content-center">
                                  <span className="fw-bold text-secondary">OR</span>
                                </div>
                                <div className="col-md-5">
                                  <div className={`cursor-pointer p-4 rounded-4 border-2 text-center transition-all h-100 ${newTopicVidOpt === 'link' ? 'border-primary bg-primary-subtle' : 'border-light bg-light'}`} onClick={() => setNewTopicVidOpt('link')}>
                                    <div className="display-6 mb-2">🔗</div>
                                    <h6 className="fw-bold mb-1">Paste Link</h6>
                                    <p className="small text-muted mb-0">YouTube / URL links</p>
                                  </div>
                                </div>
                                
                                <div className="col-12 mt-4 px-3">
                                  {newTopicVidOpt === 'upload' ? (
                                    <div className="d-flex flex-column gap-3">
                                      <input type="file" className="form-control form-control-lg border-2" accept="video/*" onChange={(e) => {
                                        const file = e.target.files[0];
                                        if(file) setNewTopicVidFile(URL.createObjectURL(file));
                                      }} />
                                      <button className="btn btn-primary btn-lg fw-bold shadow mt-2" onClick={() => {
                                        addTopic();
                                        setShowAddTopicForm(false);
                                        setShowTopicVideoOptions(false);
                                      }} disabled={!newTopicVidFile}>
                                        Save Topic with File
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="d-flex flex-column gap-3">
                                      <input type="url" value={newTopicVidLink} onChange={(e) => setNewTopicVidLink(e.target.value)} placeholder="" className="form-control form-control-lg border-2" />
                                      <button className="btn btn-primary btn-lg fw-bold shadow mt-2" onClick={() => {
                                        addTopic();
                                        setShowAddTopicForm(false);
                                        setShowTopicVideoOptions(false);
                                      }} disabled={!newTopicVidLink}>
                                        Save Topic with Link
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* EDIT VIDEO MODAL */}
                {editingVideoForTopic && (
                  <div className="card border-0 shadow-sm rounded-4 mb-5 overflow-hidden animate__animated animate__fadeIn">
                    <div className="card-body p-4 bg-light border-bottom">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="fw-bold text-dark mb-0">🔧 Edit Video for "{editingVideoForTopic}"</h5>
                        <button className="btn-close" onClick={() => setEditingVideoForTopic(null)}></button>
                      </div>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-bold small text-secondary mb-2">Video Source</label>
                          <div className="btn-group w-100 mb-3 shadow-sm">
                            <button className={`btn fw-bold ${editTopicVidOpt === 'upload' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setEditTopicVidOpt('upload')}>📁 Upload File</button>
                            <button className={`btn fw-bold ${editTopicVidOpt === 'link' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setEditTopicVidOpt('link')}>🔗 URL Link</button>
                          </div>
                          {editTopicVidOpt === 'upload' ? (
                            <input type="file" className="form-control" onChange={(e) => {
                              const file = e.target.files[0];
                              if(file) setEditTopicVidFile(URL.createObjectURL(file));
                            }} />
                          ) : (
                            <input type="url" value={editTopicVidLink} onChange={(e) => setEditTopicVidLink(e.target.value)} placeholder="https://youtube.com/..." className="form-control" />
                          )}
                        </div>
                        <div className="col-md-6 d-flex align-items-end">
                           <button className="btn btn-primary btn-lg w-100 fw-bold shadow-sm py-3" onClick={() => saveChangeVideoOption(editingVideoForTopic)}>✔️ Save Changes</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="list-group list-group-flush bg-transparent">
                  {((selectedCourse.modules || []).find(m => m.title === selectedSubject)?.topics || []).map((topic, idx) => {
                    const topicTitle = typeof topic === 'string' ? topic : topic.title;
                    return (
                      <div key={idx} className="list-group-item bg-transparent border-0 d-flex justify-content-between align-items-center py-3 px-0 border-bottom border-light hover-bg-light transition-all rounded-3 px-2 mb-1">
                        <div className="fs-5 d-flex align-items-center gap-2">
                          <span className="text-secondary fw-bold" style={{minWidth: '20px'}}>{idx + 1}.</span>
                          <span className="fw-bold text-dark">{topicTitle}</span>
                        </div>
                        <div className="d-flex gap-4 align-items-center">
                          <button onClick={() => handleWatchClick(selectedCourse.title, topicTitle)} className="btn btn-link text-primary p-0 d-flex align-items-center justify-content-center hover-scale transition-all" style={{width: '32px', height: '32px'}} title="Play Video">
                            <FaPlay size={18}/>
                          </button>
                          <button onClick={() => setEditingVideoForTopic(topicTitle)} className="btn btn-link text-warning p-0 d-flex align-items-center justify-content-center hover-scale transition-all" style={{width: '32px', height: '32px'}} title="Edit Video">
                            <FaRegEdit size={18}/>
                          </button>
                          <button onClick={() => removeTopic(topicTitle)} className="btn btn-link text-danger p-0 d-flex align-items-center justify-content-center hover-scale transition-all" style={{width: '32px', height: '32px'}} title="Delete Topic">
                            <FaTrash size={18}/>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {((selectedCourse.modules || []).find(m => m.title === selectedSubject)?.topics || []).length === 0 && (
                    <div className="py-5 text-center text-muted">
                      <p className="mb-0 fs-5 opacity-75">No topics recorded for this subject yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-5 bg-light min-vh-100">
      {/* BOOTSTRAP MODAL FOR NEW COURSE */}
      {showAddCourse && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white border-0 py-4 px-5">
                <h4 className="modal-title fw-bold">Manual Course Creator</h4>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddCourse(false)}></button>
              </div>
              <div className="modal-body p-5">
                <div className="mb-4 pb-4 border-bottom">
                  <label className="form-label text-muted fw-bold small">Course Main Heading</label>
                  <input
                    type="text"
                    className="form-control form-control-lg border-2 border-primary-subtle"
                    placeholder="e.g. Master Python Programming"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                   <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                     <span className="badge bg-primary rounded-circle">1</span> Add Initial Topics
                   </h5>
                   <div className="input-group input-group-lg shadow-sm">
                      <input
                        type="text"
                        className="form-control bg-light border-0"
                        placeholder="Topic Title..."
                        value={manualTopicEntry}
                        onChange={(e) => setManualTopicEntry(e.target.value)}
                      />
                      <button className="btn btn-primary fw-bold" onClick={handleAddManualTopic}>Add to List</button>
                   </div>
                </div>

                <div className="bg-light rounded-4 p-4 mb-4 border border-2 border-dashed">
                   <p className="text-muted small fw-bold border-bottom pb-2 mb-3">Topic Roadmap Preview:</p>
                   {manualTopicsList.length > 0 ? (
                     <div className="list-group gap-2">
                        {manualTopicsList.map((t, i) => (
                           <div key={i} className="list-group-item border-0 shadow-sm rounded-3 d-flex justify-content-between align-items-center p-3 animate-in slide-in-from-right-2">
                              <span className="fw-bold">{i+1}. {t.title}</span>
                              <button onClick={() => removeManualTopic(i)} className="btn btn-link text-danger p-0"><FaTrash size={12}/></button>
                           </div>
                        ))}
                     </div>
                   ) : (
                     <p className="text-center py-3 text-secondary italic small">Start adding topics above to define your course syllabus.</p>
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
                disabled={!newCourseName.trim() || manualTopicsList.length === 0}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold shadow-lg transform hover:scale-105 transition-all text-lg"
              >
                Create Complete Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN DASHBOARD */}
      <div className="container">
        <div className="row align-items-center mb-5 pb-5 border-bottom">
          <div className="col">
            <h1 className="display-6 fw-bold text-dark mb-1">Course Administration</h1>
          </div>
          <div className="col-auto">
             <div className="d-flex gap-3">
               <button className={`btn btn-lg fw-bold rounded-pill px-4 shadow-sm ${isSelectionMode ? 'btn-danger' : 'btn-outline-dark'}`} onClick={() => setIsSelectionMode(!isSelectionMode)}>
                 {isSelectionMode ? 'Stop Selection' : 'Select for Removal'}
               </button>
               <button className="btn btn-primary btn-lg fw-bold rounded-pill px-5 shadow-lg" onClick={() => setShowAddCourse(true)}>
                 + Add Course
               </button>
             </div>
          </div>
        </div>

        {isSelectionMode && selectedForDeletion.length > 0 && (
          <div className="alert alert-danger rounded-4 shadow-sm p-4 mb-5 border-0 d-flex justify-content-between align-items-center">
             <div className="fw-bold fs-5"><FaTrash className="me-2"/> {selectedForDeletion.length} courses about to be purged</div>
             <button onClick={removeSelectedCourses} className="btn btn-danger btn-lg rounded-pill px-5 fw-bold shadow">Apply Delete</button>
          </div>
        )}

        <div className="row g-4">
          {courses.map((course, index) => {
            const Icon = course.icon;
            return (
              <div key={index} className="col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 border-0 shadow-sm rounded-5 overflow-hidden card-hover">
                  <div className="card-header border-0 bg-primary-gradient p-5 d-flex align-items-center justify-content-center h-50 relative" style={{background: 'linear-gradient(45deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)', height: '180px'}}>
                     <div className="p-3 bg-white bg-opacity-25 rounded-circle shadow-inner">
                        <Icon size={48} className="text-white"/>
                     </div>
                     {isSelectionMode && (
                        <div 
                          className="position-absolute top-0 end-0 p-3" 
                          onClick={(e) => { e.stopPropagation(); toggleCourseSelection(course.id); }}
                        >
                           <div className={`rounded-circle border-3 border-white transition-all ${selectedForDeletion.includes(course.id) ? 'bg-danger p-1' : 'bg-transparent overflow-hidden'}`} style={{width: '30px', height: '30px'}}>
                              {selectedForDeletion.includes(course.id) && <FaCheckCircle className="text-white w-100 h-100"/>}
                           </div>
                        </div>
                     )}
                  </div>
                  <div className="card-body p-4 d-flex flex-column" style={{minHeight: '260px'}}>
                    <h5 className="card-title fw-bold text-dark mb-2 h-25 text-uppercase" style={{maxHeight: '60px', overflow: 'hidden'}}>{course.title}</h5>
                    
                    <div className="mt-4 mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-secondary small fw-bold">Progress</span>
                        <span className="text-secondary small fw-bold">{course.progress || 0}%</span>
                      </div>
                      <div className="progress overflow-visible" style={{height: '6px', backgroundColor: '#f0f0f0'}}>
                        <div 
                           className="progress-bar rounded-pill shadow-sm" 
                           role="progressbar" 
                           style={{
                             width: `${course.progress || 0}%`, 
                             background: 'linear-gradient(90deg, #4158D0 0%, #C850C0 100%)'
                           }}
                        ></div>
                      </div>
                    </div>

                    <button className="btn btn-outline-primary btn-lg w-100 rounded-pill mt-auto fw-bold" onClick={(e) => {e.stopPropagation(); handleViewDetails(course);}}>View Details</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CoursesPage;
