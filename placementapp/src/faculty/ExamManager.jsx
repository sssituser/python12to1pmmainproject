import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faTrash, faEdit, faEye, faSearch, faSpinner,
  faRobot, faShieldAlt, faClock, faGraduationCap, faCamera,
  faLock, faUsers, faCalendarAlt, faTrophy, faCheck,
  faLayerGroup, faPaperPlane, faCheckCircle, faTimesCircle,
  faFileExport, faUpload, faKeyboard, faBolt, faToggleOn,
  faClipboardList, faBook, faChartBar, faExclamationTriangle,
  faStopwatch, faGlobe, faDatabase, faTimes, faArrowRight,
  faArrowLeft, faPercent, faFileAlt, faBrain, faCog
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSEO } from "../utils/useSEO";

const API_BASE = `http://${window.location.hostname}:8000/api`;
const EXAM_TYPES = [
  { value:"daily",label:"Daily Exam",icon:"📅" },
  { value:"weekly",label:"Weekly Exam",icon:"📆" },
  { value:"monthly",label:"Monthly Exam",icon:"🗓️" },
  { value:"placement",label:"Placement Assessment",icon:"🎯" },
  { value:"mock",label:"Mock Interview",icon:"🎭" },
  { value:"certification",label:"Certification",icon:"🏆" },
];
const DEPARTMENTS = ["CSE","IT","ECE","EEE","MECH","CIVIL","MBA","MCA"];
const YEARS = ["1st Year","2nd Year","3rd Year","4th Year","All Years"];
const STEPS = [
  {id:1,label:"Basic Info",icon:faBook},
  {id:2,label:"Config",icon:faCog},
  {id:3,label:"Questions",icon:faKeyboard},
  {id:4,label:"Proctoring",icon:faCamera},
  {id:5,label:"Browser Lock",icon:faLock},
  {id:6,label:"Schedule",icon:faCalendarAlt},
  {id:7,label:"Results",icon:faTrophy},
  {id:8,label:"Publish",icon:faPaperPlane},
];

// ─── Small reusable components ─────────────────────────────────────────────
const Toggle = ({ value, onChange, label, desc }) => (
  <div onClick={() => onChange(!value)} style={{
    display:"flex", alignItems:"center", gap:12, padding:"14px 16px",
    borderRadius:12, cursor:"pointer", userSelect:"none",
    background: value ? "#eef2ff" : "#f8fafc",
    border:`1.5px solid ${value ? "#6366f1" : "#e2e8f0"}`, transition:"all 0.2s"
  }}>
    <div style={{
      width:40, height:22, borderRadius:11, position:"relative",
      background: value ? "#6366f1" : "#cbd5e1", transition:"background 0.2s", flexShrink:0
    }}>
      <div style={{
        position:"absolute", top:3, left: value ? 21 : 3,
        width:16, height:16, borderRadius:"50%", background:"#fff",
        boxShadow:"0 1px 3px rgba(0,0,0,0.2)", transition:"left 0.2s"
      }} />
    </div>
    <div>
      <div style={{fontWeight:700, fontSize:13, color:"#1e293b"}}>{label}</div>
      {desc && <div style={{fontSize:11, color:"#94a3b8", marginTop:2}}>{desc}</div>}
    </div>
  </div>
);

