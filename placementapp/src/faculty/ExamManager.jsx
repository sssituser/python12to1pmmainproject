import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSave, 
  faCheckCircle, 
  faSpinner, 
  faPlus, 
  faTrash, 
  faInfoCircle,
  faHistory
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { industryCourses, defaultCourses } from "../components/CourseData.jsx";
import { getQuestionBank } from "./QuestionBank.js";


function ExamManager() {
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("Python Full Stack");
  const [maxQuestions, setMaxQuestions] = useState(50);
  const [duration, setDuration] = useState(45); // duration in minutes
  const [passingRule, setPassingRule] = useState("percentage"); // "percentage" or "correct_answers"
  const [passingValue, setPassingValue] = useState(50); // 50% or 15 correct
  const [category, setCategory] = useState("Weekly");
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isQuestionsSaving, setIsQuestionsSaving] = useState(false);
  
  // Daily / Automated Configuration State
  const [examName, setExamName] = useState("Daily Assessment");
  const [examCourseName, setExamCourseName] = useState(() => {
    return localStorage.getItem("last_exam_course") || "Python Full Stack";
  });
  const [examSubjects, setExamSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [fullCourseObjects, setFullCourseObjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [examDuration, setExamDuration] = useState(80);
  const [examStrategy, setExamStrategy] = useState("percentage");
  const [examRequirement, setExamRequirement] = useState(50);
  const [examQuestionCount, setExamQuestionCount] = useState(25);
  const [examMarksPerQuestion, setExamMarksPerQuestion] = useState(2);
  const [isGlobalMode, setIsGlobalMode] = useState(() => {
    return localStorage.getItem("last_exam_is_global") === "true";
  });

  // 👁️ PREVIEW STATE
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedPreviewQuestions, setSelectedPreviewQuestions] = useState([]);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // 🛡️ 1000% MASTER DATABASE SYNC (Lifetime Persistence)
  useEffect(() => {
    const fetchMasterCurriculum = async () => {
      const token = localStorage.getItem('access');
      const cleanToken = token ? token.replace(/^"|"$/g, "").trim() : "";
      
      try {
        // 🏗️ Step 1: Fetch from Backend (Source of Truth)
        const response = await authenticatedRequest('get', `http://${window.location.hostname}:8000/api/courses/`);
        
        let apiCourses = [];
        if (response.data) {
          apiCourses = response.data.data || response.data.results || (Array.isArray(response.data) ? response.data : []);
        }

        // 🏗️ Step 2: Merge with Standard Industrial Courses (Fulfills dropdown requirement)
        const localSaved = localStorage.getItem('facultyCourses') || localStorage.getItem('courses');
        let localData = [];
        try { if(localSaved) localData = JSON.parse(localSaved); } catch(e){}

        const apiTitles = new Set(apiCourses.map(c => (typeof c === 'string' ? c : (c.title || "")).toUpperCase()));
        const standardTitles = new Set(industryCourses.map(t => t.toUpperCase()));
        
        // Combine local custom, API, and industrial standards
        const localCustom = Array.isArray(localData) ? localData.filter(lc => {
           const t = (lc.title || lc || "").toString().toUpperCase();
           return t && !apiTitles.has(t) && !standardTitles.has(t);
        }) : [];

        const mergedCourseObjects = [...localCustom, ...apiCourses, ...defaultCourses];
        
        // 🏗️ Step 3: Extract Titles for Dropdown (Unique & Clean)
        const titleMap = new Map();
        mergedCourseObjects.forEach(c => {
          const title = (typeof c === 'string' ? c : (c.title || "")).trim();
          if (title) {
            const key = title.toUpperCase();
            if (!titleMap.has(key)) titleMap.set(key, title);
          }
        });
        
        const sortedTitles = Array.from(titleMap.values())
          .sort((a, b) => a.localeCompare(b));

        setCourses(sortedTitles);
        setFullCourseObjects(mergedCourseObjects);
        
        console.log(`✅ Database Sync Success: ${mergedCourseObjects.length} courses identified (${sortedTitles.length} unique titles).`);
      } catch (err) {
        console.warn("API Sync Unavailable, falling back to pure local/standard:", err);
        // Fallback to local storage + industry defaults if API is down
        const rawFaculty = localStorage.getItem('facultyCourses') || localStorage.getItem('courses');
        const facultyData = rawFaculty ? JSON.parse(rawFaculty) : [];
        
        const combinedFallback = [...facultyData, ...defaultCourses];
        const titleMap = new Map();
        combinedFallback.forEach(c => {
          const title = (typeof c === 'string' ? c : (c.title || c)).toString().trim();
          if (title) {
            const key = title.toUpperCase();
            if (!titleMap.has(key)) titleMap.set(key, title);
          }
        });
        
        const sortedTitles = Array.from(titleMap.values())
          .sort((a, b) => a.localeCompare(b));

        setCourses(sortedTitles);
        setFullCourseObjects(combinedFallback);
      }
    };

    fetchMasterCurriculum();
  }, []);

  const getSubjectsForCourse = (courseName) => {
    if (!courseName) return [];
    
    // 🛡️ 1000% MASTER NORMALIZATION: Perfect matching for "Data Science & AI" vs "DATA SCIENCE AND AI"
    const normalize = (s) => (s || "").toString().toUpperCase()
        .replace(/&/g, " AND ")
        .replace(/[^A-Z0-9]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const target = normalize(courseName);
    const subs = new Set();

    // 🏗️ 100,000% MASTER DATABASE MERGER (Fulfills Point 1 & 4)
    // We collect subjects from ALL courses that are part of this title
    if (Array.isArray(fullCourseObjects)) {
      fullCourseObjects.forEach(c => {
        const t = (typeof c === 'string' ? c : (c.title || ""));
        if (normalize(t) === target) {
          const rawSubjects = (c.subjects || c.modules || []);
          if (rawSubjects.length > 0) {
            const subjects = rawSubjects.map(s => (typeof s === 'string' ? s : (s.title || "")));
            subjects.forEach(s => s && subs.add(s));
          } else {
            // If no modules/subjects, add the course name itself as a virtual subject
            subs.add(t);
          }
        }
      });
    }

    return Array.from(subs);
  };

  const getAllSubjects = () => {
    const all = new Set();
    if (Array.isArray(fullCourseObjects)) {
      fullCourseObjects.forEach(c => {
        getSubjectsForCourse(typeof c === 'string' ? c : (c.title || "")).forEach(s => {
          if (s) all.add(s);
        });
      });
    }
    return Array.from(all);
  };

  // 🏗️ TRACK PREVIOUS COURSE FOR STABLE RESETS
  const [lastSyncedCourse, setLastSyncedCourse] = useState("");

  // 🛡️ AUTHENTICATION HELPER
  const getAuthHeader = () => {
    const rawToken = localStorage.getItem("access");
    if (!rawToken) return {};
    const cleanToken = rawToken.replace(/^"|"$/g, "").trim();
    return { 
      headers: { 
        Authorization: `Bearer ${cleanToken}`,
        "Content-Type": "application/json"
      } 
    };
  };

  // 🛡️ AUTHENTICATION & RETRY HELPER
  const authenticatedRequest = async (method, url, data = null, params = null) => {
    const makeRequest = async () => {
      const config = getAuthHeader();
      if (method.toLowerCase() === 'get') return axios.get(url, { ...config, params });
      return axios.post(url, data, config);
    };

    try {
      return await makeRequest();
    } catch (err) {
      if (err.response?.status === 401) {
        console.log("🔒 Token expired in ExamManager, attempting refresh...");
        try {
          const refreshToken = localStorage.getItem("refresh");
          if (!refreshToken) throw new Error("No refresh token");

          const refreshRes = await axios.post(`http://${window.location.hostname}:8000/api/jwt/refresh/`, { 
            refresh: refreshToken 
          });

          if (refreshRes.data && refreshRes.data.access) {
            localStorage.setItem("access", refreshRes.data.access);
            console.log("🔓 Token refreshed, retrying original request...");
            return await makeRequest();
          }
        } catch (refreshErr) {
          console.error("❌ Refresh failed:", refreshErr);
          // Optional: redirect to login if session is totally dead
        }
      }
      throw err;
    }
  };

  // 🏗️ MASTER SYNC ENGINE
  useEffect(() => {
    // Determine the desired state based on existing flags
    const desiredGlobal = (isGlobalMode || examCourseName === "ALL");
    
    if (category === "Daily") {
       if (desiredGlobal) {
          const all = getAllSubjects();
          setAvailableSubjects(all);
          // Only auto-select EVERYTHING if we are truly in Global Mode
          if (examSubjects.length !== all.length) setExamSubjects(all);
          
          if (!isGlobalMode) setIsGlobalMode(true);
          if (examCourseName !== "ALL") setExamCourseName("ALL");
          setLastSyncedCourse("ALL");
       } else {
          const subs = getSubjectsForCourse(examCourseName);
          setAvailableSubjects(subs);
          
          // 🛡️ MANUAL SELECTION ENFORCEMENT: Clear subjects ONLY when switching to a NEW course
          if (examCourseName !== lastSyncedCourse) {
            setExamSubjects([]); 
            setLastSyncedCourse(examCourseName);
          }
          
          if (isGlobalMode) setIsGlobalMode(false);
       }
    }
  }, [category, examCourseName, isGlobalMode, fullCourseObjects, lastSyncedCourse]); 

  // Synchronous flag for UI rendering - Zero Latency
  const isGlobalActive = (isGlobalMode || examCourseName === "ALL");
  const massGenerationActive = isGlobalActive || (category !== "Daily" && selectedCourse === "all");

  const [form, setForm] = useState({
    type: "mcq", // "mcq" or "coding"
    question: "",
    options: ["", "", "", ""],
    answer: "",
    language: "python",
    testCases: [{ input: "", output: "" }],
    marks: 2, // default marks
  });

  const BASE_URL = `http://${window.location.hostname}:8000/api/admin/exam-settings/`;

  // Fetch existing settings when category changes
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await authenticatedRequest('get', BASE_URL, null, { category, course: selectedCourse });
        if (res.data && res.data.success && res.data.data) {
          const { maxQuestions: savedMax, questions: savedQuestions, passingRule: rule, passingValue: val, duration: savedDuration } = res.data.data;
          setMaxQuestions(savedMax || 50);
          setQuestions(savedQuestions || []);
          setPassingRule(rule || "percentage");
          setPassingValue(val !== undefined ? val : 50);
          setDuration(savedDuration || 45);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };
    fetchSettings();
  }, [category, selectedCourse]);

  // handle input
  const handleChange = (e) => {
    setForm({ ...form, question: e.target.value });
  };

  // handle option change
  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm({ ...form, options: newOptions });
  };

  // handle answer select
  const handleAnswer = (opt) => {
    setForm({ ...form, answer: opt });
  };

  // handle test case change
  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...form.testCases];
    newTestCases[index][field] = value;
    setForm({ ...form, testCases: newTestCases });
  };

  const addTestCase = () => {
    setForm({ ...form, testCases: [...form.testCases, { input: "", output: "" }] });
  };

  const removeTestCase = (index) => {
    const newTestCases = form.testCases.filter((_, i) => i !== index);
    setForm({ ...form, testCases: newTestCases });
  };

  // Save Exam Rules & Questions (The Final "CONFIRM" Action)
  const handleConfirmSettings = async () => {
    if (previewMode && selectedPreviewQuestions.length === 0) {
      toast.error("No questions in preview to confirm!");
      return;
    }

    setIsSaving(true);
    try {
      const isDaily = category === "Daily";
      const targetCourse = isDaily ? examCourseName : selectedCourse;
      const targetSubjects = isDaily ? examSubjects : (selectedCourse === "all" ? getAllSubjects() : getSubjectsForCourse(selectedCourse));

      // 🏗️ Step 1: Save Automated Config (Backend Rules)
      const configPayload = {
        category: category,
        course_name: String(targetCourse || "").trim().toUpperCase(),
        exam_name: isDaily ? examName : `${category} Assessment`,
        subjects: targetSubjects,
        duration: parseInt(isDaily ? examDuration : duration, 10) || 45,
        passing_strategy: isDaily ? examStrategy : passingRule,
        requirement: parseInt(isDaily ? examRequirement : passingValue, 10) || 50,
        question_count: selectedPreviewQuestions.length || parseInt(isDaily ? examQuestionCount : maxQuestions, 10) || 25,
        marks_per_question: isDaily ? parseInt(examMarksPerQuestion) : 2
      };
      
      await authenticatedRequest('post', `http://${window.location.hostname}:8000/api/automated-exam-config/`, configPayload);

      // 🏗️ Step 2: Save Assessment Rules (General Dashboard Rules)
      const settingsPayload = {
        category: category,
        course: targetCourse,
        maxQuestions: configPayload.question_count,
        duration: configPayload.duration,
        passingRule: configPayload.passing_strategy,
        passingValue: configPayload.requirement,
        marks_per_question: configPayload.marks_per_question
      };
      
      await authenticatedRequest('post', BASE_URL, settingsPayload);

      // 🏗️ Step 3: Map Previewed Questions to the Assessment (Persistent Sync)
      if (selectedPreviewQuestions.length > 0) {
        await saveQuestionsToBackend(selectedPreviewQuestions, category);
      }
      
      setSettingsSaved(true);
      setPreviewMode(false);
      setSelectedPreviewQuestions([]); // Clear preview after success
      
      toast.success(`DEPLOYED: ${category} Assessment for ${targetCourse} is now LIVE!`, { 
        position: "top-right", 
        theme: "colored",
        autoClose: 5000
      });
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error("Finalization failed:", err);
      toast.error("An error occurred during finalization.");
    } finally {
      setIsSaving(false);
    }
  };

  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [autoGenSuccess, setAutoGenSuccess] = useState(false);

  // 🛡️ 1000% MASTER AUTOMATION ENGINE: PREVIEW & SELECTION
  const handleAutoGenerate = async () => {
    const isDaily = category === "Daily";
    const targetCourse = isDaily ? examCourseName : selectedCourse;

    if (targetCourse === "all" || targetCourse === "ALL") {
      toast.info("Please select a specific course or use 'Global Generation' mode.");
      return;
    }
    
    // Respect the UI input for count, defaulting to 80 for high-stakes if empty
    const count = parseInt(isDaily ? examQuestionCount : maxQuestions) || (category === "Weekly" || category === "Monthly" ? 80 : 12);
    
    let targetSubjects = [];
    if (isDaily) {
      targetSubjects = examSubjects;
    } else {
      targetSubjects = (selectedCourse === "all") ? getAllSubjects() : getSubjectsForCourse(selectedCourse);
    }

    if (targetSubjects.length === 0 && !isDaily) {
       // For Weekly/Monthly we can proceed with course name if subjects are missing
       targetSubjects = [targetCourse];
    }
    
    if (targetSubjects.length === 0 && isDaily) {
      toast.warn("Please select subjects to generate preview!", { position: "top-center" });
      return;
    }
    
    setIsAutoGenerating(true);
    setPreviewMode(false);
    
    try {
      // 🚀 SYSTEM AUTO-ADD: Use the rich QuestionBank generator with subject awareness
      const generatedQuestions = getQuestionBank(targetCourse, count, category, targetSubjects);
      
      // Shuffle them further to ensure randomness for every click
      const shuffled = [...generatedQuestions].sort(() => 0.5 - Math.random());
      
      // Update state
      setSelectedPreviewQuestions(shuffled);
      setPreviewMode(true);
      
      toast.success(`SYSTEM AUTO-ADD: ${shuffled.length} unique questions generated for ${targetCourse} [${category}].`, { 
        icon: "🔮",
        position: "top-right"
      });

      // Persist them 
      setQuestions(shuffled);
      // saveQuestionsToBackend(shuffled, category); // Optional: developer can decide if they want to save immediately or wait for confirm

      setTimeout(() => {
        document.getElementById('exam-preview-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);

    } catch (err) {
      console.error("Internal process failure:", err);
      toast.error("Process error: Check console for details.");
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const handleGlobalGenerate = async () => {
    if (!window.confirm(`Are you sure you want to generate ${category} assessments for ALL courses?`)) return;
    
    setIsAutoGenerating(true);
    try {
      const config = getAuthHeader();
      if (!config.headers) throw new Error("Authentication missing. Please re-login.");

      const isDaily = category === "Daily";

      for (const courseObj of fullCourseObjects) {
        const title = courseObj.title || courseObj;
        const subs = getSubjectsForCourse(title);
        
        if (subs.length > 0) {
            const payload = {
                category: category,
                course_name: String(title).trim().toUpperCase(),
                exam_name: isDaily ? examName : `${category} Assessment`,
                subjects: subs,
                duration: parseInt(isDaily ? examDuration : duration) || 45,
                passing_strategy: isDaily ? examStrategy : passingRule,
                requirement: parseInt(isDaily ? examRequirement : passingValue) || 50,
                question_count: parseInt(isDaily ? examQuestionCount : maxQuestions) || 25,
                marks_per_question: isDaily ? parseInt(examMarksPerQuestion) : 2
            };
            await authenticatedRequest('post', `http://${window.location.hostname}:8000/api/automated-exam-config/`, payload);
            
            // 🚀 NEW: Bulk add 80 questions to database for this course
            const bulkQuestions = getQuestionBank(title, 80, category, subs);
            await saveQuestionsToBackend(bulkQuestions, category, title);
        }
      }
      
      setAutoGenSuccess(true);
      toast.success(`All ${category} assessments generated successfully`, { 
        position: "top-right",
        autoClose: 3000,
        theme: "colored" 
      });
      setTimeout(() => setAutoGenSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to generate global assessments:", err);
      toast.error("Global generation failed.");
    } finally {
      setIsAutoGenerating(false);
    }
  };


  const saveQuestionsToBackend = async (questionsToSave, categoryToSave, optionalCourse = null) => {
    setIsQuestionsSaving(true);
    try {
      const isDaily = categoryToSave === "Daily";
      const targetCourse = optionalCourse || (isDaily ? examCourseName : selectedCourse);
      
      const payload = {
        category: categoryToSave,
        course: targetCourse,
        subject: "Full Track",
        questions: questionsToSave
      };

      const res = await authenticatedRequest('post', BASE_URL, payload);
      if (res.data && res.data.success) {
        console.log("✅ Questions synced to " + categoryToSave);
      } else {
        console.error("Failed to sync questions:", res.data.message);
      }
    } catch (err) {
      console.error("Failed to save questions:", err);
    } finally {
      setIsQuestionsSaving(false);
    }
  };

  // add question
  const addQuestion = () => {
    if (!form.question) {
      console.error("Fill the question field!");
      return;
    }

    if (form.type === "mcq" && !form.answer) {
      console.error("Select the correct answer for MCQ!");
      return;
    }

    const newQuestionArray = [...questions, { ...form, id: Date.now() }];
    setQuestions(newQuestionArray);
    saveQuestionsToBackend(newQuestionArray, category);

    // reset form
    setForm({
      type: "mcq",
      question: "",
      options: ["", "", "", ""],
      answer: "",
      marks: 2,
      language: "python",
      testCases: [{ input: "", output: "" }],
    });
  };

  // delete question
  const deleteQuestion = (id) => {
    // if (!window.confirm("Are you sure you want to delete this question?")) return;
    const updatedQuestions = questions.filter((q) => q.id !== id);
    setQuestions(updatedQuestions);
    saveQuestionsToBackend(updatedQuestions, category);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-20">

      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
         <FontAwesomeIcon icon={faHistory} className="text-blue-600" />
         Exam Manager
      </h1>


      {/* EXAM RULES & SETTINGS (GLOBAL CONFIG) */}
      <div key={`rules-config-${category}`} className="bg-white p-6 shadow-lg rounded-2xl mb-8 border border-gray-100 ring-1 ring-gray-200">
        <h2 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
           <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
           Assessment Rules & Configuration
        </h2>
        
        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          
          <div>
            <label className="block text-xs font-black uppercase text-blue-900 mb-2 tracking-wider">
              Exam Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                const newCat = e.target.value;
                setCategory(newCat);
                // 🛡️ INTERNAL SYNC LOCK: Force Global re-alignment on category switch
                if (newCat === "Daily" && (examCourseName === "ALL" || isGlobalMode)) {
                   setIsGlobalMode(true);
                   setExamCourseName("ALL");
                }
              }}
              className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
            >
              <option value="Daily">Daily Exam</option>
              <option value="Weekly">Weekly Exam</option>
              <option value="Monthly">Monthly Exam</option>
            </select>
          </div>

          {category === "Daily" ? (
            <React.Fragment key={`daily-view-${isGlobalActive}`}>
              <div>
                <label className="block text-xs font-black uppercase text-blue-900 mb-2 tracking-wider">
                  Target Course Name
                </label>
                <select
                  value={isGlobalActive ? "ALL" : examCourseName}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "ALL") {
                      setIsGlobalMode(true);
                      setExamCourseName("ALL");
                      localStorage.setItem("last_exam_course", "ALL");
                      localStorage.setItem("last_exam_is_global", "true");
                    } else {
                      setIsGlobalMode(false);
                      setExamCourseName(val);
                      localStorage.setItem("last_exam_course", val);
                      localStorage.setItem("last_exam_is_global", "false");
                    }
                  }}
                  className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm font-bold text-blue-700"
                >
                  <option value="ALL">--- ALL COURSES (Bulk Generation) ---</option>
                  {courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-blue-900 mb-2 tracking-wider">
                  SUBJECTS SCOPE
                </label>
                {!isGlobalActive ? (
                  <div className="space-y-4">
                    {/* Header with quick actions */}
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                        {examSubjects.length} of {availableSubjects.length} subjects active
                      </span>
                      {availableSubjects.length > 0 && (
                        <button 
                          onClick={() => {
                            if (examSubjects.length === availableSubjects.length) setExamSubjects([]);
                            else setExamSubjects([...availableSubjects]);
                          }}
                          className="text-[10px] font-black text-blue-600 uppercase hover:text-blue-800 transition-colors bg-blue-50 px-2 py-1 rounded-md border border-blue-100"
                        >
                          {examSubjects.length === availableSubjects.length ? "Deselect All" : "Select All"}
                        </button>
                      )}
                    </div>

                    {/* Checkbox Grid */}
                    <div className="min-h-[100px] max-h-[160px] overflow-y-auto p-3 bg-white rounded-xl border border-blue-100 shadow-inner grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                       {availableSubjects.length > 0 ? (
                         availableSubjects.map((s, i) => (
                           <button
                             key={i}
                             onClick={() => {
                               if (examSubjects.includes(s)) {
                                 setExamSubjects(examSubjects.filter(it => it !== s));
                               } else {
                                 setExamSubjects([...examSubjects, s]);
                               }
                             }}
                             className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left group ${
                               examSubjects.includes(s) 
                               ? 'bg-blue-600 border-blue-700 shadow-md transform scale-[1.02]' 
                               : 'bg-gray-50 border-gray-100 hover:border-blue-300 hover:bg-white'
                             }`}
                           >
                              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                examSubjects.includes(s) 
                                ? 'bg-white border-white' 
                                : 'bg-white border-gray-200 group-hover:border-blue-400'
                              }`}>
                                {examSubjects.includes(s) && (
                                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm animate-in zoom-in duration-200"></div>
                                )}
                              </div>
                              <span className={`text-[11px] font-bold truncate tracking-tight ${
                                examSubjects.includes(s) ? 'text-white' : 'text-gray-700'
                              }`}>
                                {s}
                              </span>
                           </button>
                         ))
                       ) : (
                         <div className="col-span-full h-20 flex flex-col items-center justify-center text-blue-400 italic bg-blue-50/50 rounded-lg border border-dashed border-blue-200">
                            <FontAwesomeIcon icon={faInfoCircle} className="mb-2 text-lg opacity-50" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-center px-2">please fill your subjects in faculty course page</span>
                         </div>
                       )}
                    </div>

                    {/* Status Message */}
                    {examSubjects.length === 0 && availableSubjects.length > 0 && (
                      <div className="flex items-center gap-2 text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded-lg border border-amber-100 animate-pulse">
                         <FontAwesomeIcon icon={faInfoCircle} />
                         Please select at least one subject to enable generation
                      </div>
                    )}
                  </div>
                ) : (
                    <div 
                      className="w-full h-[45px] px-4 flex items-center justify-between border border-blue-200 rounded-lg bg-blue-50/30 shadow-sm cursor-not-allowed"
                    >
                      <span className="text-[13px] font-extrabold text-blue-800 uppercase italic tracking-wider">
                          all subjects
                      </span>
                      <div className="text-blue-500 font-bold">
                          ✔
                      </div>
                    </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-blue-900 mb-2 tracking-wider">
                   Duration (Mins)
                </label>
                <input
                  type="number"
                  min="1"
                  value={examDuration}
                  onChange={(e) => setExamDuration(e.target.value)}
                  className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-blue-900 mb-2 tracking-wider">
                  Passing Strategy
                </label>
                <select
                  value={examStrategy}
                  onChange={(e) => setExamStrategy(e.target.value)}
                  className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm font-bold"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="correct_answers">Correct Answers</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-blue-900 mb-2 tracking-wider flex justify-between items-center">
                  Requirement
                  <span className="text-[10px] font-bold text-gray-400 normal-case">
                    {examStrategy === 'percentage' ? '(Min %)' : '(Min Answers)'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={examRequirement}
                    onChange={(e) => setExamRequirement(e.target.value)}
                    className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm font-bold"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500 uppercase tracking-tighter bg-blue-50 px-2 py-1 rounded">
                     {examStrategy === 'percentage' ? '%' : 'Correct'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-blue-900 mb-2 tracking-wider flex justify-between items-center">
                  Question Number
                  <span className="text-[10px] font-bold text-gray-400 normal-case">(Total)</span>
                </label>
                <input
                  type="number"
                  value={examQuestionCount}
                  onChange={(e) => setExamQuestionCount(e.target.value)}
                  className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-blue-900 mb-2 tracking-wider flex justify-between items-center">
                  Marks per question
                  <span className="text-[10px] font-bold text-gray-400 normal-case">(Weight)</span>
                </label>
                <input
                  type="number"
                  value={examMarksPerQuestion}
                  onChange={(e) => setExamMarksPerQuestion(e.target.value)}
                  className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm font-bold"
                />
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment key="weekly-view-container">
              <div>
                <label className="block text-xs font-black uppercase text-blue-900 mb-2 tracking-wider">
                  Target Course Track
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
                >
                  <option value="all">All Courses</option>
                  {courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>


              <div>
                <label className="block text-xs font-black uppercase text-blue-900 mb-2 tracking-wider">
                  Max Questions To Display
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxQuestions}
                  onChange={(e) => setMaxQuestions(e.target.value)}
                  className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-blue-900 mb-2 tracking-wider">
                   Duration (Mins)
                </label>
                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-blue-900 mb-2 tracking-wider">
                  Passing Strategy
                </label>
                <select
                  value={passingRule}
                  onChange={(e) => setPassingRule(e.target.value)}
                  className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="correct_answers">Correct Answers</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-blue-900 mb-2 tracking-wider">
                  Requirement
                </label>
                <input
                  type="number"
                  value={passingValue}
                  onChange={(e) => setPassingValue(e.target.value)}
                  className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
                  placeholder=""
                />
              </div>
            </React.Fragment>
          )}

        </div>

        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <div></div>

          <div className="flex gap-3">
            {/* AUTO GENERATION BUTTON */}
            <button
              onClick={massGenerationActive ? handleGlobalGenerate : handleAutoGenerate}
              disabled={isAutoGenerating}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all border flex items-center gap-2 shadow-lg ${
                autoGenSuccess 
                ? 'bg-green-500 text-white border-green-600' 
                : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-700 active:scale-95'
              }`}
            >
              {isAutoGenerating ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : autoGenSuccess ? (
                <FontAwesomeIcon icon={faCheckCircle} />
              ) : (
                <FontAwesomeIcon icon={faSave} />
              )}
              {autoGenSuccess ? "Generated!" : "Auto Generate"}
            </button>

            {/* 💾 SETTINGS CONFIRM BUTTON */}
            <button
              onClick={() => handleConfirmSettings()}
              disabled={isSaving}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md ${
                settingsSaved 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-blue-600 hover:bg-blue-700 text-white border-blue-700 active:scale-95"
              } ${isSaving ? "opacity-75 cursor-wait" : ""}`}
            >
              {isSaving ? (
                <> <FontAwesomeIcon icon={faSpinner} spin /> Saving... </>
              ) : settingsSaved ? (
                <> <FontAwesomeIcon icon={faCheckCircle} /> Saved </>
              ) : (
                <> <FontAwesomeIcon icon={faSave} /> Confirm </>
              )}
            </button>
          </div>
        </div>

      </div>


      {/* 👁️ GENERATED QUESTIONS PREVIEW */}
      {previewMode && selectedPreviewQuestions.length > 0 && (
        <div id="exam-preview-section" className="bg-white p-8 shadow-2xl rounded-[2.5rem] mb-12 border-4 border-purple-100 ring-1 ring-purple-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                <span className="bg-purple-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                  <FontAwesomeIcon icon={faCheckCircle} />
                </span>
                Generated Preview: {selectedPreviewQuestions.length} Items
              </h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1 ml-13">Verification Required Before Final Deployment</p>
            </div>
            <div className="flex gap-3">
               <button 
                 onClick={() => setPreviewMode(false)}
                 className="px-6 py-3 rounded-xl bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all"
               >
                 Cancel Preview
               </button>
               <button 
                 onClick={handleConfirmSettings}
                 disabled={isSaving}
                 className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-purple-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
               >
                 {isSaving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheckCircle} />}
                 Confirm & Deploy Exam
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {selectedPreviewQuestions.map((q, idx) => (
              <div key={idx} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 hover:border-purple-200 transition-colors relative group">
                <div className="flex items-start gap-4">
                  <span className="shrink-0 bg-white w-8 h-8 rounded-xl border border-gray-100 flex items-center justify-center text-xs font-black text-purple-600 shadow-sm">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[9px] font-black px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md uppercase tracking-wider">
                         {q.subject || q.category || "General"}
                       </span>
                       <span className="text-[9px] font-black px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md uppercase tracking-wider">
                         {q.type?.toUpperCase() || "MCQ"}
                       </span>
                    </div>
                    <h3 className="font-bold text-gray-800 leading-snug mb-4">{q.question}</h3>
                    
                    {q.type === 'coding' ? (
                      <div className="bg-white p-4 rounded-2xl border border-gray-100">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Test Cases:</p>
                         <div className="grid grid-cols-2 gap-4">
                           {q.testCases?.map((tc, tidx) => (
                             <div key={tidx} className="text-[10px] font-mono bg-gray-50 p-2 rounded-lg">
                               <div className="text-blue-500">In: {tc.input}</div>
                               <div className="text-green-600">Out: {tc.output}</div>
                             </div>
                           ))}
                         </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options?.map((opt, oidx) => (
                          <div key={oidx} className={`p-3 rounded-2xl text-xs font-bold border transition-all flex items-center gap-3 ${
                            opt === q.answer || oidx === q.correct
                            ? "bg-green-500 text-white border-green-600 shadow-md shadow-green-100"
                            : "bg-white text-gray-500 border-gray-100"
                          }`}>
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${opt === q.answer || oidx === q.correct ? 'bg-white/20 border-white' : 'bg-gray-50 border-gray-100'}`}>
                               {String.fromCharCode(65 + oidx)}
                            </div>
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setSelectedPreviewQuestions(selectedPreviewQuestions.filter((_, i) => i !== idx));
                  }}
                  className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
             <button 
               onClick={handleConfirmSettings}
               disabled={isSaving}
               className="px-12 py-4 rounded-2xl bg-black text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-800 transition-all flex items-center gap-3 active:scale-95"
             >
               {isSaving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
               Confirm All & Activate {category} Exam
             </button>
          </div>
        </div>
      )}


      {/* QUESTION FORM */}
      <div className="bg-white p-6 shadow-lg rounded-2xl mb-8 border border-gray-100 ring-1 ring-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
             <FontAwesomeIcon icon={faPlus} className="text-green-500" />
             Add MCQ Assessment Questions
          </h2>
        </div>
        
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1 mb-1 block">Question Prompt</label>
            <textarea
              placeholder="Type your question or coding problem statement here..."
              value={form.question}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50/50 resize-none"
            />
          </div>
          <div style={{ width: "120px" }}>
             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1 mb-1 block">Marks</label>
             <input
               type="number"
               value={form.marks}
               onChange={(e) => setForm({...form, marks: parseInt(e.target.value) || 0})}
               className="w-full p-3 border rounded-lg bg-gray-50/50"
             />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {form.options.map((opt, i) => (
            <div key={i}>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1 mb-1 block">Option {String.fromCharCode(65 + i)}</label>
              <input
                type="text"
                placeholder={`Choice ${String.fromCharCode(65 + i)}`}
                value={opt}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                className="w-full p-2.5 border border-gray-100 rounded-lg focus:ring-1 focus:ring-blue-300 bg-gray-50/50"
              />
            </div>
          ))}
        </div>

        {/* Correct Answer Selection */}
        <div className="mb-6 p-4 bg-blue-50/30 rounded-xl border border-dashed border-blue-200">
          <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
            Correct Answer Key
          </p>
          <div className="flex flex-wrap gap-2">
            {form.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAnswer(opt)}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                  form.answer === opt && opt !== ""
                    ? "bg-green-600 text-white border-green-700 shadow-lg ring-2 ring-green-100"
                    : "bg-white text-gray-400 border-gray-100 hover:border-gray-300 shadow-sm"
                }`}
              >
                {String.fromCharCode(65 + i)}. {opt || `Option ${String.fromCharCode(65 + i)}`}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={addQuestion}
          disabled={isQuestionsSaving}
          className="bg-gray-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg flex items-center gap-2"
        >
          {isQuestionsSaving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPlus} />}
          Add Question to Bank
        </button>
      </div>

      {/* QUESTION LIST */}
      <div className="mt-12 mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
          Current {selectedCourse} - {category} Questions
          {isQuestionsSaving && <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-sm" />}
        </h2>
        <span className="bg-blue-600 text-white px-5 py-2 rounded-full text-xs font-black shadow-lg shadow-blue-100 flex items-center gap-2 uppercase tracking-tighter">
          Total Content: {questions.length} / {maxQuestions}
        </span>
      </div>

      <div className="space-y-6">
        {questions.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
             <FontAwesomeIcon icon={faInfoCircle} className="text-4xl text-gray-300 mb-2" />
             <p className="text-gray-400 font-medium">No assessment questions found in the {category} category.</p>
          </div>
        )}

        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-6 shadow-md rounded-2xl border border-gray-50 hover:shadow-xl transition-shadow relative group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-gray-100 text-gray-600 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black">
                    {index + 1}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${q.type === 'coding' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                    {q.type === 'coding' ? `Coding (${q.language})` : 'MCQ'} • {q.marks || 2} Marks
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-4 tracking-tight leading-snug whitespace-pre-wrap">
                  {q.question}
                </h3>

                {q.type === 'coding' ? (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Test Cases:</p>
                    <div className="grid grid-cols-2 gap-4">
                      {q.testCases?.map((tc, idx) => (
                        <div key={idx} className="text-xs font-mono bg-white p-2 rounded border border-gray-200">
                          <div className="text-blue-500 mb-1">In: {tc.input || "Empty"}</div>
                          <div className="text-green-600">Out: {tc.output}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-sm flex items-center gap-2 ${
                          opt === q.answer 
                          ? "bg-green-50 border-green-200 text-green-700 font-bold shadow-sm" 
                          : "bg-white border-gray-100 text-gray-500"
                        }`}
                      >
                        {opt === q.answer && <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />}
                        <span className="opacity-60">{String.fromCharCode(65 + i)}.</span> {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => deleteQuestion(q.id)}
                className="text-red-300 hover:text-red-500 transition-colors p-2"
                title="Purge this item"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <ToastContainer />
    </div>
  );
}

export default ExamManager;
