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



import { defaultCourses, getIconForCourse, generateTopicsForCourse, generateModulesForCourse, industryCourses } from '../components/CourseData.jsx';



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

    

    // 🚀 UNIFIED 1000% FORCE SYNC SYSTEM

    // 🛡️ 1000% Absolute Force Sync with Industrial Curriculum
    const finalMerge = [...defaultCourses];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const savedMap = new Map(parsed.map(c => [(typeof c === "string" ? c : (c.title || "")).toUpperCase(), c]));
        const standardSet = new Set(industryCourses.map(t => t.toUpperCase()));
        industryCourses.forEach((title, idx) => {
          if (savedMap.has(title.toUpperCase())) finalMerge[idx] = { ...savedMap.get(title.toUpperCase()), icon: getIconForCourse(title) };
        });
        parsed.forEach(c => {
          const title = typeof c === "string" ? c : (c.title || "");
          if (title && !standardSet.has(title.toUpperCase())) {
            const custom = typeof c === "string" ? {title: c} : c;
            finalMerge.push({ ...custom, icon: getIconForCourse(title) });
          }
        });
      } catch(e) {}
    }
    return finalMerge;

  });

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");


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
  const [isVideoSubmitted, setIsVideoSubmitted] = useState(false);

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
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [playingTopic, setPlayingTopic] = useState(null);



  // Sync courses with backend on mount to ensure all devices see the same curriculum

  useEffect(() => {

    const fetchCoursesFromAPI = async () => {

      const token = localStorage.getItem('access');

      if (!token) return;



      try {

        const response = await fetch(`http://${window.location.hostname}:8000/api/courses/`, {

          headers: {

            'Authorization': `Bearer ${token.replace(/^"|"$/g, "")}`

          }

        });

        

        if (response.ok) {

          const data = await response.json();

          // Handle DRF ViewSet variations: paginated (.results), wrapped (.data.success), or raw array

          // 🚀 1000% ROBUST PARSING (Matches Registration page exactly)
          const rawCourses = data.data || data.results || (Array.isArray(data) ? data : []);

          

          if (rawCourses !== null) {
            const localSaved = localStorage.getItem('facultyCourses') || localStorage.getItem('courses');
            let localData = [];
            try { if(localSaved) localData = JSON.parse(localSaved); } catch(e){}

            // 🛡️ 1000% ROBUST SYNC LOGIC
            const apiTitles = new Set(rawCourses.map(c => (typeof c === 'string' ? c : (c.title || "")).toUpperCase()));
            const standardTitles = new Set(industryCourses.map(t => t.toUpperCase()));
            
            // 🛡️ PERMANENT PURGE: Remove 'hi' from local cache if found
            if (localData.some(lc => (lc.title || "").toUpperCase() === "HI")) {
              localData = localData.filter(lc => (lc.title || "").toUpperCase() !== "HI");
              localStorage.setItem('facultyCourses', JSON.stringify(localData));
              localStorage.setItem('courses', JSON.stringify(localData));
            }

            const missingStandards = industryCourses.filter(title => !apiTitles.has(title.toUpperCase()));

            const standardCourseObjects = missingStandards.map((title, idx) => ({
              id: `std-${Date.now()}-${idx}`, 
              title: title,
              modules: [],
              topics: [],
              icon: getIconForCourse(title)
            }));

            const localCustomRepos = localData.filter(lc => {
               const t = (lc.title || "").toUpperCase();
               return t && !apiTitles.has(t) && !standardTitles.has(t);
            });

            // 🚀 PRIORITY SORT: CUSTOM -> API -> STANDARDS
            const finalCurriculumRaw = [...localCustomRepos, ...rawCourses, ...standardCourseObjects];



            const coursesWithIcons = finalCurriculumRaw.map(item => {
              const apiItem = typeof item === 'string' ? { title: item, id: `api-${item}` } : item;
              const titleValue = apiItem.title || "";
              const localVersion = Array.isArray(localData) ? localData.find(lc => 
                lc.id === apiItem.id || 
                (lc.title && titleValue && lc.title.toUpperCase() === titleValue.toUpperCase())
              ) : null;

              
              const mergedModules = (localVersion && localVersion.modules && localVersion.modules.length > (apiItem.modules?.length || 0)) 
                ? localVersion.modules 
                : (apiItem.modules || []);

              return {
                ...apiItem,
                title: titleValue,
                modules: mergedModules,
                customVideos: localVersion?.customVideos || apiItem.customVideos || apiItem.custom_videos || {},
                icon: getIconForCourse(titleValue)
              };
            });

            
            setCourses(coursesWithIcons);
            localStorage.setItem('courses', JSON.stringify(coursesWithIcons));
            localStorage.setItem('facultyCourses', JSON.stringify(coursesWithIcons));
            console.log(`✅ Faculty curriculum 1000% synced: ${coursesWithIcons.length} courses total.`);
          }

        }

      } catch (error) {

        console.error("Failed to sync faculty dashboard with API:", error);

      }

    };



    fetchCoursesFromAPI();

  }, []);



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



  

  // Redundant sync useEffect removed for consolidation. 

  // Initial courses state is loaded via line 88 and synced via mount-Effect at line 140.

  // This ensures perfect parity with students and permanent persistence.



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

    if (!courseId) {

      setSelectedCourse(null);

      setSelectedSubject(null);

      return;

    }

    if (courseId && courses.length > 0) {

      const course = courses.find(c => {

        const courseName = c.title.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');

        return courseName === courseId;

      });

      

      if (course) {

        setSelectedCourse(course);

      }

      // Don't redirect automatically - let the "Course Not Found" view handle it

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

      

      const recalculatedCourses = calculateCourseProgress(updatedCourses);

      setCourses(recalculatedCourses);

      setSelectedCourse({...recalculatedCourses[courseIndex]});

      localStorage.setItem('courses', JSON.stringify(recalculatedCourses));

      localStorage.setItem('facultyCourses', JSON.stringify(recalculatedCourses));

      syncCourseToBackend(recalculatedCourses[courseIndex].id, recalculatedCourses);

      

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

    

    // New courses start empty, no auto-generation

    const modules = [];

    

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

      

      if (token) {

        // Try API for all authenticated users to ensure persistence

        const response = await fetch(`http://${window.location.hostname}:8000/api/courses/`, {

          method: 'POST',

          headers: {

            'Authorization': `Bearer ${token.replace(/^"|"$/g, "").trim()}`,

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

      } 

    } catch (error) {

      console.error("API save failed, using localStorage only:", error);

    }

    

    // Add to local state

    // Add to local state with guaranteed unique ID and priority sorting
    const timestampId = `custom-${Date.now()}`;
    newCourse.id = newCourse.id || timestampId;
    
    // Sort to show new courses at the TOP for instant visibility
    const updatedCourses = [newCourse, ...courses];
    const recalculatedCourses = calculateCourseProgress(updatedCourses);
    setCourses(recalculatedCourses);


    

    // Save to localStorage immediately

    localStorage.setItem('courses', JSON.stringify(recalculatedCourses));

    localStorage.setItem('facultyCourses', JSON.stringify(recalculatedCourses));

    

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

    

    // Success! Stay on course administration main page

    console.log("Course created successfully on main dashboard");

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

        

        const recalculatedCourses = calculateCourseProgress(updatedCourses);

        setCourses(recalculatedCourses);

        setSelectedCourse({...recalculatedCourses[courseIndex]});

        localStorage.setItem('courses', JSON.stringify(recalculatedCourses));

        localStorage.setItem('facultyCourses', JSON.stringify(recalculatedCourses));

        syncCourseToBackend(recalculatedCourses[courseIndex].id, recalculatedCourses);

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

      

      const recalculatedCourses = calculateCourseProgress(updatedCourses);

      setCourses(recalculatedCourses);

      setSelectedCourse({...recalculatedCourses[courseIndex]});

      localStorage.setItem('courses', JSON.stringify(recalculatedCourses));

      localStorage.setItem('facultyCourses', JSON.stringify(recalculatedCourses));

      syncCourseToBackend(recalculatedCourses[courseIndex].id, recalculatedCourses);

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
        const videoUrl = newTopicVidOpt === 'upload' ? newTopicVidFile : newTopicVidLink;
        if (editingTopicId) {
          // UPDATE MODE
          const topicIdx = updatedCourses[courseIndex].modules[moduleIndex].topics.findIndex(t => 
            (typeof t === 'string' ? t : t.title) === editingTopicId
          );
          if (topicIdx !== -1) {
            updatedCourses[courseIndex].modules[moduleIndex].topics[topicIdx] = {
              title: newTopic.trim(),
              video: videoUrl
            };
            if (!updatedCourses[courseIndex].customVideos) updatedCourses[courseIndex].customVideos = {};
            if (newTopic.trim() !== editingTopicId) delete updatedCourses[courseIndex].customVideos[editingTopicId];
            updatedCourses[courseIndex].customVideos[newTopic.trim()] = { type: newTopicVidOpt, url: videoUrl };
          }
        } else {
          // ADD MODE
          const topicObj = {
            title: newTopic,
            video: videoUrl
          };
          updatedCourses[courseIndex].modules[moduleIndex].topics.push(topicObj);
          if (!updatedCourses[courseIndex].topics) updatedCourses[courseIndex].topics = [];
          updatedCourses[courseIndex].topics.push(newTopic);
          if (videoUrl) {
            if (!updatedCourses[courseIndex].customVideos) updatedCourses[courseIndex].customVideos = {};
            updatedCourses[courseIndex].customVideos[newTopic] = { type: newTopicVidOpt, url: videoUrl };
          }
        }

        

        const recalculatedCourses = calculateCourseProgress(updatedCourses);

        setCourses(recalculatedCourses);

        setSelectedCourse({...recalculatedCourses[courseIndex]});

        localStorage.setItem('courses', JSON.stringify(recalculatedCourses));

        localStorage.setItem('facultyCourses', JSON.stringify(recalculatedCourses));

        syncCourseToBackend(recalculatedCourses[courseIndex].id, recalculatedCourses);

      }

    }



    setNewTopic("");

    setShowTopicVideoOptions(false);

    setNewTopicVidOpt('upload');

    setNewTopicVidFile('');

    setNewTopicVidLink('');
    setIsVideoSubmitted(false);
    setEditingTopicId(null);
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

        // Try API for all authenticated users to ensure proper cleanup

        const deletePromises = idsToRemove.map(id => 

          fetch(`http://${window.location.hostname}:8000/api/courses/${id}/`, {

            method: 'DELETE',

            headers: {

              'Authorization': `Bearer ${token.replace(/^"|"$/g, "").trim()}`,

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



      const recalculatedCourses = calculateCourseProgress(updatedCourses);

      setCourses(recalculatedCourses);

      setSelectedCourse({...recalculatedCourses[courseIndex]});

      localStorage.setItem('courses', JSON.stringify(recalculatedCourses));

      localStorage.setItem('facultyCourses', JSON.stringify(recalculatedCourses));

      syncCourseToBackend(recalculatedCourses[courseIndex].id, recalculatedCourses);

    }

  };



  // Remove All Topics

  const removeAllTopics = () => {

    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);

    if (courseIndex !== -1) {

      const updatedCourses = [...courses];

      updatedCourses[courseIndex].topics = [];

      updatedCourses[courseIndex].customVideos = {};

      const recalculatedCourses = calculateCourseProgress(updatedCourses);

      setCourses(recalculatedCourses);

      setSelectedCourse({...recalculatedCourses[courseIndex]});

      localStorage.setItem('courses', JSON.stringify(recalculatedCourses));

      localStorage.setItem('facultyCourses', JSON.stringify(recalculatedCourses));

      syncCourseToBackend(recalculatedCourses[courseIndex].id, recalculatedCourses);

    }

  };



  // Handle View Details Click

  const handleViewDetails = (course) => {
    const courseName = course.title.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
    navigate(`/faculty/Course/${courseName}`);
    setSelectedCourse(course);
    setSelectedSubject(null); // Reset subject state for manual entry flow
  };



  // Handle Back to Topics

  const handleBackToTopics = () => {

    navigate('/faculty/Course');

  };



  const syncCourseToBackend = async (courseId, updatedCourses) => {

    const courseToSync = updatedCourses.find(c => c.id === courseId);

    if (!courseToSync) return;



    try {

      const token = localStorage.getItem('access');

      // 🛡️ 1000% MASTER SYNC ENGINE
      const isUnsyncedCourse = typeof courseToSync.id === 'string';
      if (token && (typeof courseToSync.id === 'number' || isUnsyncedCourse)) {
        const payload = {
          title: courseToSync.title,
          level: courseToSync.level,
          duration: courseToSync.duration,
          topics: courseToSync.topics,
          modules: courseToSync.modules,
          custom_videos: courseToSync.customVideos || {},
          progress: courseToSync.progress
        };

        const endpoint = isUnsyncedCourse ? `http://${window.location.hostname}:8000/api/courses/` : `http://${window.location.hostname}:8000/api/courses/${courseToSync.id}/`;
        const methodType = isUnsyncedCourse ? 'POST' : 'PUT';

        const response = await fetch(endpoint, {
          method: methodType,

          headers: {

            'Authorization': `Bearer ${token.replace(/^"|"$/g, "").trim()}`,

            'Content-Type': 'application/json'

          },

          body: JSON.stringify(payload)

        });



        if (response.ok) {

          const savedData = await response.json();
          console.log(`✅ ${courseToSync.title} Master Curriculum Promotion Complete.`);
          if (isUnsyncedCourse && savedData.id) {
            const reTagged = updatedCourses.map(c => c.id === courseToSync.id ? { ...c, id: savedData.id } : c);
            setCourses(reTagged);
            localStorage.setItem('facultyCourses', JSON.stringify(reTagged));
            localStorage.setItem('courses', JSON.stringify(reTagged));
          }

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
    const customVid = (course?.customVideos && course.customVideos[topic]) || 
                      (course?.custom_videos && course.custom_videos[topic]);
    
    if (customVid) {
      localStorage.setItem('currentCustomVideo', JSON.stringify(customVid));
    } else {
      localStorage.removeItem('currentCustomVideo');
    }

    const subjectParam = selectedSubject ? `?subject=${encodeURIComponent(selectedSubject)}` : '';

    navigate(`/video/${encodeURIComponent(courseTitle)}/${encodeURIComponent(topic)}${subjectParam}`);

  };



  // MAIN DASHBOARD - COURSE LISTING

  // ================================

  return (

    <div className="bg-gray-100 min-h-screen py-5">

      {/* BOOTSTRAP MODAL FOR NEW COURSE */}

      {showAddCourse && (

        <div className="fixed inset-0 flex items-center justify-center z-50" style={{backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'}}>

          <div className="w-full max-w-2xl mx-4">

            <div className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">

              <div className="bg-primary text-white border-0 py-4 px-5">

                <h4 className="font-bold">Manual Course Creator</h4>

                <button 

                  type="button"

                  className="float-right text-white hover:text-gray-200 transition-colors cursor-pointer pointer-events-auto" 

                  onClick={() => setShowAddCourse(false)}

                  style={{ pointerEvents: 'auto', zIndex: 20 }}

                >

                  ×

                </button>

              </div>

              <div className="p-5">

                <div className="mb-4">

                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>

                  <input

                    type="text"

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                    value={newCourseName}

                    onChange={(e) => setNewCourseName(e.target.value)}

                    placeholder="Enter course name"

                  />

                </div>

                

                

                <div className="flex justify-end gap-3">

                  <button

                    type="button"

                    onClick={() => {

                      resetCourseForm();

                      setShowAddCourse(false);

                    }}

                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors cursor-pointer pointer-events-auto"

                    style={{ pointerEvents: 'auto', zIndex: 20 }}

                  >

                    Cancel

                  </button>

                  <button

                    type="button"

                    onClick={addNewCourse}

                    disabled={!newCourseName.trim()}

                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer pointer-events-auto"

                    style={{ pointerEvents: 'auto', zIndex: 20 }}

                  >

                    Add

                  </button>

                  <button

                    type="button"

                    onClick={addNewCourse}

                    disabled={!newCourseName.trim()}

                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer pointer-events-auto"

                    style={{ pointerEvents: 'auto', zIndex: 20 }}

                  >

                    Create Course

                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}



      {/* COURSE DETAILS VIEW */}

      {selectedCourse && (
        <div className="bg-gray-50 min-h-screen w-full">
          <div className="w-full h-full">
            {!playingTopic ? (
               /* MAIN DASHBOARD SCREENS */
               <>
                 <div className="flex justify-end items-center px-8 py-6 bg-white border-b border-gray-100">
                   <button
                     onClick={handleBackToTopics}
                     className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-lg transition-all active:scale-95 group"
                   >
                     <span className="text-xl transition-transform group-hover:-translate-x-1">←</span> Back to Course Dashboard
                   </button>
                 </div>

                 {!selectedSubject ? (
              /* SCREEN 1: ADD SUBJECT PAGE */
              <div className="bg-white min-h-[calc(100vh-84px)] w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-blue-600 text-white px-8 py-6 shadow-sm">
                  <h2 className="text-xl font-bold uppercase tracking-wider">{selectedCourse.title} Curriculum</h2>
                </div>
                <div className="p-8">
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">New Subject Name</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 transition-all outline-none"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="Ex: Fundamentals, Advanced Techniques, Module 1..."
                        onKeyPress={(e) => e.key === 'Enter' && newSubject.trim() && (addSubject(), setNewSubject(""))}
                      />
                      <button
                        onClick={() => {
                          if (newSubject.trim()) {
                            addSubject();
                            setNewSubject("");
                          }
                        }}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* List of Existing Subjects */}
                  <div>
                    <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">Existing Subjects</h3>
                    {(selectedCourse.modules || []).length > 0 ? (
                      <div className="space-y-3">
                        {selectedCourse.modules.map((module, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md transition-all border-2 border-transparent hover:border-blue-100 group">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-blue-600 font-bold border border-gray-100">
                                {idx + 1}
                              </div>
                              <span className="font-bold text-gray-700 text-lg">{module.title}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                  onClick={() => {
                                    setSelectedSubject(module.title);
                                    navigate(`?subject=${encodeURIComponent(module.title)}`);
                                  }}
                                  className="bg-white border-2 border-blue-500 text-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                >
                                  Go to Topics
                                </button>
                                <button
                                  onClick={() => removeSubject(module.title)}
                                  className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                          <p className="text-gray-400 font-medium">No subjects found. Add your first subject to start building topics.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* SCREEN 2: ADD TOPICS PAGE */
                <div className="bg-white min-h-[calc(100vh-84px)] w-full animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="bg-green-600 text-white px-8 py-4 flex items-center justify-between shadow-sm">
                      <h2 className="text-base font-medium uppercase tracking-[0.2em] flex items-center gap-3">
                        {selectedCourse.title} 
                        <span className="w-1 h-1 rounded-full bg-white/30"></span> 
                        <span className="text-green-200">{selectedSubject}</span>
                      </h2>
                      <button 
                        onClick={() => {
                          setSelectedSubject(null);
                          setEditingTopicId(null);
                          navigate('?');
                        }} 
                        className="bg-white/10 hover:bg-white text-white hover:text-green-700 px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 border border-white/20"
                      >
                         <span className="text-sm">←</span> Back
                      </button>
                    </div>
                
                <div className="p-8">
                  <div className="mb-10">
                    <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-widest">Enter Topic Name & Video</label>
                    <div className="flex flex-col lg:flex-row gap-4 items-start">
                      {/* 1. Topic Title Input */}
                      <div className="flex-1 w-full lg:min-w-[350px]">
                        <textarea
                          className="w-full h-24 px-5 py-4 border-2 border-gray-100 rounded-2xl focus:border-green-500 transition-all outline-none text-lg font-normal text-gray-700 shadow-inner bg-gray-50/50 resize-none"
                          value={newTopic}
                          onChange={(e) => {setNewTopic(e.target.value); setIsVideoSubmitted(false);}}
                          placeholder="Your topic name here..."
                        />
                      </div>

                      {/* 2. Action Cards */}
                      <div className="flex gap-3">
                        {/* Add Video Primary Button */}
                        <button
                          onClick={() => {setShowTopicVideoOptions(!showTopicVideoOptions); setIsVideoSubmitted(false);}}
                          className={`h-24 w-28 rounded-2xl border-0 flex flex-col items-center justify-center gap-1 transition-all shadow-md active:scale-95 ${showTopicVideoOptions ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                          <span className="text-2xl font-light">+</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-center leading-none">Add<br/>Video</span>
                        </button>

                        {/* Confirm / Final Add Button */}
                        <button
                          onClick={addTopic}
                          disabled={!newTopic.trim() || !isVideoSubmitted}
                          className={`h-24 w-40 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all shadow-md active:scale-95 ${(!newTopic.trim() || !isVideoSubmitted) ? 'bg-gray-100 text-gray-300' : 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'}`}
                        >
                          <span className="text-[12px] font-black uppercase tracking-tighter">{editingTopicId ? "Change" : "Confirm"}</span>
                          <span className="text-[9px] font-bold opacity-60 uppercase">{editingTopicId ? "Update Video" : "Add Topic"}</span>
                        </button>
                      </div>

                      {/* 3. Conditional Video Entry Panel (The Dashed Box) */}
                      {showTopicVideoOptions && !isVideoSubmitted && (
                        <div className="flex-1 w-full bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-2xl p-3 h-24 flex items-center gap-3 animate-in slide-in-from-left-4 duration-500">
                          <div className="bg-white p-1 rounded-xl border border-gray-100 flex flex-col gap-1 shadow-sm relative z-20">
                            <button 
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setNewTopicVidOpt('upload'); }}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer pointer-events-auto ${newTopicVidOpt === 'upload' ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-gray-400 hover:bg-gray-50'}`}
                            >
                              PC File
                            </button>
                            <button 
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setNewTopicVidOpt('link'); }}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer pointer-events-auto ${newTopicVidOpt === 'link' ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-gray-400 hover:bg-gray-50'}`}
                            >
                              Link
                            </button>
                          </div>
                          
                          <div className="flex-1 h-full">
                            {newTopicVidOpt === 'upload' ? (
                              <div className="flex items-center gap-2 w-full h-full">
                                <label className="flex-1 flex flex-col items-center justify-center h-full px-4 bg-white border-2 border-dashed border-blue-100 rounded-xl cursor-pointer hover:border-blue-300 font-bold text-gray-400 text-[10px] transition-all">
                                  <span className="truncate max-w-[120px]">{newTopicVidFile || "Choose File..."}</span>
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={(e) => {
                                      if(e.target.files?.[0]) setNewTopicVidFile(e.target.files[0].name);
                                    }} 
                                  />
                                </label>
                                <button 
                                  type="button"
                                  onClick={() => setIsVideoSubmitted(true)}
                                  disabled={!newTopicVidFile}
                                  className="h-full bg-blue-600 text-white px-4 rounded-xl text-[9px] font-black uppercase hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-300 shadow-sm transition-all"
                                >
                                  Submit
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 w-full h-full">
                                <input 
                                  type="text" 
                                  className="flex-1 h-full px-4 bg-white border-2 border-transparent focus:border-blue-500 rounded-xl outline-none transition-all text-[11px] font-bold shadow-sm placeholder:text-gray-300"
                                  placeholder="Paste Link..."
                                  value={newTopicVidLink}
                                  onChange={e => setNewTopicVidLink(e.target.value)}
                                />
                                <button 
                                  type="button"
                                  onClick={() => setIsVideoSubmitted(true)}
                                  disabled={!newTopicVidLink.trim()}
                                  className="h-full bg-blue-600 text-white px-4 rounded-xl text-[9px] font-black uppercase hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-300 shadow-sm transition-all"
                                >
                                  Submit
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 4. Success State after Video Submit */}
                      {isVideoSubmitted && (
                        <div className="flex-1 h-24 bg-green-50/50 border-2 border-green-100 rounded-2xl p-4 flex items-center gap-3 animate-in zoom-in-95 duration-500">
                          <div className="h-10 w-10 rounded-xl bg-green-500 text-white flex items-center justify-center text-xl shadow-md">
                            <FaCheckCircle />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-green-800 font-bold uppercase text-[9px] tracking-widest leading-none">Video Ready</p>
                                <p className="text-[9px] text-green-600 mt-1 truncate max-w-[120px] italic opacity-70">
                                  {newTopicVidOpt === 'upload' ? newTopicVidFile : newTopicVidLink}
                                </p>
                              </div>
                              <button onClick={() => setIsVideoSubmitted(false)} className="text-[8px] text-red-500 font-bold uppercase hover:underline">Edit</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* List of Existing Topics - Custom Designed to match Screenshot */}
                  <div className="mt-8">
                    {(selectedCourse.modules.find(m => m.title === selectedSubject)?.topics || []).length > 0 ? (
                      <div className="flex flex-col">
                        {selectedCourse.modules.find(m => m.title === selectedSubject).topics.map((topic, idx) => (
                          <div key={idx} className="flex items-center justify-between py-6 px-4 hover:bg-gray-50/50 transition-all border-b border-gray-50 last:border-0">
                            {/* Topic Title */}
                            <div className="flex-1 flex items-center gap-4">
                              <span className="text-gray-400 font-bold text-lg min-w-[1.5rem]">{idx + 1}.</span>
                              <span className="text-xl font-medium text-gray-800 tracking-tight">
                                {typeof topic === 'string' ? topic : topic.title}
                              </span>
                            </div>

                            {/* Action Icons Panel */}
                            <div className="flex items-center gap-10">
                              {/* Play Icon (Blue) */}
                              <button 
                                onClick={() => setPlayingTopic(topic)}
                                className="text-blue-600 hover:scale-125 transition-all cursor-pointer"
                              >
                                <FaPlay className="text-xl" />
                              </button>

                              {/* Edit Icon (Purple) - Change Video */}
                              <button 
                                onClick={() => {
                                  const topicTitle = typeof topic === 'string' ? topic : topic.title;
                                  setNewTopic(topicTitle);
                                  setEditingTopicId(topicTitle);
                                  const cVideo = (selectedCourse.customVideos && selectedCourse.customVideos[topicTitle]);
                                  if (cVideo) {
                                    setNewTopicVidOpt(cVideo.type);
                                    if (cVideo.type === 'upload') setNewTopicVidFile(cVideo.url);
                                    else setNewTopicVidLink(cVideo.url);
                                    setIsVideoSubmitted(true);
                                  } else {
                                    setIsVideoSubmitted(false);
                                  }
                                  setShowTopicVideoOptions(true);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="text-purple-600 hover:scale-125 transition-all cursor-pointer"
                              >
                                <FaEdit className="text-xl" />
                              </button>

                              {/* Trash Icon (Red) */}
                              <button 
                                onClick={() => removeTopic(typeof topic === 'string' ? topic : topic.title)}
                                className="text-red-500 hover:scale-125 transition-all cursor-pointer"
                              >
                                <FaTrash className="text-xl" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-gray-50/20 rounded-3xl border-2 border-dashed border-gray-100">
                        <p className="text-gray-400 text-base font-medium italic">Empty curriculum. Your topics will appear here in the style shown.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
             )}
              </>
            ) : (
                /* SCREEN 3: VIDEO PLAYER SCREEN */
                <div className="w-full max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-1000 pb-20 relative">
                    {/* Floating Background Blobs for Extra Color */}
                    <div className="absolute top-20 -left-20 w-72 h-72 bg-teal-400/30 blur-[120px] rounded-full animate-pulse"></div>
                    <div className="absolute bottom-20 -right-20 w-80 h-80 bg-pink-400/30 blur-[130px] rounded-full animate-pulse px-20"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none"></div>

                    {/* Ultra-Vibrant Header */}
                    <div className="flex items-center justify-between mb-12 p-6 bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white/60 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] relative z-20">
                        <button 
                            onClick={() => setPlayingTopic(null)}
                            className="group relative overflow-hidden bg-black px-10 py-5 rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                            <span className="relative flex items-center gap-3 text-white font-black uppercase text-xs tracking-[0.3em]">
                                <span className="text-xl transition-transform group-hover:-translate-x-2">←</span> Return
                            </span>
                        </button>
                        
                        <div className="text-right px-8">
                            <h2 className="text-4xl font-black tracking-tighter leading-tight bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-1">
                                {typeof playingTopic === 'string' ? playingTopic : playingTopic.title}
                            </h2>
                            <div className="flex items-center justify-end gap-3 uppercase">
                                <span className="text-[10px] font-black tracking-[0.4em] text-cyan-600">Active Session</span>
                                <div className="h-[2px] w-12 bg-gradient-to-r from-cyan-500 to-transparent"></div>
                                <span className="text-[10px] font-black tracking-[0.4em] text-gray-400">{selectedSubject}</span>
                            </div>
                        </div>
                    </div>

                    {/* Rainbow Neon Video Frame */}
                    <div className="relative group p-[6px] rounded-[3.5rem] bg-gradient-to-r from-pink-500 via-yellow-400 via-cyan-400 via-purple-500 to-pink-500 shadow-[0_50px_100px_-20px_rgba(236,72,153,0.5)] transition-all duration-1000 z-10">
                        {/* Corner Accents */}
                        <div className="absolute -top-3 -left-3 w-12 h-12 bg-pink-500 rounded-full blur-xl opacity-60"></div>
                        <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-cyan-400 rounded-full blur-xl opacity-60"></div>
                        
                        <div className="bg-[#050505] rounded-[3.2rem] overflow-hidden aspect-video relative border-[6px] border-black/20">
                            {(() => {
                                const vUrl = (playingTopic.video || (selectedCourse.customVideos && selectedCourse.customVideos[playingTopic.title]?.url));
                                if (!vUrl) return (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-zinc-800 gap-6">
                                        <div className="w-24 h-24 rounded-full border-4 border-dashed border-zinc-800 animate-spin"></div>
                                        <p className="font-black uppercase tracking-[0.5em] text-[10px]">Awaiting Signal...</p>
                                    </div>
                                );

                                const isYoutube = vUrl.includes('youtube.com') || vUrl.includes('youtu.be');
                                const embedUrl = isYoutube 
                                    ? vUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/').split('&')[0]
                                    : vUrl;

                                if (isYoutube) {
                                    return (
                                        <iframe 
                                            className="w-full h-full"
                                            src={`${embedUrl}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
                                            title="Video Player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    );
                                } else {
                                    return (
                                        <video 
                                            className="w-full h-full object-contain"
                                            controls
                                            autoPlay
                                            src={embedUrl}
                                        />
                                    );
                                }
                            })()}
                        </div>
                    </div>

                </div>
            )}
          </div>
        </div>
      )}



      {/* COURSE NOT FOUND VIEW */}

      {courseId && !selectedCourse && courses.length > 0 && (

        <div className="bg-gray-100 min-h-screen py-5 flex items-center justify-center">

          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">

            <div className="text-center">

              <div className="text-6xl mb-4">ð</div>

              <h1 className="text-2xl font-bold text-gray-800 mb-2">Course Not Found</h1>

              <p className="text-gray-600 mb-6">The requested course could not be found.</p>

              <button

                onClick={handleBackToTopics}

                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"

              >

                Back to Courses

              </button>

            </div>

          </div>

        </div>

      )}



      {/* MAIN DASHBOARD - Only show when no course is selected and no courseId */}

      {!selectedCourse && !courseId && (

        <div className="bg-gray-100 min-h-screen pb-5 pt-0">

          <div className="px-8 pb-6 pt-0 w-full">

        <div className="flex justify-between items-center mb-4">

          <div>

            <h1 className="text-3xl mb-0 text-gray-800">Course Management</h1>
            <p className="text-gray-500 mb-0">Manage your courses and curriculum</p>
          </div>


          <div className="flex items-center gap-2">
            {/* 🔍 COMPACT SEARCH ENGINE */}
            <div className="relative group w-64 md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-all group-focus-within:text-blue-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-100 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-xs font-bold tracking-tight text-gray-700 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>


            <button 

              type="button"

              onClick={() => setIsSelectionMode(!isSelectionMode)} 

              className="py-2 px-4 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors duration-200 cursor-pointer pointer-events-auto"

              style={{ pointerEvents: 'auto', zIndex: 10 }}

            >

              {isSelectionMode ? 'Stop Selection' : 'Select for Removal'}

            </button>

            <button 

              type="button"

              className="py-2 px-4 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors duration-200 cursor-pointer pointer-events-auto" 

              onClick={() => setShowAddCourse(true)}

              style={{ pointerEvents: 'auto', zIndex: 10 }}

            >

              + Add Course

            </button>

          </div>

        </div>

        

        {isSelectionMode && selectedForDeletion.length > 0 && (

          <div className="flex justify-between items-center p-4 mb-4 border border-red-300 rounded-lg bg-red-50" role="alert">

             <div><FaTrash className="inline mr-2"/> {selectedForDeletion.length} courses about to be purged</div>

             <button 

               type="button"

               onClick={removeSelectedCourses} 

               className="py-1 px-3 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition-colors duration-200 text-sm cursor-pointer pointer-events-auto"

               style={{ pointerEvents: 'auto', zIndex: 10 }}

             >

               Apply Delete

             </button>

          </div>

        )}



        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {courses
            .filter(course => (course.title || "").toUpperCase().includes(searchTerm.toUpperCase()))
            .map((course, index) => {


            return (

              <div key={index} className="h-full">

                <div className="h-full border-0 shadow-sm rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-lg bg-white">

                  <div className="relative p-5 flex items-center justify-center h-[180px]" style={{background: 'linear-gradient(45deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)'}}>

                        <h3 className="text-[13px] font-black text-white text-center uppercase tracking-wider leading-tight px-4">{course.title}</h3>

                     {isSelectionMode && (

                        <div 

                          className="absolute top-0 right-0 p-3 cursor-pointer pointer-events-auto" 

                          onClick={(e) => { e.stopPropagation(); console.log('Course selection clicked for:', course.title); toggleCourseSelection(course.id); }}

                          style={{ pointerEvents: 'auto', zIndex: 15 }}

                        >

                           <div className={`rounded-full border-[3px] border-white transition-all ${selectedForDeletion.includes(course.id) ? 'bg-red-600 p-1' : 'bg-transparent overflow-hidden'}`} style={{width: '30px', height: '30px'}}>

                              {selectedForDeletion.includes(course.id) && <FaCheckCircle className="text-white w-full h-full"/>}

                           </div>

                        </div>

                     )}

                  </div>

                  <div className="p-4 flex flex-col" style={{minHeight: '260px'}}>

                    <h5 className="font-bold text-gray-900 mb-2 text-uppercase" style={{maxHeight: '60px', overflow: 'hidden'}}>{course.title?.toUpperCase()}</h5>

                    

           
                    <div className="mt-4 mb-4">

                      <div className="flex justify-between items-center mb-1">

                        <span className="text-gray-500 text-xs font-bold">Progress</span>

                        <span className="text-gray-500 text-xs font-bold">{course.progress || 0}%</span>

                      </div>

                      <div className="w-full overflow-visible" style={{height: '6px', backgroundColor: '#f0f0f0'}}>

                        <div 

                           className="rounded-full shadow-sm transition-all duration-500" 

                           style={{

                             width: `${course.progress || 0}%`, 

                             height: '100%',

                             background: 'linear-gradient(90deg, #4158D0 0%, #C850C0 100%)'

                           }}

                        ></div>

                      </div>

                    </div>



                    <button 
                      type="button"
                      className="w-full py-3 px-4 border-2 border-blue-600 text-blue-600 rounded-full font-bold hover:bg-blue-600 hover:text-white transition-colors duration-200 mt-auto cursor-pointer pointer-events-auto" 
                      onClick={(e) => {e.stopPropagation(); console.log('View Details clicked for:', course.title); handleViewDetails(course);}}
                      style={{ pointerEvents: 'auto', zIndex: 10 }}
                    >
                      View Details
                    </button>

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      </div>
    </div>
  )}
</div>
  );
}

export default CoursesPage;


