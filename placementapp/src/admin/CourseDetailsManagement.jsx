import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  BookOpen, 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Lock, 
  Unlock, 
  Video, 
  FileText, 
  Layers, 
  Play, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Clock, 
  Award, 
  X, 
  Download, 
  Sparkles,
  FileCode,
  FolderOpen
} from "lucide-react";
import { toast } from "react-toastify";
import { useSEO } from "../utils/useSEO";

function CourseDetailsManagement() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Primary States
  const [course, setCourse] = useState(null);
  const [batches, setBatches] = useState([]);
  const [facultyUsers, setFacultyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("topics"); // topics, videos, materials, batches

  // Filter States inside Tabs
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopicFilter, setSelectedTopicFilter] = useState("all");

  // --- MODAL STATES ---
  // Topics Modal
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [newTopicText, setNewTopicText] = useState("");
  const [editingTopicIndex, setEditingTopicIndex] = useState(null);
  const [editingTopicText, setEditingTopicText] = useState("");

  // Videos Modal
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideoIndex, setEditingVideoIndex] = useState(null);
  const [videoFormData, setVideoFormData] = useState({
    title: "",
    url: "",
    topic: ""
  });
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);

  // Study Materials Modal
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterialIndex, setEditingMaterialIndex] = useState(null);
  const [materialFormData, setMaterialFormData] = useState({
    title: "",
    url: "",
    type: "PDF Document", // PDF Document, Reference Link, Code Notes, Practice Sheet
    topic: ""
  });

  // Batch Modal
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [newBatchData, setNewBatchData] = useState({
    name: "",
    code: "",
    faculty_id: "",
    timing: "10:00 AM - 12:00 PM",
    max_students: 30,
    status: "Upcoming"
  });

  useSEO(
    course ? `${course.title} - Curriculum Management` : "Course Content Management",
    "Manage curriculum topics, attached video lessons, study materials, and linked batches in a dynamic administrative workspace."
  );

  // Auth & Request Helpers
  const refreshAccessToken = async () => {
    const currentToken = localStorage.getItem("access");
    if (currentToken && currentToken.startsWith("mock_admin_token_")) return currentToken;
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
    const headers = { ...options.headers, "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

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
  const fetchCourseDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/courses/${courseId}/`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
      } else {
        if (res.status === 404) {
          toast.info("This course has been deleted or no longer exists.");
        } else {
          toast.error("Failed to load course details.");
        }
        navigate("/admin/courses", { replace: true });
      }
    } catch (err) {
      console.error("Error fetching course details:", err);
      navigate("/admin/courses", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [courseId, navigate]);

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
    fetchCourseDetails();
    fetchBatches();
    fetchFacultyUsers();

    const handleCourseSync = () => {
      fetchCourseDetails();
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
  }, [fetchCourseDetails, fetchBatches, fetchFacultyUsers]);

  // Derived Values
  const topicsList = useMemo(() => {
    if (!course) return [];
    const rawTopics = Array.isArray(course.topics) ? course.topics : [];
    const rawModules = Array.isArray(course.modules) ? course.modules : [];

    const seen = new Set();
    const combined = [];

    rawModules.forEach(m => {
      const title = typeof m === 'string' ? m : (m?.title || '');
      if (title && !seen.has(title.toLowerCase())) {
        seen.add(title.toLowerCase());
        combined.push(title);
      }
      if (m && Array.isArray(m.topics)) {
        m.topics.forEach(subT => {
          const subTitle = typeof subT === 'string' ? subT : (subT?.title || '');
          if (subTitle && !seen.has(subTitle.toLowerCase())) {
            seen.add(subTitle.toLowerCase());
            combined.push(subTitle);
          }
        });
      }
    });

    rawTopics.forEach(t => {
      const title = typeof t === 'string' ? t : (t?.title || '');
      if (title && !seen.has(title.toLowerCase())) {
        seen.add(title.toLowerCase());
        combined.push(title);
      }
    });

    return combined;
  }, [course]);
  
  const videoList = useMemo(() => {
    if (!course || !course.custom_videos) return [];
    const cv = course.custom_videos;
    let list = [];
    if (typeof cv === 'object') {
      Object.keys(cv).forEach(key => {
        const val = cv[key];
        if (Array.isArray(val)) {
          val.forEach((v, i) => list.push({ id: `${key}-${i}`, title: v.title || key, url: v.url || v, topic: key }));
        } else if (typeof val === 'string') {
          list.push({ id: key, title: key, url: val, topic: key });
        } else if (typeof val === 'object' && val.url) {
          list.push({ id: key, title: val.title || key, url: val.url, topic: key });
        }
      });
    }
    return list;
  }, [course]);

  const materialList = useMemo(() => {
    if (!course || !course.study_materials) return [];
    const sm = course.study_materials;
    let list = [];
    if (typeof sm === 'object') {
      Object.keys(sm).forEach(key => {
        const val = sm[key];
        if (Array.isArray(val)) {
          val.forEach((m, i) => list.push({ id: `${key}-${i}`, title: m.title || key, url: m.url || m, type: m.type || 'PDF Document', topic: key }));
        } else if (typeof val === 'string') {
          list.push({ id: key, title: key, url: val, type: 'PDF Document', topic: key });
        } else if (typeof val === 'object' && val.url) {
          list.push({ id: key, title: val.title || key, url: val.url, type: val.type || 'PDF Document', topic: key });
        }
      });
    }
    return list;
  }, [course]);

  const courseBatches = useMemo(() => {
    if (!course) return [];
    return batches.filter(b => b.course === course.id || b.course_id === course.id);
  }, [batches, course]);

  // Lock Status Toggle
  const handleToggleLock = async () => {
    if (!course) return;
    const newLockState = !course.locked;
    setCourse(prev => ({ ...prev, locked: newLockState }));

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/courses/${course.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ locked: newLockState })
      });
      if (res.ok) {
        toast.success(`Course ${newLockState ? "locked" : "unlocked"} successfully`);
      } else {
        fetchCourseDetails();
        toast.error("Failed to update lock status");
      }
    } catch (err) {
      fetchCourseDetails();
      toast.error("Error updating lock status");
    }
  };

  // --- TOPIC CRUD OPERATIONS ---
  const handleSaveTopicsList = async (updatedTopicsList) => {
    setCourse(prev => ({ ...prev, topics: updatedTopicsList }));
    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/courses/${course.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ topics: updatedTopicsList })
      });
      if (res.ok) {
        toast.success("Curriculum topics saved dynamically!");
        fetchCourseDetails();
        window.dispatchEvent(new Event("courseDataUpdated"));
        localStorage.setItem("courseDataUpdated", Date.now().toString());
      } else {
        fetchCourseDetails();
        toast.error("Failed to save topics");
      }
    } catch (err) {
      fetchCourseDetails();
      toast.error("Error saving topics");
    }
  };

  const handleAddTopic = (e) => {
    e.preventDefault();
    if (!newTopicText.trim()) return;
    const clean = newTopicText.trim();
    if (topicsList.includes(clean)) {
      toast.info("Topic already exists in curriculum.");
      return;
    }
    const updated = [...topicsList, clean];
    setIsAddTopicModalOpen(false);
    setNewTopicText("");
    handleSaveTopicsList(updated);
  };

  const handleUpdateTopic = (index) => {
    if (!editingTopicText.trim()) return;
    const updated = [...topicsList];
    updated[index] = editingTopicText.trim();
    setEditingTopicIndex(null);
    setEditingTopicText("");
    handleSaveTopicsList(updated);
  };

  const handleDeleteTopic = (index) => {
    if (!window.confirm("Delete this topic from curriculum?")) return;
    const updated = topicsList.filter((_, i) => i !== index);
    handleSaveTopicsList(updated);
  };

  // --- VIDEO LESSONS CRUD OPERATIONS ---
  const handleOpenAddVideoModal = () => {
    setEditingVideoIndex(null);
    setVideoFormData({
      title: "",
      url: "",
      topic: topicsList[0] || "General"
    });
    setIsVideoModalOpen(true);
  };

  const handleOpenEditVideoModal = (video, index) => {
    setEditingVideoIndex(index);
    setVideoFormData({
      title: video.title,
      url: video.url,
      topic: video.topic
    });
    setIsVideoModalOpen(true);
  };

  const handleSaveVideoSubmit = async (e) => {
    e.preventDefault();
    if (!videoFormData.title.trim() || !videoFormData.url.trim()) {
      toast.warning("Video title and URL are required!");
      return;
    }

    let newList = [...videoList];
    if (editingVideoIndex !== null) {
      newList[editingVideoIndex] = videoFormData;
    } else {
      newList.push(videoFormData);
    }

    // Format into custom_videos JSON object
    const formattedObj = {};
    newList.forEach(item => {
      const key = item.topic || "General";
      if (!formattedObj[key]) formattedObj[key] = [];
      formattedObj[key].push({ title: item.title, url: item.url });
    });

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/courses/${course.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ custom_videos: formattedObj })
      });
      if (res.ok) {
        toast.success("Student video lesson saved successfully!");
        setIsVideoModalOpen(false);
        fetchCourseDetails();
        window.dispatchEvent(new Event("courseDataUpdated"));
        localStorage.setItem("courseDataUpdated", Date.now().toString());
      } else {
        toast.error("Failed to save video lesson");
      }
    } catch (err) {
      toast.error("Error saving video lesson");
    }
  };

  const handleDeleteVideo = async (indexToDelete) => {
    if (!window.confirm("Delete this video lesson?")) return;

    const newList = videoList.filter((_, i) => i !== indexToDelete);
    const formattedObj = {};
    newList.forEach(item => {
      const key = item.topic || "General";
      if (!formattedObj[key]) formattedObj[key] = [];
      formattedObj[key].push({ title: item.title, url: item.url });
    });

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/courses/${course.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ custom_videos: formattedObj })
      });
      if (res.ok) {
        toast.success("Video lesson deleted successfully!");
        fetchCourseDetails();
      } else {
        toast.error("Failed to delete video lesson");
      }
    } catch (err) {
      toast.error("Error deleting video lesson");
    }
  };

  // --- STUDY MATERIALS CRUD OPERATIONS ---
  const handleOpenAddMaterialModal = () => {
    setEditingMaterialIndex(null);
    setMaterialFormData({
      title: "",
      url: "",
      type: "PDF Document",
      topic: topicsList[0] || "General"
    });
    setIsMaterialModalOpen(true);
  };

  const handleOpenEditMaterialModal = (mat, index) => {
    setEditingMaterialIndex(index);
    setMaterialFormData({
      title: mat.title,
      url: mat.url,
      type: mat.type || "PDF Document",
      topic: mat.topic
    });
    setIsMaterialModalOpen(true);
  };

  const handleSaveMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!materialFormData.title.trim() || !materialFormData.url.trim()) {
      toast.warning("Material title and URL are required!");
      return;
    }

    let newList = [...materialList];
    if (editingMaterialIndex !== null) {
      newList[editingMaterialIndex] = materialFormData;
    } else {
      newList.push(materialFormData);
    }

    // Format into study_materials JSON object
    const formattedObj = {};
    newList.forEach(item => {
      const key = item.topic || "General";
      if (!formattedObj[key]) formattedObj[key] = [];
      formattedObj[key].push({ title: item.title, url: item.url, type: item.type });
    });

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/courses/${course.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ study_materials: formattedObj })
      });
      if (res.ok) {
        toast.success("Study material saved successfully!");
        setIsMaterialModalOpen(false);
        fetchCourseDetails();
      } else {
        toast.error("Failed to save study material");
      }
    } catch (err) {
      toast.error("Error saving study material");
    }
  };

  const handleDeleteMaterial = async (indexToDelete) => {
    if (!window.confirm("Delete this study material?")) return;

    const newList = materialList.filter((_, i) => i !== indexToDelete);
    const formattedObj = {};
    newList.forEach(item => {
      const key = item.topic || "General";
      if (!formattedObj[key]) formattedObj[key] = [];
      formattedObj[key].push({ title: item.title, url: item.url, type: item.type });
    });

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/courses/${course.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ study_materials: formattedObj })
      });
      if (res.ok) {
        toast.success("Study material deleted successfully!");
        fetchCourseDetails();
      } else {
        toast.error("Failed to delete study material");
      }
    } catch (err) {
      toast.error("Error deleting study material");
    }
  };

  // --- BATCH CREATION ---
  const handleOpenAddBatchModal = () => {
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
      course_id: course.id,
      faculty_id: newBatchData.faculty_id || null
    };

    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/batches/create/`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(`Batch "${newBatchData.name}" created dynamically!`);
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

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 max-w-[1600px] mx-auto min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
        Loading course content details...
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link 
          to="/admin/courses"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Course Catalog
        </Link>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchCourseDetails}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Course Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-sm">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{course.title}</h1>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                course.level === 'Advanced' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                course.level === 'Intermediate' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {course.level || 'Beginner'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration || 'Self-paced'}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-purple-500" /> {courseBatches.length} Assigned Batch(es)</span>
            </p>
          </div>
        </div>

        {/* Lock Toggle */}
        <button 
          onClick={handleToggleLock}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
            course.locked 
              ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200" 
              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
          }`}
        >
          {course.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          {course.locked ? "Course Locked" : "Course Unlocked"}
        </button>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab("topics")}
          className={`p-5 bg-white rounded-2xl border shadow-sm cursor-pointer transition flex items-center justify-between ${activeTab === 'topics' ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Curriculum Topics</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{topicsList.length}</h3>
            <p className="text-xs text-indigo-600 mt-0.5 font-medium">Click to manage topics</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab("videos")}
          className={`p-5 bg-white rounded-2xl border shadow-sm cursor-pointer transition flex items-center justify-between ${activeTab === 'videos' ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Video Lessons</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{videoList.length}</h3>
            <p className="text-xs text-amber-600 mt-0.5 font-medium">Click to manage videos</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <Video className="w-6 h-6" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab("materials")}
          className={`p-5 bg-white rounded-2xl border shadow-sm cursor-pointer transition flex items-center justify-between ${activeTab === 'materials' ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Study Materials</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{materialList.length}</h3>
            <p className="text-xs text-blue-600 mt-0.5 font-medium">PDFs, notes, reference docs</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab("batches")}
          className={`p-5 bg-white rounded-2xl border shadow-sm cursor-pointer transition flex items-center justify-between ${activeTab === 'batches' ? 'border-purple-500 ring-2 ring-purple-500/10' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Training Batches</p>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">{courseBatches.length}</h3>
            <p className="text-xs text-purple-600 mt-0.5 font-medium">Active student batches</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Workspace Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-6">
        {/* Navigation Tabs Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("topics")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "topics" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <BookOpen className="w-4 h-4" /> Curriculum Topics ({topicsList.length})
            </button>

            <button
              onClick={() => setActiveTab("videos")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "videos" ? "bg-amber-600 text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Video className="w-4 h-4" /> Video Lessons ({videoList.length})
            </button>

            <button
              onClick={() => setActiveTab("materials")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "materials" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <FileText className="w-4 h-4" /> Study Materials ({materialList.length})
            </button>

            <button
              onClick={() => setActiveTab("batches")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "batches" ? "bg-purple-600 text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Layers className="w-4 h-4" /> Training Batches ({courseBatches.length})
            </button>
          </div>

          {/* Dynamic Action Trigger per active tab */}
          <div>
            {activeTab === "topics" && (
              <button
                onClick={() => setIsAddTopicModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> + Add New Topic
              </button>
            )}
            {activeTab === "videos" && (
              <button
                onClick={handleOpenAddVideoModal}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> + Add Video Lesson
              </button>
            )}
            {activeTab === "materials" && (
              <button
                onClick={handleOpenAddMaterialModal}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> + Add Study Material
              </button>
            )}
            {activeTab === "batches" && (
              <button
                onClick={handleOpenAddBatchModal}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> + Create Training Batch
              </button>
            )}
          </div>
        </div>

        {/* --- TAB 1: CURRICULUM TOPICS WORKSPACE --- */}
        {activeTab === "topics" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-medium">Manage and organize curriculum topics for {course.title}. Students complete these topics during training.</p>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                {topicsList.length} Total Topic(s)
              </span>
            </div>

            {topicsList.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <BookOpen className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
                <h4 className="text-base font-bold text-slate-800">No Curriculum Topics Added Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">Start adding curriculum topics for this course so students and faculty can track progress.</p>
                <button 
                  onClick={() => setIsAddTopicModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  + Add First Topic
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {topicsList.map((topic, index) => (
                  <div key={index} className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-between gap-3 shadow-sm transition">
                    <div className="flex items-center gap-3 w-full">
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-indigo-100">
                        {index + 1}
                      </span>

                      {editingTopicIndex === index ? (
                        <div className="flex items-center gap-2 w-full">
                          <input 
                            type="text"
                            value={editingTopicText}
                            onChange={(e) => setEditingTopicText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateTopic(index); }}
                            className="w-full px-3 py-1.5 border border-indigo-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            autoFocus
                          />
                          <button onClick={() => handleUpdateTopic(index)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700">Save</button>
                          <button onClick={() => setEditingTopicIndex(null)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200">Cancel</button>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-slate-900">{topic}</span>
                      )}
                    </div>

                    {editingTopicIndex !== index && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => { setEditingTopicIndex(index); setEditingTopicText(topic); }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit topic title"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTopic(index)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete topic"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: VIDEO LESSONS WORKSPACE --- */}
        {activeTab === "videos" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-medium">Attach YouTube or MP4 video lessons for students enrolled in {course.title}.</p>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                {videoList.length} Attached Video(s)
              </span>
            </div>

            {videoList.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <Video className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
                <h4 className="text-base font-bold text-slate-800">No Video Lessons Attached</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">Attach lecture recordings or YouTube video links so students can watch them from their LMS dashboard.</p>
                <button 
                  onClick={handleOpenAddVideoModal}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  + Add First Video Lesson
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videoList.map((video, index) => (
                  <div key={index} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-slate-300 shadow-sm transition flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 rounded-md text-[11px] font-bold border border-amber-100">
                          Topic: {video.topic || 'General'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleOpenEditVideoModal(video, index)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteVideo(index)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{video.title}</h4>
                      <p className="text-xs text-slate-400 font-mono truncate">{video.url}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setPreviewVideoUrl(video.url)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-amber-700" /> Preview Player
                      </button>

                      <a 
                        href={video.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        Open Link <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: STUDY MATERIALS WORKSPACE --- */}
        {activeTab === "materials" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-medium">Attach PDF notes, practice sheets, and document references for {course.title}.</p>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                {materialList.length} Study Material(s)
              </span>
            </div>

            {materialList.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <FileText className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
                <h4 className="text-base font-bold text-slate-800">No Study Materials Attached</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">Upload or link PDFs, lecture slides, and notes so students can download them from their dashboard.</p>
                <button 
                  onClick={handleOpenAddMaterialModal}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  + Add First Study Material
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materialList.map((mat, index) => (
                  <div key={index} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-slate-300 shadow-sm transition flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 rounded-md text-[11px] font-bold border border-blue-100">
                          {mat.type || 'PDF Document'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleOpenEditMaterialModal(mat, index)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteMaterial(index)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{mat.title}</h4>
                      <p className="text-xs text-slate-500">Topic Tag: <span className="font-semibold text-slate-700">{mat.topic || 'General'}</span></p>
                      <p className="text-xs text-slate-400 font-mono truncate">{mat.url}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <a 
                        href={mat.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> View / Download Document
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 4: TRAINING BATCHES WORKSPACE --- */}
        {activeTab === "batches" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-medium">Batches currently taking the {course.title} curriculum.</p>
              <button
                onClick={handleOpenAddBatchModal}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition"
              >
                + Create New Batch
              </button>
            </div>

            {courseBatches.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <Layers className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
                <h4 className="text-base font-bold text-slate-800">No Batches Linked to Course</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">Create a training batch for this course so students can be enrolled.</p>
                <button 
                  onClick={handleOpenAddBatchModal}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  + Add First Batch
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courseBatches.map(b => (
                  <div key={b.id} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm hover:border-slate-300 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[11px] font-bold border border-purple-100">
                          {b.status || 'Upcoming'}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{b.batch_name || b.name}</h4>
                        <p className="text-xs font-mono text-slate-400">{b.code || b.batch_code}</p>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 pt-1">
                      <p><span className="font-semibold text-slate-500">Timings:</span> {b.timing || 'TBD'}</p>
                      <p><span className="font-semibold text-slate-500">Faculty:</span> {b.faculty_name || 'Unassigned'}</p>
                      <p><span className="font-semibold text-slate-500">Capacity:</span> {b.current_students || 0} / {b.max_students || 30} students</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL 1: ADD TOPIC --- */}
      {isAddTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddTopic} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Add Curriculum Topic</h3>
              </div>
              <button type="button" onClick={() => setIsAddTopicModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Topic Title *</label>
              <input 
                type="text"
                required
                placeholder="e.g. Module 4: REST API Integration"
                value={newTopicText}
                onChange={(e) => setNewTopicText(e.target.value)}
                className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsAddTopicModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-indigo-700">Add Topic</button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL 2: ADD/EDIT VIDEO --- */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveVideoSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">{editingVideoIndex !== null ? "Edit Video Lesson" : "Add Video Lesson"}</h3>
              </div>
              <button type="button" onClick={() => setIsVideoModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Video Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Lecture 1: Core Fundamentals"
                  value={videoFormData.title}
                  onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                  className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600">Video URL (YouTube / MP4 / Drive) *</label>
                <input 
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoFormData.url}
                  onChange={(e) => setVideoFormData({ ...videoFormData, url: e.target.value })}
                  className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600">Associated Topic Tag</label>
                <select 
                  value={videoFormData.topic}
                  onChange={(e) => setVideoFormData({ ...videoFormData, topic: e.target.value })}
                  className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                >
                  {(topicsList.length ? topicsList : ["General"]).map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsVideoModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-amber-700">Save Video</button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL 3: ADD/EDIT STUDY MATERIAL --- */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveMaterialSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">{editingMaterialIndex !== null ? "Edit Study Material" : "Add Study Material"}</h3>
              </div>
              <button type="button" onClick={() => setIsMaterialModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Material Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Chapter 1 PDF Handout & Practice Problems"
                  value={materialFormData.title}
                  onChange={(e) => setMaterialFormData({ ...materialFormData, title: e.target.value })}
                  className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600">Document URL / PDF Drive Link *</label>
                <input 
                  type="url"
                  required
                  placeholder="https://drive.google.com/..."
                  value={materialFormData.url}
                  onChange={(e) => setMaterialFormData({ ...materialFormData, url: e.target.value })}
                  className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600">Document Type</label>
                  <select 
                    value={materialFormData.type}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, type: e.target.value })}
                    className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="PDF Document">PDF Document</option>
                    <option value="Reference Link">Reference Link</option>
                    <option value="Code Notes">Code Notes</option>
                    <option value="Practice Sheet">Practice Sheet</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600">Associated Topic</label>
                  <select 
                    value={materialFormData.topic}
                    onChange={(e) => setMaterialFormData({ ...materialFormData, topic: e.target.value })}
                    className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                  >
                    {(topicsList.length ? topicsList : ["General"]).map((t, idx) => (
                      <option key={idx} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsMaterialModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-blue-700">Save Material</button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODAL 4: VIDEO PREVIEW POPUP --- */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black rounded-2xl max-w-3xl w-full p-4 space-y-3 shadow-2xl relative">
            <div className="flex items-center justify-between text-white pb-2 border-b border-slate-800">
              <span className="text-sm font-bold flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-500 fill-amber-500" /> Video Lesson Preview
              </span>
              <button onClick={() => setPreviewVideoUrl(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center relative">
              {(() => {
                let cleanUrl = (previewVideoUrl || "").trim();
                const lower = cleanUrl.toLowerCase();

                // 1. YouTube
                if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
                  let embedSrc = cleanUrl;
                  const ytRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
                  const match = cleanUrl.match(ytRegex);
                  if (match && match[1]) {
                    embedSrc = `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
                  } else if (cleanUrl.includes("youtube.com/embed/")) {
                    embedSrc = `${cleanUrl.split("?")[0]}?autoplay=1&rel=0`;
                  } else {
                    embedSrc = cleanUrl.replace("watch?v=", "embed/");
                  }

                  return (
                    <iframe 
                      src={embedSrc} 
                      title="YouTube Video Player"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }

                // 2. Google Drive / Google Meet recordings
                if (lower.includes("drive.google.com")) {
                  let driveEmbed = cleanUrl;
                  if (driveEmbed.includes("/view")) {
                    driveEmbed = driveEmbed.replace(/\/view.*$/, "/preview");
                  } else if (!driveEmbed.includes("/preview")) {
                    driveEmbed = driveEmbed.endsWith("/") ? `${driveEmbed}preview` : `${driveEmbed}/preview`;
                  }
                  return (
                    <iframe 
                      src={driveEmbed} 
                      title="Google Drive / Meet Recording"
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  );
                }

                // 3. Vimeo
                if (lower.includes("vimeo.com")) {
                  const vId = cleanUrl.split("vimeo.com/")[1]?.split("?")[0]?.split("#")[0];
                  if (vId && !isNaN(vId)) {
                    return (
                      <iframe 
                        src={`https://player.vimeo.com/video/${vId}?autoplay=1`} 
                        title="Vimeo Player"
                        className="w-full h-full border-0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    );
                  }
                }

                // 4. Direct video files (.mp4, .webm, .ogg, blob:, data:video)
                if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".ogg") || lower.startsWith("blob:") || lower.startsWith("data:video/")) {
                  return <video src={cleanUrl} controls autoPlay className="w-full h-full object-contain" />;
                }

                // 5. Zoom recordings, Microsoft Teams, OneDrive, SharePoint, or generic links
                return (
                  <div className="w-full h-full flex flex-col relative">
                    <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-xs text-slate-300 border-b border-slate-800">
                      <span className="font-semibold truncate max-w-md">Cloud Recording: {cleanUrl}</span>
                      <a 
                        href={cleanUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1 rounded-md text-[11px] transition-all flex items-center gap-1 shadow-sm shrink-0"
                      >
                        Open Link in New Tab ↗
                      </a>
                    </div>
                    <iframe 
                      src={cleanUrl} 
                      title="External Video Player"
                      className="w-full flex-1 border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                    />
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: ADD BATCH --- */}
      {isAddBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateBatchSubmit} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Add Batch to {course.title}</h3>
              </div>
              <button type="button" onClick={() => setIsAddBatchModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600">Batch Name *</label>
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
                  <label className="font-semibold text-slate-600">Batch Code *</label>
                  <input 
                    type="text"
                    required
                    value={newBatchData.code}
                    onChange={(e) => setNewBatchData({ ...newBatchData, code: e.target.value })}
                    className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600">Assigned Faculty</label>
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
                  <label className="font-semibold text-slate-600">Timings</label>
                  <input 
                    type="text"
                    value={newBatchData.timing}
                    onChange={(e) => setNewBatchData({ ...newBatchData, timing: e.target.value })}
                    className="w-full p-2.5 mt-1 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600">Batch Status</label>
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

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsAddBatchModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-purple-700">Create Batch</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default CourseDetailsManagement;
