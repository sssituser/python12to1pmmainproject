import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Lock, 
  Unlock, 
  Video, 
  Layers, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Eye, 
  X, 
  Clock, 
  Award, 
  Play, 
  UserPlus, 
  ChevronRight, 
  ExternalLink,
  Zap,
  Sparkles
} from "lucide-react";
import { toast } from "react-toastify";
import { useSEO } from "../utils/useSEO";

function CourseManagement() {
  const navigate = useNavigate();
  useSEO("Dynamic Admin Course Management", "Manage courses, attached student video resources, linked batches, and lock statuses in one dynamic administrative dashboard.");

  // States
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [facultyUsers, setFacultyUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // all, unlocked, locked
  const [activeTab, setActiveTab] = useState("all"); // all, courses, batches

  // Modals
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Video Manager Modal State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoCourse, setVideoCourse] = useState(null);
  const [videoList, setVideoList] = useState([]); // [{ title, url, topic }]
  const [newVideo, setNewVideo] = useState({ title: "", url: "", topic: "" });

  // Topic Manager Modal State
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicCourse, setTopicCourse] = useState(null);
  const [topicManagerList, setTopicManagerList] = useState([]);
  const [newTopicInput, setNewTopicInput] = useState("");
  const [quickTopicInputs, setQuickTopicInputs] = useState({});

  // Batch Manager Modal State
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [batchCourse, setBatchCourse] = useState(null);
  const [newBatchData, setNewBatchData] = useState({
    name: "",
    code: "",
    faculty_id: "",
    timing: "10:00 AM - 12:00 PM",
    max_students: 30,
    status: "Upcoming"
  });

  // Course Form State
  const [courseFormData, setCourseFormData] = useState({
    title: "",
    level: "Beginner",
    duration: "40 Hours",
    locked: false,
    topics: [""],
    custom_videos: {}
  });

  // Auth & API Helper Functions
  const refreshAccessToken = async () => {
    const currentToken = localStorage.getItem("access");
    if (currentToken && currentToken.startsWith("mock_admin_token_")) {
      return currentToken;
    }
    try {
      const refreshToken = localStorage.getItem("refresh")?.replace(/^"|"$/g, "");
      if (!refreshToken) throw new Error("No refresh token");
      const response = await fetch(`http://${window.location.hostname}:8000/api/jwt/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access", data.access);
        return data.access;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }
    return null;
  };

  const makeAuthenticatedRequest = async (url, options = {}) => {
    let token = localStorage.getItem("access")?.replace(/^"|"$/g, "");
    const headers = {
      ...options.headers,
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let res = await fetch(url, { ...options, headers });
    if (res.status === 401 && token) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(url, { ...options, headers });
      }
    }
    return res;
  };

  // Data Fetchers
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/courses/`);
      if (res.ok) {
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : (data.results || []));
      } else {
        toast.error("Failed to load courses list");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast.error("Network error loading courses");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBatches = useCallback(async () => {
    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/batches/`);
      if (res.ok) {
        const data = await res.json();
        setBatches(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching batches:", err);
    }
  }, []);

  const fetchFacultyUsers = useCallback(async () => {
    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/all-users/`);
      if (res.ok) {
        const data = await res.json();
        setFacultyUsers(data.filter(u => u.role === 'faculty'));
      }
    } catch (err) {
      console.error("Error fetching faculty users:", err);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchBatches();
    fetchFacultyUsers();

    const handleCourseSync = () => {
      fetchCourses();
    };
    window.addEventListener("courseDataUpdated", handleCourseSync);
    const handleStorageChange = (e) => {
      if (e.key === "courseDataUpdated") handleCourseSync();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("courseDataUpdated", handleCourseSync);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [fetchCourses, fetchBatches, fetchFacultyUsers]);

  // Derived Stats
  const unlockedCoursesCount = useMemo(() => courses.filter(c => !c.locked).length, [courses]);
  const lockedCoursesCount = useMemo(() => courses.filter(c => c.locked).length, [courses]);
  const totalVideosCount = useMemo(() => {
    return courses.reduce((acc, c) => {
      if (c.custom_videos && typeof c.custom_videos === 'object') {
        const values = Object.values(c.custom_videos);
        const count = values.reduce((sum, val) => sum + (Array.isArray(val) ? val.length : (val ? 1 : 0)), 0);
        return acc + count;
      }
      return acc;
    }, 0);
  }, [courses]);

  // Lock Toggler Action
  const handleToggleLock = async (course) => {
    const newLockState = !course.locked;
    // Optimistic UI Update
    setCourses(prev => prev.map(c => c.id === course.id ? { ...c, locked: newLockState } : c));

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/courses/${course.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ locked: newLockState })
      });
      if (res.ok) {
        toast.success(`Course ${newLockState ? "locked" : "unlocked"} successfully`);
      } else {
        fetchCourses();
        toast.error("Failed to update course lock state");
      }
    } catch (err) {
      fetchCourses();
      toast.error("Error updating course lock status");
    }
  };

  // Delete Course Handler
  const handleDeleteCourse = async (courseId) => {
    const targetCourse = courses.find(c => c.id === courseId);
    if (!window.confirm("Are you sure you want to delete this course? All associated modules and videos will be removed.")) return;

    // Optimistic delete
    setCourses(prev => prev.filter(c => c.id !== courseId));

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/courses/${courseId}/`, {
        method: "DELETE"
      });
      if (res.ok || res.status === 204) {
        toast.success("Course deleted successfully");
        
        // 🧹 Purge deleted course from local caches
        ['courses', 'facultyCourses', 'admin_courses'].forEach(key => {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const list = JSON.parse(raw);
              if (Array.isArray(list)) {
                const filtered = list.filter(c => c.id !== courseId && (typeof c === 'string' ? c !== targetCourse?.title : c.title !== targetCourse?.title));
                localStorage.setItem(key, JSON.stringify(filtered));
              }
            }
          } catch(e) {}
        });

        // 🛡️ Blacklist deleted title so fallbacks never recreate it
        if (targetCourse && targetCourse.title) {
          try {
            const deletedTitles = JSON.parse(localStorage.getItem('deletedCourseTitles') || '[]');
            const tUpper = targetCourse.title.trim().toUpperCase();
            if (!deletedTitles.includes(tUpper)) {
              deletedTitles.push(tUpper);
              localStorage.setItem('deletedCourseTitles', JSON.stringify(deletedTitles));
            }
          } catch(e) {}
        }

        window.dispatchEvent(new Event("courseDataUpdated"));
        localStorage.setItem("courseDataUpdated", Date.now().toString());
        fetchBatches();
      } else {
        fetchCourses();
        toast.error("Failed to delete course");
      }
    } catch (err) {
      fetchCourses();
      toast.error("Error deleting course");
    }
  };

  // Dynamic Topic List Form Controls
  const handleTopicChange = (index, value) => {
    const updated = [...courseFormData.topics];
    updated[index] = value;
    setCourseFormData({ ...courseFormData, topics: updated });
  };

  const handleAddTopicField = () => {
    setCourseFormData({ ...courseFormData, topics: [...courseFormData.topics, ""] });
  };

  const handleRemoveTopicField = (index) => {
    const updated = courseFormData.topics.filter((_, i) => i !== index);
    setCourseFormData({ ...courseFormData, topics: updated.length ? updated : [""] });
  };

  // Create Course Submit
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseFormData.title.trim()) {
      toast.warning("Course title is required!");
      return;
    }

    const cleanedTopics = courseFormData.topics.filter(t => t.trim() !== "");
    const payload = {
      ...courseFormData,
      topics: cleanedTopics
    };

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/courses/`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("New course created successfully!");
        setIsAddCourseModalOpen(false);
        setCourseFormData({
          title: "",
          level: "Beginner",
          duration: "40 Hours",
          locked: false,
          topics: [""],
          custom_videos: {}
        });
        fetchCourses();
      } else {
        const errData = await res.json();
        toast.error(errData.detail || errData.title?.[0] || "Failed to create course");
      }
    } catch (err) {
      toast.error("Error creating new course");
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (course) => {
    setSelectedCourse(course);
    const existingTopics = Array.isArray(course.topics) && course.topics.length ? course.topics : [""];
    setCourseFormData({
      title: course.title || "",
      level: course.level || "Beginner",
      duration: course.duration || "40 Hours",
      locked: course.locked || false,
      topics: existingTopics,
      custom_videos: course.custom_videos || {}
    });
    setIsEditCourseModalOpen(true);
  };

  // Save Edit Course
  const handleSaveEditCourse = async (e) => {
    e.preventDefault();
    if (!courseFormData.title.trim()) {
      toast.warning("Course title is required!");
      return;
    }

    const cleanedTopics = courseFormData.topics.filter(t => t.trim() !== "");
    const payload = {
      ...courseFormData,
      topics: cleanedTopics
    };

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/courses/${selectedCourse.id}/`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("Course details updated successfully!");
        setIsEditCourseModalOpen(false);
        fetchCourses();
      } else {
        toast.error("Failed to update course");
      }
    } catch (err) {
      toast.error("Error updating course");
    }
  };

  // Topic Manager Functions
  const handleOpenTopicManager = (course) => {
    setTopicCourse(course);
    const topics = Array.isArray(course.topics) ? course.topics : [];
    setTopicManagerList(topics);
    setNewTopicInput("");
    setIsTopicModalOpen(true);
  };

  const handleAddTopicToManager = () => {
    if (!newTopicInput.trim()) return;
    const clean = newTopicInput.trim();
    if (topicManagerList.includes(clean)) {
      toast.info("Topic already in list.");
      return;
    }
    setTopicManagerList([...topicManagerList, clean]);
    setNewTopicInput("");
  };

  const handleRemoveTopicFromManager = (index) => {
    setTopicManagerList(topicManagerList.filter((_, i) => i !== index));
  };

  const handleUpdateTopicInManager = (index, value) => {
    const updated = [...topicManagerList];
    updated[index] = value;
    setTopicManagerList(updated);
  };

  const handleSaveTopicsManager = async () => {
    const cleanedTopics = topicManagerList.filter(t => typeof t === 'string' && t.trim() !== "");

    // Optimistic UI Update
    setCourses(prev => prev.map(c => c.id === topicCourse.id ? { ...c, topics: cleanedTopics } : c));

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/courses/${topicCourse.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ topics: cleanedTopics })
      });
      if (res.ok) {
        toast.success(`Curriculum topics for "${topicCourse.title}" updated dynamically!`);
        setIsTopicModalOpen(false);
        fetchCourses();
      } else {
        fetchCourses();
        toast.error("Failed to save topics");
      }
    } catch (err) {
      fetchCourses();
      toast.error("Error saving topics");
    }
  };

  // Inline Quick Add Topic
  const handleQuickAddTopicSubmit = async (courseId, newTopicText) => {
    if (!newTopicText || !newTopicText.trim()) return;
    const cleanText = newTopicText.trim();
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const currentTopics = Array.isArray(course.topics) ? course.topics : [];
    if (currentTopics.includes(cleanText)) {
      toast.info(`Topic "${cleanText}" already exists in this course.`);
      setQuickTopicInputs(prev => ({ ...prev, [courseId]: "" }));
      return;
    }

    const updatedTopics = [...currentTopics, cleanText];

    // Clear quick input
    setQuickTopicInputs(prev => ({ ...prev, [courseId]: "" }));

    // Optimistic UI Update
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, topics: updatedTopics } : c));

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/courses/${courseId}/`, {
        method: "PATCH",
        body: JSON.stringify({ topics: updatedTopics })
      });
      if (res.ok) {
        toast.success(`Topic "${cleanText}" added dynamically!`);
      } else {
        fetchCourses();
        toast.error("Failed to add topic dynamically");
      }
    } catch (err) {
      fetchCourses();
      toast.error("Error adding topic dynamically");
    }
  };

  // Video Manager Open & Functions
  const handleOpenVideoManager = (course) => {
    setVideoCourse(course);
    // Parse custom_videos into an array format for easy management
    const cv = course.custom_videos || {};
    let parsedList = [];
    if (typeof cv === 'object') {
      Object.keys(cv).forEach(key => {
        const val = cv[key];
        if (Array.isArray(val)) {
          val.forEach(v => parsedList.push({ title: v.title || key, url: v.url || v, topic: key }));
        } else if (typeof val === 'string') {
          parsedList.push({ title: key, url: val, topic: key });
        } else if (typeof val === 'object' && val.url) {
          parsedList.push({ title: val.title || key, url: val.url, topic: key });
        }
      });
    }
    setVideoList(parsedList);
    setNewVideo({ title: "", url: "", topic: course.topics?.[0] || "General" });
    setIsVideoModalOpen(true);
  };

  const handleAddVideo = () => {
    if (!newVideo.title.trim() || !newVideo.url.trim()) {
      toast.warning("Please enter video title and URL!");
      return;
    }
    setVideoList([...videoList, newVideo]);
    setNewVideo({ title: "", url: "", topic: videoCourse.topics?.[0] || "General" });
  };

  const handleRemoveVideo = (index) => {
    setVideoList(videoList.filter((_, i) => i !== index));
  };

  const handleSaveVideos = async () => {
    // Format list back into custom_videos JSON object
    const formattedObj = {};
    videoList.forEach(item => {
      const key = item.topic || "General";
      if (!formattedObj[key]) formattedObj[key] = [];
      formattedObj[key].push({ title: item.title, url: item.url });
    });

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/courses/${videoCourse.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ custom_videos: formattedObj })
      });
      if (res.ok) {
        toast.success("Student video resources updated successfully!");
        setIsVideoModalOpen(false);
        fetchCourses();
      } else {
        toast.error("Failed to save student videos");
      }
    } catch (err) {
      toast.error("Error saving video resources");
    }
  };

  // Add Batch Modal Functions
  const handleOpenAddBatch = (course) => {
    setBatchCourse(course);
    setNewBatchData({
      name: `${course.title} - Batch ${batches.length + 1}`,
      code: `BATCH-${course.id}-${Date.now().toString().slice(-4)}`,
      faculty_id: facultyUsers[0]?.id || "",
      timing: "10:00 AM - 12:00 PM",
      max_students: 30,
      status: "Upcoming"
    });
    setIsAddBatchModalOpen(true);
  };

  const handleCreateBatchSubmit = async (e) => {
    e.preventDefault();
    if (!newBatchData.name || !newBatchData.code) {
      toast.warning("Batch name and code are required!");
      return;
    }

    const payload = {
      ...newBatchData,
      course_id: batchCourse.id,
      faculty_id: newBatchData.faculty_id || null
    };

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/batches/create/`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(`Batch "${newBatchData.name}" created for ${batchCourse.title}!`);
        setIsAddBatchModalOpen(false);
        fetchBatches();
      } else {
        const data = await res.json();
        toast.error(data.detail || data.error || "Failed to create batch");
      }
    } catch (err) {
      toast.error("Error creating batch");
    }
  };

  // Dynamic Filtering & Sorting
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        c.title.toLowerCase().includes(searchLower) ||
        (Array.isArray(c.topics) && c.topics.some(t => String(t).toLowerCase().includes(searchLower)));

      const matchesLevel = 
        levelFilter === "all" ? true :
        c.level?.toLowerCase() === levelFilter.toLowerCase();

      const matchesStatus = 
        statusFilter === "all" ? true :
        statusFilter === "unlocked" ? !c.locked :
        statusFilter === "locked" ? c.locked : true;

      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [courses, searchTerm, levelFilter, statusFilter]);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100/60 shadow-sm">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Course Management Hub</h1>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-3 h-3 text-indigo-500 fill-indigo-500" /> Full Admin Access
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">Manage curriculum, attach student video lessons, link training batches, and set course access locks</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => { fetchCourses(); fetchBatches(); toast.info("Refreshed courses & batches"); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <button 
            onClick={() => setIsAddCourseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            + Create New Course
          </button>
        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Courses</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{courses.length}</h3>
            <p className="text-xs text-slate-500 mt-1">Active curriculum items</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unlocked Courses</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{unlockedCoursesCount}</h3>
            <p className="text-xs text-emerald-600/80 mt-1 font-medium">Accessible to students</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <Unlock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Linked Batches</p>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">{batches.length}</h3>
            <p className="text-xs text-purple-600/80 mt-1 font-medium">Active training batches</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Video Lessons</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{totalVideosCount}</h3>
            <p className="text-xs text-amber-600/80 mt-1 font-medium">Attached video resources</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <Video className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-5">
        {/* Search & Filter Controls Bar */}
        <div className="flex flex-col lg:flex-row gap-3 justify-between items-center bg-slate-50/80 p-4 rounded-xl border border-slate-200/70">
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by course title, topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </div>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Difficulty Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Access Statuses</option>
              <option value="unlocked">Unlocked Only</option>
              <option value="locked">Locked Only</option>
            </select>
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full p-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
              Loading course catalog...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
              No courses found matching your criteria.
            </div>
          ) : (
            filteredCourses.map((course) => {
              const linkedBatches = batches.filter(b => b.course === course.id || b.course_id === course.id);
              const topicsList = Array.isArray(course.topics) ? course.topics : [];
              
              // Count videos
              const cv = course.custom_videos || {};
              let videoCount = 0;
              if (typeof cv === 'object') {
                Object.values(cv).forEach(val => {
                  if (Array.isArray(val)) videoCount += val.length;
                  else if (val) videoCount += 1;
                });
              }

              return (
                <div 
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-5 space-y-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full mb-2 ${
                          course.level === 'Advanced' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          course.level === 'Intermediate' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {course.level || 'Beginner'}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug">{course.title}</h3>
                      </div>

                      {/* Lock Status Toggle */}
                      <button 
                        onClick={() => handleToggleLock(course)}
                        title={course.locked ? "Unlock course for students" : "Lock course for students"}
                        className={`p-2 rounded-xl transition ${
                          course.locked 
                            ? "bg-rose-50 text-rose-600 hover:bg-rose-100" 
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                      >
                        {course.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Metadata Summary Badges */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium pt-1">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {course.duration || 'Self-paced'}
                      </span>
                      <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-xl border border-indigo-100 font-semibold">
                        <BookOpen className="w-3.5 h-3.5" /> {topicsList.length} Topics
                      </span>
                      <span className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-2.5 py-1.5 rounded-xl border border-amber-100 font-semibold">
                        <Video className="w-3.5 h-3.5" /> {videoCount} Video(s)
                      </span>
                      <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-2.5 py-1.5 rounded-xl border border-purple-100 font-semibold">
                        <Layers className="w-3.5 h-3.5" /> {linkedBatches.length} Batch(es)
                      </span>
                    </div>

                    {/* Linked Batches Preview */}
                    {linkedBatches.length > 0 && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Batches</p>
                        <div className="flex flex-wrap gap-1">
                          {linkedBatches.map(b => (
                            <span key={b.id} className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              {b.batch_name || b.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer - Single Primary Navigation Button */}
                  <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigate(`/admin/courses/${course.id}`)}
                      className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <BookOpen className="w-4 h-4" /> Manage Curriculum & Content
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(course)}
                        title="Edit course title & level"
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        title="Delete course"
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --- MODAL 1: CREATE NEW COURSE --- */}
      {isAddCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateCourse} className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Create New Course</h3>
              </div>
              <button type="button" onClick={() => setIsAddCourseModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-semibold text-slate-600">Course Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Full Stack Python Web Development"
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                  className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Difficulty Level</label>
                  <select 
                    value={courseFormData.level}
                    onChange={(e) => setCourseFormData({ ...courseFormData, level: e.target.value })}
                    className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Duration</label>
                  <input 
                    type="text"
                    placeholder="e.g. 40 Hours"
                    value={courseFormData.duration}
                    onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })}
                    className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Dynamic Topics List */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase">Curriculum Topics</label>
                  <button 
                    type="button"
                    onClick={handleAddTopicField}
                    className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    + Add Topic
                  </button>
                </div>

                {courseFormData.topics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input 
                      type="text"
                      placeholder={`Topic #${index + 1}`}
                      value={topic}
                      onChange={(e) => handleTopicChange(index, e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-sm"
                    />
                    {courseFormData.topics.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTopicField(index)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button 
                type="button"
                onClick={() => setIsAddCourseModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm"
              >
                Create Course
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL 2: EDIT COURSE --- */}
      {isEditCourseModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveEditCourse} className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Edit Course Details</h3>
              </div>
              <button type="button" onClick={() => setIsEditCourseModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-semibold text-slate-600">Course Title *</label>
                <input 
                  type="text"
                  required
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                  className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Difficulty Level</label>
                  <select 
                    value={courseFormData.level}
                    onChange={(e) => setCourseFormData({ ...courseFormData, level: e.target.value })}
                    className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Duration</label>
                  <input 
                    type="text"
                    value={courseFormData.duration}
                    onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })}
                    className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Dynamic Topics List */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase">Curriculum Topics</label>
                  <button 
                    type="button"
                    onClick={handleAddTopicField}
                    className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    + Add Topic
                  </button>
                </div>

                {courseFormData.topics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input 
                      type="text"
                      value={topic}
                      onChange={(e) => handleTopicChange(index, e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl text-sm"
                    />
                    {courseFormData.topics.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTopicField(index)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button 
                type="button"
                onClick={() => setIsEditCourseModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL 3: STUDENT VIDEO RESOURCES MANAGER --- */}
      {isVideoModalOpen && videoCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Student Video Resources</h3>
                  <p className="text-xs text-slate-500">Manage attached video lessons for {videoCourse.title}</p>
                </div>
              </div>
              <button onClick={() => setIsVideoModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Video Inputs */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <p className="text-xs font-bold text-slate-700 uppercase">+ Attach New Video Lesson</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <input 
                  type="text" 
                  placeholder="Video Title (e.g. Lecture 1: Basics)"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                />
                <input 
                  type="url" 
                  placeholder="Video URL (YouTube or direct link)"
                  value={newVideo.url}
                  onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <select
                  value={newVideo.topic}
                  onChange={(e) => setNewVideo({ ...newVideo, topic: e.target.value })}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                >
                  {(videoCourse.topics || ["General"]).map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>

                <button 
                  type="button"
                  onClick={handleAddVideo}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Add Video
                </button>
              </div>
            </div>

            {/* Video List */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase">Attached Videos ({videoList.length})</p>
              {videoList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  <Video className="w-8 h-8 mx-auto mb-1 opacity-40" />
                  <p className="text-xs">No video lessons attached yet.</p>
                </div>
              ) : (
                videoList.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                        <Play className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.title}</p>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                          {item.url} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => handleRemoveVideo(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSaveVideos}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm"
              >
                Save Video Resources
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: CREATE BATCH LINKED TO COURSE --- */}
      {isAddBatchModalOpen && batchCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateBatchSubmit} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-900">Add Batch to {batchCourse.title}</h3>
              </div>
              <button type="button" onClick={() => setIsAddBatchModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-semibold text-slate-600">Batch Name *</label>
                <input 
                  type="text"
                  required
                  value={newBatchData.name}
                  onChange={(e) => setNewBatchData({ ...newBatchData, name: e.target.value })}
                  className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Batch Code *</label>
                  <input 
                    type="text"
                    required
                    value={newBatchData.code}
                    onChange={(e) => setNewBatchData({ ...newBatchData, code: e.target.value })}
                    className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Assigned Faculty</label>
                  <select
                    value={newBatchData.faculty_id}
                    onChange={(e) => setNewBatchData({ ...newBatchData, faculty_id: e.target.value })}
                    className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="">Select Faculty</option>
                    {facultyUsers.map(f => (
                      <option key={f.id} value={f.id}>{f.first_name || f.username} ({f.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Timings</label>
                  <input 
                    type="text"
                    value={newBatchData.timing}
                    onChange={(e) => setNewBatchData({ ...newBatchData, timing: e.target.value })}
                    className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Batch Status</label>
                  <select 
                    value={newBatchData.status}
                    onChange={(e) => setNewBatchData({ ...newBatchData, status: e.target.value })}
                    className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Running">Running</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsAddBatchModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl shadow-sm"
              >
                Create Batch
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL 5: CURRICULUM TOPICS MANAGER --- */}
      {isTopicModalOpen && topicCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Manage Curriculum Topics</h3>
                  <p className="text-xs text-slate-500">{topicCourse.title}</p>
                </div>
              </div>
              <button onClick={() => setIsTopicModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Topic Input Bar */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase">+ Add New Topic</p>
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  placeholder="e.g. Module 3: Advanced Optimization"
                  value={newTopicInput}
                  onChange={(e) => setNewTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTopicToManager();
                    }
                  }}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddTopicToManager}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
                >
                  Add
                </button>
              </div>
            </div>

            {/* List of Topics */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Topics List ({topicManagerList.length})</p>
              {topicManagerList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  <BookOpen className="w-8 h-8 mx-auto mb-1 opacity-40" />
                  <p className="text-xs">No curriculum topics added yet.</p>
                </div>
              ) : (
                topicManagerList.map((topicText, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50/50">
                    <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <input 
                      type="text"
                      value={topicText}
                      onChange={(e) => handleUpdateTopicInManager(idx, e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none focus:bg-slate-50 px-2 py-1 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTopicFromManager(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsTopicModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSaveTopicsManager}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm"
              >
                Save Topics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseManagement;