const NumInput = ({ label, value, onChange, min=0, max=999, unit="" }) => (
  <div>
    <label style={{display:"block",fontSize:10,fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{label}</label>
    <div style={{display:"flex",alignItems:"center",background:"#f1f5f9",borderRadius:10,overflow:"hidden",border:"1.5px solid #e2e8f0"}}>
      <button onClick={() => onChange(Math.max(min, value-1))} style={{padding:"10px 14px",background:"none",border:"none",cursor:"pointer",color:"#64748b",fontSize:16,fontWeight:800}}>−</button>
      <input type="number" value={value} min={min} max={max} onChange={e => onChange(Math.max(min,Math.min(max,parseInt(e.target.value)||0)))}
        style={{flex:1,textAlign:"center",background:"none",border:"none",outline:"none",fontWeight:800,fontSize:15,color:"#1e293b"}} />
      {unit && <span style={{color:"#94a3b8",fontSize:11,paddingRight:8}}>{unit}</span>}
      <button onClick={() => onChange(Math.min(max, value+1))} style={{padding:"10px 14px",background:"none",border:"none",cursor:"pointer",color:"#64748b",fontSize:16,fontWeight:800}}>+</button>
    </div>
  </div>
);

const TagSelector = ({ options, selected, onChange }) => (
  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
    {options.map(opt => {
      const active = selected.includes(opt);
      return <button key={opt} onClick={() => onChange(active ? selected.filter(s=>s!==opt) : [...selected,opt])}
        style={{padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer",
          background:active?"#6366f1":"#f1f5f9",color:active?"#fff":"#64748b",
          border:`1.5px solid ${active?"#6366f1":"#e2e8f0"}`,transition:"all 0.15s"}}>{opt}</button>;
    })}
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ExamManager() {
  useSEO("Exam Manager", "Create, manage, and monitor assessments with proctoring & browser security.");
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Action modal states
  const [viewExam, setViewExam] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Step 1
  const [examTitle, setExamTitle] = useState("");
  const [examType, setExamType] = useState("daily");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState("ALL COURSES");

  // Step 2
  const [duration, setDuration] = useState(60);
  const [totalQuestions, setTotalQuestions] = useState(30);
  const [totalMarks, setTotalMarks] = useState(30);
  const [passMarks, setPassMarks] = useState(15);
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [negativeMarks, setNegativeMarks] = useState(0.25);

  // Step 3
  const [questionSource, setQuestionSource] = useState("manual");
  const [questions, setQuestions] = useState([]);
  const [qText, setQText] = useState("");
  const [qOptions, setQOptions] = useState(["","","",""]);
  const [qCorrect, setQCorrect] = useState(0);
  const [qDifficulty, setQDifficulty] = useState("medium");
  const [qMarks, setQMarks] = useState(1);
  const [autoEasy, setAutoEasy] = useState(10);
  const [autoMedium, setAutoMedium] = useState(15);
  const [autoHard, setAutoHard] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState([]);

  // Step 4
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(true);
  const [preventBacktrack, setPreventBacktrack] = useState(false);

  // Step 5
  const [webcamRequired, setWebcamRequired] = useState(false);
  const [faceDetection, setFaceDetection] = useState(false);
  const [multiFaceDetection, setMultiFaceDetection] = useState(false);
  const [screenshotInterval, setScreenshotInterval] = useState(30);

  // Step 6
  const [fullscreenRequired, setFullscreenRequired] = useState(true);
  const [tabSwitchLimit, setTabSwitchLimit] = useState(3);
  const [disableCopyPaste, setDisableCopyPaste] = useState(true);
  const [disableRightClick, setDisableRightClick] = useState(true);
  const [autoSubmit, setAutoSubmit] = useState(true);
  const [riskThreshold, setRiskThreshold] = useState(50);

  // Step 7
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [maxAttempts, setMaxAttempts] = useState(1);

  // Step 8
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [sendNotification, setSendNotification] = useState(true);

  // Step 9
  const [showResultImmediately, setShowResultImmediately] = useState(true);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [certificateEnabled, setCertificateEnabled] = useState(false);

  const [dynamicSubjects, setDynamicSubjects] = useState([]);
  const [dynamicCourses, setDynamicCourses] = useState([]);
  const [customSubjectInput, setCustomSubjectInput] = useState(false);
  const [customCourseInput, setCustomCourseInput] = useState(false);

  useEffect(() => { 
    fetchExams(); 
    fetchDynamicCoursesAndSubjects();
  }, []);

  const fetchDynamicCoursesAndSubjects = async () => {
    try {
      const token = localStorage.getItem("access")?.replace(/^"|"$/g, "");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE}/student/courses/`, { headers });
      if (res.data && (res.data.data || Array.isArray(res.data))) {
        const list = res.data.data || res.data;
        const fetchedTitles = list.map(c => typeof c === 'string' ? c : c.title).filter(Boolean);
        if (fetchedTitles.length > 0) {
          const uniqueCourses = Array.from(new Set(fetchedTitles));
          setDynamicCourses(uniqueCourses);

          // Extract topics / module subjects dynamically from courses
          const derivedSubjects = [];
          list.forEach(c => {
            if (c.title) derivedSubjects.push(c.title.toUpperCase());
            if (Array.isArray(c.topics)) {
              c.topics.forEach(t => {
                if (typeof t === 'string') derivedSubjects.push(t.toUpperCase());
                else if (t && t.title) derivedSubjects.push(t.title.toUpperCase());
                else if (t && t.name) derivedSubjects.push(t.name.toUpperCase());
              });
            }
            if (Array.isArray(c.modules)) {
              c.modules.forEach(m => {
                if (typeof m === 'string') derivedSubjects.push(m.toUpperCase());
                else if (m && m.title) derivedSubjects.push(m.title.toUpperCase());
                else if (m && m.name) derivedSubjects.push(m.name.toUpperCase());
              });
            }
          });

          const uniqueSubjects = Array.from(new Set(derivedSubjects.filter(Boolean)));
          setDynamicSubjects(uniqueSubjects);

          if (uniqueSubjects.length > 0 && !subject) setSubject(uniqueSubjects[0]);
          if (uniqueCourses.length > 0 && !course) setCourse(uniqueCourses[0]);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch dynamic courses:", e);
    }
  };

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/exams/list/`);
      setExams(res.data || []);
    } catch { setExams([]); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setStep(1); setExamTitle(""); setExamType("daily"); setSubject("PYTHON");
    setTopic(""); setDescription(""); setQuestions([]); setQText("");
    setQOptions(["","","",""]); setQCorrect(0);
  };

  const openModal = () => { resetForm(); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const handleAddQuestion = () => {
    if (!qText.trim()) { toast.error("Enter question text!"); return; }
    if (qOptions.some(o=>!o.trim())) { toast.error("Fill all 4 options!"); return; }
    setQuestions(p => [...p, {id:Date.now(),question:qText.trim(),options:[...qOptions],correct:qCorrect,difficulty:qDifficulty,marks:qMarks,subject}]);
    setQText(""); setQOptions(["","","",""]); setQCorrect(0);
    toast.success("Question added!");
  };

  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await axios.post(`${API_BASE}/exams/auto-generate/`, {title:examTitle||"Auto",subject,easy_count:autoEasy,medium_count:autoMedium,hard_count:autoHard,duration});
      if (res.data.status==="success") {
        const pr = await axios.get(`${API_BASE}/exams/paper/${res.data.paper_id}/`);
        if (pr.data.questions) {
          setQuestions(pr.data.questions.map(q=>({id:q.id,question:q.question_text,options:q.choices.map(c=>c.choice_text),correct:0,difficulty:q.difficulty,marks:q.marks,subject})));
          toast.success(`✅ Auto-generated ${pr.data.questions.length} questions!`);
        }
      }
    } catch { toast.error("Auto-generation failed. Ensure questions exist in Question Bank."); }
    finally { setIsGenerating(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);
    setParsedQuestions([]);
    try {
      const res = await axios.post(`${API_BASE}/exams/import-file/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.status === "success" && res.data.questions) {
        setParsedQuestions(res.data.questions);
        toast.success(`Successfully parsed ${res.data.questions.length} questions!`);
      } else {
        toast.error("Failed to parse file or no questions found.");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Error uploading/parsing file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedQuestions.length === 0) return;
    setQuestions(prev => [
      ...prev,
      ...parsedQuestions.map((q, idx) => ({
        id: Date.now() + idx,
        question: q.question,
        options: q.options,
        correct: q.correct,
        difficulty: q.difficulty || "medium",
        marks: q.marks || marksPerQuestion,
        subject
      }))
    ]);
    setParsedQuestions([]);
    toast.success("Questions added to exam draft!");
  };

  const handlePublish = async () => {
    if (!examTitle.trim()) { toast.error("Exam title required!"); setStep(1); return; }
    setIsPublishing(true);
    try {
      const token = localStorage.getItem("access")?.replace(/^"|"$/g,"");
      const authHeader = (token && token !== "null" && token !== "undefined") ? { Authorization: `Bearer ${token}` } : {};

      await axios.post(`${API_BASE}/exams/create/`, {
        title:examTitle, exam_type:examType, subject, topic, description, course_name:course,
        duration, total_questions:questions.length||totalQuestions, total_marks:totalMarks,
        pass_marks:passMarks, marks_per_question:marksPerQuestion,
        negative_marking:negativeMarking, negative_marks:negativeMarks,
        randomize_questions:randomizeQuestions, randomize_options:randomizeOptions, prevent_backtrack:preventBacktrack,
        webcam_required:webcamRequired, face_detection:faceDetection, multi_face_detection:multiFaceDetection, screenshot_interval:screenshotInterval,
        fullscreen_required:fullscreenRequired, tab_switch_limit:tabSwitchLimit, disable_copy_paste:disableCopyPaste, disable_right_click:disableRightClick,
        auto_submit:autoSubmit, risk_threshold:riskThreshold,
        departments:selectedDepts, years:selectedYears, max_attempts:maxAttempts,
        start_time:startTime||null, end_time:endTime||null, send_notification:sendNotification,
        show_result_immediately:showResultImmediately, show_correct_answers:showCorrectAnswers,
        show_leaderboard:showLeaderboard, certificate_enabled:certificateEnabled,
        questions
      }, { headers: authHeader });

      toast.success("🚀 Exam published and is LIVE!");
      closeModal();
      fetchExams();
    } catch (e) {
      console.error(e);
      toast.error("Failed to publish exam.");
    } finally { setIsPublishing(false); }
  };

  // ─── Action Handlers ────────────────────────────────────────────────────────
  const handleViewExam = (exam) => setViewExam(exam);

  const handleDeleteExam = async (examId) => {
    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE}/exams/delete/${examId}/`);
      setExams(prev => prev.filter(e => e.id !== examId));
      setDeleteConfirmId(null);
      toast.success("🗑️ Exam deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: { fontFamily: "'Outfit','Inter',sans-serif", fontWeight: 700 }
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete exam. Please try again.", {
        position: "top-right",
        autoClose: 4000,
        style: { fontFamily: "'Outfit','Inter',sans-serif", fontWeight: 700 }
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = exams.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.subject?.toLowerCase().includes(search.toLowerCase()) ||
    e.exam_type?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = exams.filter(e => e.status === "active").length;
  const scheduledCount = exams.filter(e => e.status !== "active").length;

  // ─── Styles ─────────────────────────────────────────────────────────────────
  const inp = {
    width:"100%", padding:"11px 14px", borderRadius:10, border:"1.5px solid #e2e8f0",
    fontSize:13, fontWeight:600, color:"#1e293b", background:"#f8fafc",
    outline:"none", boxSizing:"border-box"
  };
  const sel = { ...inp, cursor:"pointer" };
  const ta = { ...inp, resize:"vertical", minHeight:72 };
  const label = { display:"block", fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 };
  const g2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 };

  // ─── Step content ────────────────────────────────────────────────────────────
  const renderStep = () => {
    switch(step) {
      case 1: return (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label style={label}>Exam Title *</label><input style={inp} value={examTitle} onChange={e=>setExamTitle(e.target.value)} placeholder="e.g. Python Fundamentals – Batch 2024"/></div>
          <div>
            <label style={label}>Exam Type *</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {EXAM_TYPES.map(et=>(
                <div key={et.value} onClick={()=>setExamType(et.value)} style={{padding:"10px 12px",borderRadius:10,cursor:"pointer",border:`1.5px solid ${examType===et.value?"#6366f1":"#e2e8f0"}`,background:examType===et.value?"#eef2ff":"#f8fafc",display:"flex",alignItems:"center",gap:8,transition:"all 0.15s"}}>
                  <span style={{fontSize:16}}>{et.icon}</span>
                  <span style={{fontSize:11,fontWeight:700,color:examType===et.value?"#6366f1":"#64748b"}}>{et.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={g2}>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <label style={{...label,margin:0}}>Subject *</label>
                <button type="button" onClick={() => setCustomSubjectInput(!customSubjectInput)} style={{fontSize:10,fontWeight:700,color:"#6366f1",background:"none",border:"none",cursor:"pointer"}}>
                  {customSubjectInput ? "Select List" : "+ Add Custom"}
                </button>
              </div>
              {customSubjectInput ? (
                <input style={inp} value={subject} onChange={e=>setSubject(e.target.value.toUpperCase())} placeholder="ENTER CUSTOM SUBJECT"/>
              ) : (
                <select style={sel} value={subject} onChange={e => {
                  if (e.target.value === "__ADD_NEW__") {
                    setCustomSubjectInput(true);
                    setSubject("");
                  } else {
                    setSubject(e.target.value);
                  }
                }}>
                  {dynamicSubjects.map(s=><option key={s} value={s}>{s}</option>)}
                  <option value="__ADD_NEW__">+ Add Custom Subject...</option>
                </select>
              )}
            </div>

            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <label style={{...label,margin:0}}>Target Course</label>
                <button type="button" onClick={() => setCustomCourseInput(!customCourseInput)} style={{fontSize:10,fontWeight:700,color:"#6366f1",background:"none",border:"none",cursor:"pointer"}}>
                  {customCourseInput ? "Select List" : "+ Add Custom"}
                </button>
              </div>
              {customCourseInput ? (
                <input style={inp} value={course} onChange={e=>setCourse(e.target.value.toUpperCase())} placeholder="ENTER CUSTOM COURSE"/>
              ) : (
                <select style={sel} value={course} onChange={e => {
                  if (e.target.value === "__ADD_NEW__") {
                    setCustomCourseInput(true);
                    setCourse("");
                  } else {
                    setCourse(e.target.value);
                  }
                }}>
                  <option value="ALL COURSES">ALL COURSES</option>
                  {dynamicCourses.map(c=><option key={c} value={c}>{c}</option>)}
                  <option value="__ADD_NEW__">+ Add Custom Course...</option>
                </select>
              )}
            </div>
          </div>
          <div><label style={label}>Topic / Chapter</label><input style={inp} value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Functions, OOP, Modules"/></div>
          <div><label style={label}>Instructions (Optional)</label><textarea style={ta} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Exam instructions for students..." rows={2}/></div>
        </div>
      );

      case 2: return (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
            <NumInput label="Duration (min)" value={duration} onChange={setDuration} min={5} max={300}/>
            <NumInput label="Total Questions" value={totalQuestions} onChange={v=>{setTotalQuestions(v);setTotalMarks(v*marksPerQuestion);}} min={1} max={200}/>
            <NumInput label="Marks / Question" value={marksPerQuestion} onChange={v=>{setMarksPerQuestion(v);setTotalMarks(totalQuestions*v);}} min={1} max={10}/>
          </div>
          <div style={g2}>
            <NumInput label="Total Marks" value={totalMarks} onChange={setTotalMarks} min={1} max={500}/>
            <NumInput label="Pass Marks" value={passMarks} onChange={setPassMarks} min={0} max={totalMarks}/>
          </div>
          <div style={{padding:"14px 16px",background:"#fef9ee",borderRadius:12,border:"1.5px solid #fde68a"}}>
            <Toggle value={negativeMarking} onChange={setNegativeMarking} label="Enable Negative Marking" desc="Deduct marks for wrong answers"/>
            {negativeMarking && <div style={{marginTop:12}}><NumInput label="Marks Deducted per Wrong" value={negativeMarks} onChange={setNegativeMarks} min={0.25} max={5} unit="pts"/></div>}
          </div>
          <div style={{padding:"12px 16px",background:"#f0f9ff",borderRadius:10,border:"1px solid #bae6fd",fontSize:13,display:"flex",justifyContent:"space-between"}}>
            <span style={{color:"#64748b"}}>Pass Percentage:</span>
            <strong style={{color:"#16a34a"}}>{totalMarks>0?Math.round((passMarks/totalMarks)*100):0}%</strong>
          </div>
        </div>
      );

      case 3: return (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"flex",gap:6,padding:4,background:"#f1f5f9",borderRadius:12}}>
            {[{k:"manual",l:"✍️ Manual"},{k:"auto",l:"🤖 Auto Generate"},{k:"excel",l:"📁 Document Import"}].map(s=>(
              <button key={s.k} onClick={()=>setQuestionSource(s.k)} style={{flex:1,padding:"9px",borderRadius:10,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,background:questionSource===s.k?"#6366f1":"none",color:questionSource===s.k?"#fff":"#64748b",transition:"all 0.2s"}}>{s.l}</button>
            ))}
          </div>

          {questionSource==="manual" && (<>
            <div style={g2}>
              <div><label style={label}>Difficulty</label><select style={sel} value={qDifficulty} onChange={e=>setQDifficulty(e.target.value)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
              <NumInput label="Marks" value={qMarks} onChange={setQMarks} min={1} max={10}/>
            </div>
            <div><label style={label}>Question Text *</label><textarea style={ta} value={qText} onChange={e=>setQText(e.target.value)} placeholder="Enter question..." rows={2}/></div>
            <div>
              <label style={label}>Options & Correct Answer</label>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {qOptions.map((opt,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                    <button onClick={()=>setQCorrect(i)} style={{width:28,height:28,borderRadius:"50%",border:"none",cursor:"pointer",background:qCorrect===i?"#22c55e":"#f1f5f9",color:qCorrect===i?"#fff":"#94a3b8",fontWeight:800,fontSize:12,flexShrink:0}}>{String.fromCharCode(65+i)}</button>
                    <input style={{...inp,margin:0}} value={opt} onChange={e=>{const o=[...qOptions];o[i]=e.target.value;setQOptions(o);}} placeholder={`Option ${String.fromCharCode(65+i)}`}/>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleAddQuestion} style={{padding:"10px",borderRadius:10,border:"none",cursor:"pointer",background:"#1e293b",color:"#fff",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <FontAwesomeIcon icon={faPlus}/> Add Question to Draft
            </button>
          </>)}

          {questionSource==="auto" && (
            <div style={{padding:20,background:"linear-gradient(135deg,#1e1b4b,#312e81)",borderRadius:16,color:"#fff"}}>
              <div style={{fontWeight:800,fontSize:14,marginBottom:6}}>🤖 AI Auto-Generator</div>
              <div style={{color:"#a5b4fc",fontSize:12,marginBottom:16}}>Pick from Question Bank by difficulty (100 questions loaded per subject!)</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
                {[{l:"Easy",v:autoEasy,s:setAutoEasy,c:"#22c55e"},{l:"Medium",v:autoMedium,s:setAutoMedium,c:"#f59e0b"},{l:"Hard",v:autoHard,s:setAutoHard,c:"#ef4444"}].map(d=>(
                  <div key={d.l} style={{background:"rgba(255,255,255,0.08)",borderRadius:10,padding:12,textAlign:"center"}}>
                    <div style={{fontSize:10,color:d.c,fontWeight:800,marginBottom:8,textTransform:"uppercase"}}>{d.l}</div>
                    <input type="number" value={d.v} min={0} max={100} onChange={e=>d.s(parseInt(e.target.value)||0)}
                      style={{width:"100%",padding:"8px",borderRadius:8,border:"none",background:"rgba(255,255,255,0.12)",color:"#fff",fontSize:20,fontWeight:900,textAlign:"center"}}/>
                  </div>
                ))}
              </div>
              <button onClick={handleAutoGenerate} disabled={isGenerating} style={{width:"100%",padding:12,borderRadius:10,border:"none",cursor:"pointer",background:"#6366f1",color:"#fff",fontWeight:800,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                {isGenerating?<FontAwesomeIcon icon={faSpinner} spin/>:<FontAwesomeIcon icon={faRobot}/>}
                {isGenerating?"Generating...":"Generate & Import"}
              </button>
            </div>
          )}

          {questionSource==="excel" && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{padding:24,background:"#f8fafc",borderRadius:14,border:"2.5px dashed #cbd5e1",textAlign:"center",position:"relative"}}>
                {isUploading ? (
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                    <FontAwesomeIcon icon={faSpinner} spin style={{fontSize:32,color:"#6366f1"}}/>
                    <div style={{fontWeight:700,fontSize:14,color:"#64748b"}}>Parsing uploaded file...</div>
                  </div>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUpload} style={{fontSize:32,color:"#94a3b8",marginBottom:10}}/>
                    <div style={{fontWeight:700,fontSize:14,color:"#64748b",marginBottom:4}}>Upload Exam Document</div>
                    <div style={{fontSize:11,color:"#94a3b8",marginBottom:14}}>Supports PDF, Word (.docx), CSV, or Excel (.xlsx)</div>
                    <label style={{padding:"10px 20px",borderRadius:10,border:"none",cursor:"pointer",background:"#6366f1",color:"#fff",fontWeight:700,fontSize:13,display:"inline-flex",gap:8,alignItems:"center",margin:"0 auto"}}>
                      <FontAwesomeIcon icon={faFileAlt}/> Choose Document
                      <input type="file" accept=".xlsx,.xls,.csv,.docx,.pdf" style={{display:"none"}} onChange={handleFileUpload}/>
                    </label>
                  </>
                )}
              </div>

              {parsedQuestions.length > 0 && (
                <div style={{padding:16,background:"#f8fafc",borderRadius:14,border:"1.5px solid #e2e8f0"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={{fontWeight:800,fontSize:13,color:"#1e293b"}}>📋 Review Parsed Questions ({parsedQuestions.length})</div>
                    <button onClick={handleConfirmImport} style={{padding:"6px 14px",background:"#2563eb",color:"#fff",border:"none",borderRadius:8,fontWeight:800,fontSize:11,cursor:"pointer",boxShadow:"0 2px 4px rgba(37,99,235,0.2)"}}>
                      Import Checked Drafts
                    </button>
                  </div>
                  <div style={{maxHeight:300,overflowY:"auto",display:"flex",flexDirection:"column",gap:12}}>
                    {parsedQuestions.map((q,i)=>(
                      <div key={i} style={{padding:12,background:"#fff",borderRadius:10,border:"1px solid #cbd5e1",display:"flex",flexDirection:"column",gap:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",gap:10}}>
                          <div style={{flex:1}}>
                            <span style={{fontSize:11,fontWeight:800,color:"#6366f1",marginRight:6}}>Q{i+1}</span>
                            <textarea style={{...inp,margin:0,background:"#fff",padding:"6px 10px",fontSize:12}} value={q.question} 
                              onChange={e => {
                                const updated = [...parsedQuestions];
                                updated[i].question = e.target.value;
                                setParsedQuestions(updated);
                              }}/>
                          </div>
                          <button onClick={() => {
                            setParsedQuestions(prev => prev.filter((_, idx) => idx !== i));
                          }} style={{background:"none",border:"none",cursor:"pointer",color:"#ef4444",alignSelf:"flex-start",padding:4}}>
                            <FontAwesomeIcon icon={faTrash} style={{fontSize:12}}/>
                          </button>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                          {q.options.map((opt,oi)=>(
                            <div key={oi} style={{display:"flex",alignItems:"center",gap:6}}>
                              <button onClick={() => {
                                const updated = [...parsedQuestions];
                                updated[i].correct = oi;
                                setParsedQuestions(updated);
                              }} style={{
                                width:22,height:22,borderRadius:"50%",border:"none",cursor:"pointer",
                                background:q.correct===oi?"#22c55e":"#f1f5f9",
                                color:q.correct===oi?"#fff":"#64748b",
                                fontWeight:800,fontSize:10,flexShrink:0
                              }}>
                                {String.fromCharCode(65+oi)}
                              </button>
                              <input style={{...inp,margin:0,background:"#fff",padding:"4px 8px",fontSize:11}} value={opt} 
                                onChange={e => {
                                  const updated = [...parsedQuestions];
                                  updated[i].options[oi] = e.target.value;
                                  setParsedQuestions(updated);
                                }}/>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {questions.length>0 && (
            <div style={{padding:14,background:"#f0fdf4",borderRadius:12,border:"1px solid #bbf7d0"}}>
              <div style={{fontWeight:800,fontSize:12,color:"#166534",marginBottom:8}}> ✅ {questions.length} Questions in Draft</div>
              <div style={{maxHeight:140,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
                {questions.map((q,i)=>(
                  <div key={q.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:"#fff",borderRadius:8,border:"1px solid #dcfce7"}}>
                    <span style={{fontSize:11,fontWeight:800,color:"#16a34a",flexShrink:0}}>{i+1}.</span>
                    <span style={{fontSize:12,color:"#1e293b",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.question}</span>
                    <button onClick={()=>setQuestions(p=>p.filter(x=>x.id!==q.id))} style={{background:"none",border:"none",cursor:"pointer",color:"#fca5a5",flexShrink:0}}><FontAwesomeIcon icon={faTrash} style={{fontSize:11}}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

      case 4: return (
        <div style={{display:"flex",flexDirection:"column",gap:12,padding:"20px",background:"#f8fafc",borderRadius:12,border:"1.5px solid #e2e8f0",textAlign:"center",alignItems:"center"}}>
          <FontAwesomeIcon icon={faCamera} style={{fontSize:36,color:"#cbd5e1",marginBottom:12}}/>
          <div style={{fontWeight:800,fontSize:14,color:"#64748b"}}>Webcam Proctoring Disabled</div>
          <div style={{fontSize:12,color:"#94a3b8"}}>Webcam proctoring and face detection options are disabled.</div>
        </div>
      );

      case 5: return (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Toggle value={fullscreenRequired} onChange={setFullscreenRequired} label="Force Fullscreen" desc="Exiting fullscreen logs a violation"/>
          <Toggle value={disableCopyPaste} onChange={setDisableCopyPaste} label="Disable Copy & Paste" desc="Block Ctrl+C, Ctrl+V, clipboard access"/>
          <Toggle value={disableRightClick} onChange={setDisableRightClick} label="Disable Right Click" desc="Prevent context menu"/>
          <Toggle value={autoSubmit} onChange={setAutoSubmit} label="Auto-Submit on Risk Threshold" desc="Force-submit when violations exceed limit"/>
          <div style={g2}>
            <NumInput label="Tab Switch Limit" value={tabSwitchLimit} onChange={setTabSwitchLimit} min={0} max={10} unit="times"/>
            {autoSubmit&&<NumInput label="Risk Threshold" value={riskThreshold} onChange={setRiskThreshold} min={10} max={100} unit="pts"/>}
          </div>
        </div>
      );

      case 6: return (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={g2}>
            <div><label style={label}>Start Date & Time</label><input type="datetime-local" style={inp} value={startTime} onChange={e=>setStartTime(e.target.value)}/></div>
            <div><label style={label}>End Date & Time</label><input type="datetime-local" style={inp} value={endTime} onChange={e=>setEndTime(e.target.value)}/></div>
          </div>
          {startTime&&endTime&&new Date(endTime)>new Date(startTime)&&(
            <div style={{padding:"12px 16px",background:"#f0fdf4",borderRadius:10,border:"1px solid #bbf7d0",fontSize:12,color:"#166534",fontWeight:600}}>
              ✅ Exam window: {Math.round((new Date(endTime)-new Date(startTime))/3600000)} hours
            </div>
          )}
          <Toggle value={sendNotification} onChange={setSendNotification} label="Email Notifications" desc="Notify eligible students 1 hour before exam"/>
        </div>
      );

      case 7: return (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Toggle value={showResultImmediately} onChange={setShowResultImmediately} label="Show Result Immediately" desc="Students see score right after submission"/>
          <Toggle value={showCorrectAnswers} onChange={setShowCorrectAnswers} label="Show Correct Answers" desc="Reveal correct answers after submission"/>
          <Toggle value={showLeaderboard} onChange={setShowLeaderboard} label="Enable Leaderboard" desc="Display ranked scores publicly"/>
          <Toggle value={certificateEnabled} onChange={setCertificateEnabled} label="Enable Certificates" desc="Auto-generate certificates for passing students"/>
        </div>
      );

      case 8: return (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[
              {title:"Exam Identity",items:[["Title",examTitle||"—"],["Type",EXAM_TYPES.find(t=>t.value===examType)?.label],["Subject",subject],["Course",course]]},
              {title:"Configuration",items:[["Duration",`${duration} min`],["Questions",questions.length||totalQuestions],["Total Marks",totalMarks],["Pass Marks",`${passMarks} (${totalMarks>0?Math.round((passMarks/totalMarks)*100):0}%)`]]},
              {title:"Security",items:[["Fullscreen",fullscreenRequired?"✅ Forced":"❌ Off"],["Tab Limit",`${tabSwitchLimit} allowed`]]},
              {title:"Schedule",items:[["Start",startTime?new Date(startTime).toLocaleString():"Manual"],["End",endTime?new Date(endTime).toLocaleString():"Manual"]]},
            ].map(s=>(
              <div key={s.title} style={{padding:"14px 16px",background:"#f8fafc",borderRadius:12,border:"1px solid #e2e8f0"}}>
                <div style={{fontSize:10,fontWeight:800,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>{s.title}</div>
                {s.items.map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f1f5f9"}}>
                    <span style={{fontSize:11,color:"#94a3b8",fontWeight:600}}>{k}</span>
                    <span style={{fontSize:12,color:"#0f172a",fontWeight:700}}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div>
            {[{ok:!!examTitle.trim(),msg:"Exam title set"},{ok:questions.length>0,msg:`${questions.length} questions ready`},{ok:totalMarks>0,msg:"Marks configured"},{ok:!!startTime&&!!endTime,msg:"Schedule set"}]
              .map((c,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
                  <FontAwesomeIcon icon={c.ok?faCheckCircle:faTimesCircle} style={{color:c.ok?"#22c55e":"#f59e0b",fontSize:14}}/>
                  <span style={{fontSize:12,color:c.ok?"#166534":"#92400e",fontWeight:600}}>{c.msg}</span>
                </div>
              ))}
          </div>
        </div>
      );

      default: return null;
    }
  };

  // ─── Type badge color ───────────────────────────────────────────────────────
  const typeBadge = (type) => {
    const colors = {daily:"#3b82f6",weekly:"#8b5cf6",monthly:"#a855f7",placement:"#f59e0b",mock:"#ec4899",certification:"#22c55e"};
    return colors[type] || "#64748b";
  };

  // ─── Main Render ──────────────────────────────────────────────────────────
  return (
    <>
    <div style={{fontFamily:"'Outfit','Inter',sans-serif",color:"#1e293b",width:"100%"}}>
      <ToastContainer position="top-right"/>

      {/* ── Header Section ───────────────────────────────────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 180px 180px",gap:16,marginBottom:24}}>

        {/* Main Banner */}
        <div style={{background:"linear-gradient(135deg,#4338ca 0%,#6366f1 100%)",borderRadius:16,padding:"24px 28px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-20,top:-20,width:120,height:120,background:"rgba(255,255,255,0.07)",borderRadius:"50%"}}/>
          <div style={{position:"absolute",right:40,bottom:-30,width:80,height:80,background:"rgba(255,255,255,0.05)",borderRadius:"50%"}}/>
          <h1 style={{margin:0,fontSize:22,fontWeight:900,color:"#fff",marginBottom:6}}>Exam Manager</h1>
          <p style={{margin:"0 0 18px",fontSize:12,color:"rgba(255,255,255,0.7)"}}>Create and manage professional assessments</p>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button onClick={openModal} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,border:"none",cursor:"pointer",background:"#fff",color:"#4338ca",fontWeight:800,fontSize:13,boxShadow:"0 2px 12px rgba(0,0,0,0.15)"}}>
              <FontAwesomeIcon icon={faPlus}/> CREATE EXAM
            </button>
            <button onClick={() => navigate("/faculty/stats")} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",borderRadius:10,border:"none",cursor:"pointer",background:"rgba(255,255,255,0.25)",color:"#fff",fontWeight:800,fontSize:12}}>
              <FontAwesomeIcon icon={faChartBar}/> STUDENT REPORTS
            </button>
            <button onClick={fetchExams} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",borderRadius:10,border:"none",cursor:"pointer",background:"rgba(255,255,255,0.15)",color:"#fff",fontWeight:700,fontSize:12}}>
              <FontAwesomeIcon icon={faDatabase}/> REFRESH
            </button>
          </div>
        </div>

        {/* Stat: Active */}
        <div style={{background:"#f0fdf4",borderRadius:16,padding:"20px 24px",border:"1.5px solid #bbf7d0",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <div style={{width:40,height:40,background:"#dcfce7",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <FontAwesomeIcon icon={faCheckCircle} style={{color:"#16a34a",fontSize:18}}/>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Active Exams</div>
            <div style={{fontSize:32,fontWeight:900,color:"#16a34a"}}>{activeCount}</div>
          </div>
        </div>

        {/* Stat: Scheduled */}
        <div style={{background:"#fff7ed",borderRadius:16,padding:"20px 24px",border:"1.5px solid #fed7aa",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <div style={{width:40,height:40,background:"#ffedd5",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <FontAwesomeIcon icon={faCalendarAlt} style={{color:"#ea580c",fontSize:18}}/>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Scheduled</div>
            <div style={{fontSize:32,fontWeight:900,color:"#ea580c"}}>{scheduledCount}</div>
          </div>
        </div>
      </div>

      {/* ── Search Bar ───────────────────────────────────────────────────── */}
      <div style={{position:"relative",marginBottom:20,maxWidth:420}}>
        <FontAwesomeIcon icon={faSearch} style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"#94a3b8",fontSize:13}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by title, subject, or type..."
          style={{width:"100%",padding:"11px 14px 11px 38px",borderRadius:12,border:"1.5px solid #e2e8f0",fontSize:13,fontWeight:600,color:"#1e293b",background:"#fff",outline:"none",boxSizing:"border-box"}}/>
      </div>

      {/* ── Exam Table ───────────────────────────────────────────────────── */}
      <div style={{background:"#fff",borderRadius:16,border:"1.5px solid #f1f5f9",overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:"#f8fafc"}}>
              {["ID","EXAM DETAILS","TYPE","SUBJECT","DURATION","QUESTIONS","STATUS","ACTIONS"].map(h=>(
                <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:10,fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.08em",borderBottom:"1.5px solid #f1f5f9"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{padding:48,textAlign:"center",color:"#94a3b8"}}>
                <FontAwesomeIcon icon={faSpinner} spin style={{fontSize:24,marginBottom:8}}/><br/>Loading exams...
              </td></tr>
            ) : filtered.length===0 ? (
              <tr><td colSpan={8} style={{padding:48,textAlign:"center",color:"#94a3b8"}}>
                <FontAwesomeIcon icon={faClipboardList} style={{fontSize:32,marginBottom:10,display:"block"}}/> 
                {search ? "No exams match your search." : "No exams published yet. Click CREATE EXAM to get started."}
              </td></tr>
            ) : filtered.map((exam,i)=>(
              <tr key={exam.id} style={{borderBottom:"1px solid #f8fafc",transition:"background 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"14px 16px",fontSize:12,fontWeight:700,color:"#94a3b8"}}>{String(i+1).padStart(2,"0")}</td>
                <td style={{padding:"14px 16px"}}>
                  <div style={{fontWeight:800,fontSize:13,color:"#0f172a",marginBottom:2}}>{exam.title}</div>
                  <div style={{fontSize:11,color:"#94a3b8"}}>{exam.course || "—"}</div>
                </td>
                <td style={{padding:"14px 16px"}}>
                  <span style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:`${typeBadge(exam.exam_type)}18`,color:typeBadge(exam.exam_type)}}>
                    {EXAM_TYPES.find(t=>t.value===exam.exam_type)?.icon} {exam.exam_type}
                  </span>
                </td>
                <td style={{padding:"14px 16px",fontSize:12,fontWeight:700,color:"#1e293b"}}>{exam.subject}</td>
                <td style={{padding:"14px 16px",fontSize:12,fontWeight:700,color:"#1e293b"}}>{exam.duration} min</td>
                <td style={{padding:"14px 16px",fontSize:12,fontWeight:700,color:"#1e293b"}}>{exam.total_questions}</td>
                <td style={{padding:"14px 16px"}}>
                  <span style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:exam.status==="active"?"#dcfce7":"#f1f5f9",color:exam.status==="active"?"#16a34a":"#64748b"}}>
                    {exam.status||"scheduled"}
                  </span>
                </td>
                <td style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",gap:8}}>
                    <button title="View Student Reports" onClick={() => navigate("/faculty/stats")}
                      style={{width:30,height:30,borderRadius:8,border:"1px solid #dcfce7",background:"#f0fdf4",cursor:"pointer",color:"#16a34a",transition:"all 0.15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background="#dcfce7";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="#f0fdf4";}}>
                      <FontAwesomeIcon icon={faChartBar} style={{fontSize:12}}/>
                    </button>
                    <button title="View Details" onClick={() => handleViewExam(exam)}
                      style={{width:30,height:30,borderRadius:8,border:"1px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",color:"#64748b",transition:"all 0.15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background="#f1f5f9";e.currentTarget.style.color="#1e293b";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="#f8fafc";e.currentTarget.style.color="#64748b";}}>
                      <FontAwesomeIcon icon={faEye} style={{fontSize:12}}/>
                    </button>
                    <button title="Edit Exam" onClick={() => { toast.info("✏️ Edit: Re-create the exam with the same settings.", {autoClose:3000}); }}
                      style={{width:30,height:30,borderRadius:8,border:"1px solid #e0e7ff",background:"#eef2ff",cursor:"pointer",color:"#6366f1",transition:"all 0.15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background="#e0e7ff";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="#eef2ff";}}>
                      <FontAwesomeIcon icon={faEdit} style={{fontSize:12}}/>
                    </button>
                    <button title="Delete Exam" onClick={() => setDeleteConfirmId(exam.id)}
                      style={{width:30,height:30,borderRadius:8,border:"1px solid #fee2e2",background:"#fef2f2",cursor:"pointer",color:"#ef4444",transition:"all 0.15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background="#fee2e2";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="#fef2f2";}}>
                      <FontAwesomeIcon icon={faTrash} style={{fontSize:12}}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {showModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",backdropFilter:"blur(4px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:640,maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 25px 60px rgba(0,0,0,0.3)"}}>

            {/* Modal Header */}
            <div style={{padding:"18px 24px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:16,fontWeight:900,color:"#0f172a"}}>Create New Exam</div>
                <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>Step {step} of 8 — {STEPS[step-1].label}</div>
              </div>
              <button onClick={closeModal} style={{width:32,height:32,borderRadius:8,border:"1px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",color:"#64748b",fontSize:16}}>
                <FontAwesomeIcon icon={faTimes}/>
              </button>
            </div>

            {/* Step tabs */}
            <div style={{display:"flex",overflowX:"auto",padding:"10px 24px 0",gap:4,background:"#fafafa",borderBottom:"1px solid #f1f5f9"}}>
              {STEPS.map(s=>{
                const done = s.id < step;
                const active = s.id === step;
                return (
                  <button key={s.id} onClick={()=>setStep(s.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:"8px 8px 0 0",border:"none",cursor:"pointer",whiteSpace:"nowrap",fontSize:11,fontWeight:active?800:600,
                    background:active?"#fff":done?"#f0fdf4":"transparent",
                    color:active?"#6366f1":done?"#16a34a":"#94a3b8",
                    borderBottom:active?"2px solid #6366f1":"2px solid transparent"}}>
                    {done&&!active ? <FontAwesomeIcon icon={faCheck} style={{fontSize:9,color:"#16a34a"}}/> : <FontAwesomeIcon icon={s.icon} style={{fontSize:9}}/>}
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Progress bar */}
            <div style={{height:3,background:"#f1f5f9"}}>
              <div style={{height:"100%",width:`${(step/8)*100}%`,background:"linear-gradient(90deg,#6366f1,#a855f7)",transition:"width 0.3s"}}/>
            </div>

            {/* Step body */}
            <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
              {renderStep()}
            </div>

            {/* Modal Footer */}
            <div style={{padding:"14px 24px",borderTop:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#fafbff"}}>
              <div style={{fontSize:11,color:"#94a3b8"}}>Step <strong style={{color:"#6366f1"}}>{step}</strong>/8</div>
              <div style={{display:"flex",gap:10}}>
                {step>1&&<button onClick={()=>setStep(s=>s-1)} style={{padding:"9px 18px",borderRadius:10,border:"1px solid #e2e8f0",background:"#fff",cursor:"pointer",fontWeight:700,fontSize:12,color:"#64748b",display:"flex",alignItems:"center",gap:6}}>
                  <FontAwesomeIcon icon={faArrowLeft}/> Back
                </button>}
                {step<8 ? (
                  <button onClick={()=>setStep(s=>s+1)} style={{padding:"9px 20px",borderRadius:10,border:"none",cursor:"pointer",background:"#6366f1",color:"#fff",fontWeight:800,fontSize:12,display:"flex",alignItems:"center",gap:6}}>
                    Next <FontAwesomeIcon icon={faArrowRight}/>
                  </button>
                ) : (
                  <button onClick={handlePublish} disabled={isPublishing} style={{padding:"9px 20px",borderRadius:10,border:"none",cursor:"pointer",background:"#22c55e",color:"#fff",fontWeight:800,fontSize:12,display:"flex",alignItems:"center",gap:6}}>
                    {isPublishing?<FontAwesomeIcon icon={faSpinner} spin/>:<FontAwesomeIcon icon={faPaperPlane}/>}
                    {isPublishing?"Publishing...":"Publish Exam"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* ── View Exam Details Modal ────────────────────────────────────────── */}
      {viewExam && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",backdropFilter:"blur(4px)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
          onClick={() => setViewExam(null)}>
          <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:560,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 25px 60px rgba(0,0,0,0.3)"}}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{padding:"18px 24px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",background:"linear-gradient(135deg,#4338ca,#6366f1)",borderRadius:"20px 20px 0 0"}}>
              <div>
                <div style={{fontSize:16,fontWeight:900,color:"#fff"}}>{viewExam.title}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginTop:2}}>
                  {EXAM_TYPES.find(t=>t.value===viewExam.exam_type)?.icon} {viewExam.exam_type?.toUpperCase()} · {viewExam.subject}
                </div>
              </div>
              <button onClick={() => setViewExam(null)} style={{width:32,height:32,borderRadius:8,border:"1px solid rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.15)",cursor:"pointer",color:"#fff",fontSize:16}}>
                <FontAwesomeIcon icon={faTimes}/>
              </button>
            </div>
            {/* Body */}
            <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:14}}>
              {[
                {title:"Exam Info",rows:[["Title",viewExam.title],["Type",viewExam.exam_type],["Subject",viewExam.subject],["Course",viewExam.course||"—"]]},
                {title:"Configuration",rows:[["Duration",`${viewExam.duration} min`],["Total Questions",viewExam.total_questions],["Total Marks",viewExam.total_marks],["Pass Marks",viewExam.pass_marks]]},
                {title:"Status & Schedule",rows:[["Status",viewExam.status||"scheduled"],["Start Time",viewExam.start_time?new Date(viewExam.start_time).toLocaleString():"Manual"],["End Time",viewExam.end_time?new Date(viewExam.end_time).toLocaleString():"Manual"],["Paper ID",viewExam.paper_id||"—"]]},
              ].map(section => (
                <div key={section.title} style={{background:"#f8fafc",borderRadius:12,padding:"14px 16px",border:"1px solid #f1f5f9"}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>{section.title}</div>
                  {section.rows.map(([k,v]) => (
                    <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f1f5f9"}}>
                      <span style={{fontSize:12,color:"#94a3b8",fontWeight:600}}>{k}</span>
                      <span style={{fontSize:12,color:"#0f172a",fontWeight:700}}>{String(v??"—")}</span>
                    </div>
                  ))}
                </div>
              ))}
              {viewExam.settings && (
                <div style={{background:"#fafbff",borderRadius:12,padding:"14px 16px",border:"1px solid #e0e7ff"}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#6366f1",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Security Settings</div>
                  {[["Fullscreen Required",viewExam.settings.fullscreen_required?"✅ Yes":"❌ No"],["Randomize Questions",viewExam.settings.randomize_questions?"✅ Yes":"❌ No"],["Negative Marking",viewExam.settings.negative_marking?`✅ -${viewExam.settings.negative_marks}pts`:"❌ No"],["Departments",viewExam.settings.departments?.length?viewExam.settings.departments.join(", "):"All"],["Years",viewExam.settings.years?.length?viewExam.settings.years.join(", "):"All"]].map(([k,v]) => (
                    <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #eef2ff"}}>
                      <span style={{fontSize:12,color:"#94a3b8",fontWeight:600}}>{k}</span>
                      <span style={{fontSize:12,color:"#0f172a",fontWeight:700}}>{String(v??"—")}</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setViewExam(null)} style={{padding:"10px",borderRadius:10,border:"none",cursor:"pointer",background:"#6366f1",color:"#fff",fontWeight:800,fontSize:13,marginTop:4}}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ───────────────────────────────────────────── */}
      {deleteConfirmId !== null && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.65)",backdropFilter:"blur(4px)",zIndex:1200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
          onClick={() => !isDeleting && setDeleteConfirmId(null)}>
          <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:400,padding:"28px 28px 24px",boxShadow:"0 25px 60px rgba(0,0,0,0.3)",textAlign:"center"}}
            onClick={e => e.stopPropagation()}>
            <div style={{width:56,height:56,background:"#fef2f2",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
              <FontAwesomeIcon icon={faTrash} style={{fontSize:22,color:"#ef4444"}}/>
            </div>
            <div style={{fontSize:17,fontWeight:900,color:"#0f172a",marginBottom:8}}>Delete Exam?</div>
            <div style={{fontSize:13,color:"#64748b",marginBottom:24,lineHeight:1.6}}>
              This action is <strong>permanent</strong> and cannot be undone.<br/>The exam and all its data will be removed.
            </div>
            <div style={{display:"flex",gap:12,justifyContent:"center"}}>
              <button disabled={isDeleting} onClick={() => setDeleteConfirmId(null)}
                style={{padding:"10px 24px",borderRadius:10,border:"1.5px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontWeight:700,fontSize:13,color:"#64748b"}}>
                Cancel
              </button>
              <button disabled={isDeleting} onClick={() => handleDeleteExam(deleteConfirmId)}
                style={{padding:"10px 24px",borderRadius:10,border:"none",cursor:isDeleting?"not-allowed":"pointer",background:"#ef4444",color:"#fff",fontWeight:800,fontSize:13,display:"flex",alignItems:"center",gap:8,opacity:isDeleting?0.7:1}}>
                {isDeleting ? <FontAwesomeIcon icon={faSpinner} spin/> : <FontAwesomeIcon icon={faTrash}/>}
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
